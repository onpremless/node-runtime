import { createServer } from "node:http";
import type {
  IncomingHttpHeaders,
  IncomingMessage,
  RequestListener,
  Server,
  ServerResponse,
} from "node:http";
import { Readable, Stream } from "node:stream";

export type LambdaInput = {
  method: string;
  headers: Map<string, string[]>;
  url: URL;
  body: Readable;
};

export type LambdaBody = NodeJS.ReadableStream | Buffer | string | any; // Yes but no.

export type LambdaOutput = {
  statusCode: number;
  headers: Map<string, string[]>;
  body: LambdaBody;
};

export type Lambda = (input: LambdaInput) => Promise<LambdaOutput>;

function wrap(
  lambda: Lambda,
): RequestListener<typeof IncomingMessage, typeof ServerResponse> {
  return async (req, res) => {
    const input: LambdaInput = {
      method: req.method ?? "GET",
      headers: unifyHeaders(req.headers),
      url: new URL(
        req.url ?? "",
        `${req.headers.schema ?? "http"}://${req.headers.host ?? "localhost"}`,
      ),
      body: req,
    };

    const output = await lambda(input);

    res.statusCode = output.statusCode;
    for (const [key, value] of output.headers.entries()) {
      res.setHeader(key, value);
    }

    if (output.body instanceof Buffer) {
      res.end(output.body, "binary");
      return;
    }

    if (output.body instanceof Stream) {
      output.body.pipe(res);
      return;
    }

    if (typeof output.body === "string") {
      res.end(output.body);
      return;
    }

    res.end(JSON.stringify(output.body));
  };
}

function unifyHeaders(headers: IncomingHttpHeaders): Map<string, string[]> {
  const result = new Map<string, string[]>();
  for (const [key, value] of Object.entries(headers)) {
    if (Array.isArray(value)) {
      result.set(key, value);
    } else if (value === undefined) {
      result.set(key, []);
    } else {
      result.set(key, [value]);
    }
  }
  return result;
}

export function lambda(l: Lambda): Server {
  const hostname = "0.0.0.0";
  const port = 3000;
  const wlambda = wrap(l);
  const server = createServer((req, res) => {
    if (req.url?.startsWith("/health")) {
      res.statusCode = 200;
      return;
    }

    wlambda(req, res);
  });

  return server.listen(port, hostname, () => {
    console.log(`Server running at http://${hostname}:${port}/`);
  });
}
