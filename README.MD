
# About

Allows to use [assemblyscript](https://www.assemblyscript.org/)'s [compiler](https://www.assemblyscript.org/compiler.html) from any language/stack by calling a REST-like API.

Use cases:
- Compile assemblyscript into WASM/WAT files
- Generating js/ts bindings
- Getting compilation statistics
- Getting compilation errors/warning in a structured way

## Buid and run

Running the application:
```bash
npm run build

npm run start # production mode
npm run dev   # dev mode with hot reload
```

Running tests
```bash
npm run test       # run all tests once
npm run test_watch # run all tests in watch mode
```

Run linter
```bash
npm run lint
```

## Getting started

1. Run build and run the application (read above, `npm run build` and `npm run start`)

2. Prepare a assemblyscript program. The simplest example is, `index.ts`:
```ts
export function add(a: i32, b: i32): i32 {
  return a + b;
}
```

3. Encode it into `base64`. It will be `ZXhwb3J0IGZ1bmN0aW9uIGFkZChhOiBpMzIsIGI6IGkzMik6IGkzMiB7CiAgcmV0dXJuIGEgKyBiOwp9`

4. Call HTTP API:
```bash
curl --location 'http://localhost:3000/compile' \
--header 'Content-Type: application/json' \
--data '{
    "params": ["index.ts", "--outFile", "index.wasm"],
    "files": {
        "index.ts": "ZXhwb3J0IGZ1bmN0aW9uIGFkZChhOiBpMzIsIGI6IGkzMik6IGkzMiB7CiAgcmV0dXJuIGEgKyBiOwp9"
    }
}'
```

5. The response fill be similar to (some sections and fields were removed for simplicity):
```json
{
    "success": true,
    "error": null,
    "stdout": "",
    "stderr": "",
    "files": {
        "index.wasm": {
            "ascii":"wasm content, encoded into ascii"
        }
    },
    "ast_files": {},
    "notFoundFiles": [
        "asconfig.json"
    ],
    "stats": {},
    "diagnosticMessages": []
}
```

6. Extract string field `files/index.wasm/ascii` from the payload of the responsse, convert it into bytes:
```ts
let wasmAscii = response.json().files["build/index.wasm"].ascii;

function asciiToUintArr(s: string): Uint8Array {
  let decoded = new Uint8Array(s.length);
  for (let i = 0; i < s.length; i++) {
    decoded[i] = s.charCodeAt(i);
  }
  return decoded;
}

let wasmBytes = asciiToUintArr(wasmAscii);
```

7. And run it!
```ts
let module = await WebAssembly.compile(wasmBytes);
let instance = await WebAssembly.instantiate(module);

console.log(instance.exports.add(5, 7)); // prints 12
```

See [tests/index.test.ts](https://github.com/vladexpr/asmscriptapi/blob/main/tests/index.test.ts) for more examples.

## More examples

This service is a dumb proxy to AssemblyScript compiler, so it is possible to pass any [supported by the compiler](https://www.assemblyscript.org/compiler.html#compiler-options) options in `params` array of the JSON payload in the request:
```json
"params": ["index.ts", "--outFile", "index.wasm", "--stats"],
```

Files that are "visible" for the compiler should be base64-encoded and places into `files` section of the payload. They should be represented as a map (cannonical name => base64 content):
```json
"files": {
  "index.ts": "ZXhwb3J0IGZ1bmN0aW9uIGFkZChhOiBpMzIsIGI6IGkzMik6IGkzMiB7CiAgcmV0dXJuIGEgKyBiOwp9"
}
```

Files, produced by the compiler are put into `files` section of the payload in the response. Binary files are ASCII-encoded, text files are base64-encoded. `stdout` and `stderr` are broadcasted from the compiler "as is". If the compiler can not find a file, the name will appear in the `notFoundFiles` array. `diagnosticMessages` contains array of structured warnings and errors from the compiler. `stats` section consisnts of the statistics returned by the compiler, it does not include HTTP request processing time.

See [tests/index.test.ts](https://github.com/vladexpr/asmscriptapi/blob/main/tests/index.test.ts) for more examples.

## Configuration

Configuration of the HTTP Server is done through environment variables:
- `PORT` - default is `3000`
- `MAX_BODY_SIZE` - default is `100kb`
- `REQUEST_TIMEOUT` - default is `1s`

See [src/env.ts](https://github.com/vladexpr/asmscriptapi/blob/main/src/env.ts)
