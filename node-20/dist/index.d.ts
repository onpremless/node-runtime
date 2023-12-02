/// <reference types="node" />
/// <reference types="node" />
/// <reference types="node" />
/// <reference types="node" />
import type { Server } from "node:http";
import { Readable } from "node:stream";
export type LambdaInput = {
    method: string;
    headers: Map<string, string[]>;
    url: URL;
    body: Readable;
};
export type LambdaBody = NodeJS.ReadableStream | Buffer | string | any;
export type LambdaOutput = {
    statusCode: number;
    headers: Map<string, string[]>;
    body: LambdaBody;
};
export type Lambda = (input: LambdaInput) => Promise<LambdaOutput>;
export declare function lambda(l: Lambda): Server;
