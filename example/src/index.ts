import * as L from '@onpremless/node-20';

L.lambda(async (input) => {
  return {
    statusCode: 200,
    headers: new Map(
      [["explanation", ["I am the echo!"]]],
    ),
    body: input.body,
  }
});
