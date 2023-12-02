"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.lambda = void 0;
const node_http_1 = require("node:http");
const node_stream_1 = require("node:stream");
function wrap(lambda) {
    return (req, res) => __awaiter(this, void 0, void 0, function* () {
        var _a, _b, _c, _d;
        const input = {
            method: (_a = req.method) !== null && _a !== void 0 ? _a : "GET",
            headers: unifyHeaders(req.headers),
            url: new URL((_b = req.url) !== null && _b !== void 0 ? _b : "", `${(_c = req.headers.schema) !== null && _c !== void 0 ? _c : "http"}://${(_d = req.headers.host) !== null && _d !== void 0 ? _d : "localhost"}`),
            body: req,
        };
        const output = yield lambda(input);
        res.statusCode = output.statusCode;
        for (const [key, value] of output.headers.entries()) {
            res.setHeader(key, value);
        }
        if (output.body instanceof Buffer) {
            res.end(output.body, "binary");
            return;
        }
        if (output.body instanceof node_stream_1.Stream) {
            output.body.pipe(res);
            return;
        }
        if (typeof output.body === "string") {
            res.end(output.body);
            return;
        }
        res.end(JSON.stringify(output.body));
    });
}
function unifyHeaders(headers) {
    const result = new Map();
    for (const [key, value] of Object.entries(headers)) {
        if (Array.isArray(value)) {
            result.set(key, value);
        }
        else if (value === undefined) {
            result.set(key, []);
        }
        else {
            result.set(key, [value]);
        }
    }
    return result;
}
function lambda(l) {
    const hostname = "0.0.0.0";
    const port = 3000;
    const wlambda = wrap(l);
    const server = (0, node_http_1.createServer)((req, res) => {
        var _a;
        if ((_a = req.url) === null || _a === void 0 ? void 0 : _a.startsWith("/health")) {
            res.statusCode = 200;
            return;
        }
        wlambda(req, res);
    });
    return server.listen(port, hostname, () => {
        console.log(`Server running at http://${hostname}:${port}/`);
    });
}
exports.lambda = lambda;
