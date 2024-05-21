import { beforeAll, afterAll, describe, test, expect } from "vitest";
import { asciiToUintArr, base64Decode, base64Encode } from "../src/util.js";
import { TEST_PORT, postJSON, startServer, stopServer } from "./util.js";

beforeAll(startServer);
afterAll(stopServer);

const HOST = `http://localhost:${TEST_PORT}`;

describe("GET /health", () => {
  test("returns success", async () => {
    let res = await fetch(`${HOST}/healthz`);
    expect(res.status).toEqual(200);
    expect(await res.text()).toEqual("OK");
  });
});

describe("POST /compile", () => {
  const URL = `${HOST}/compile`;

  let PROGRAM_TEXT = `
    export function add(a: i32, b: i32): i32 {
      return a + b;
    }
  `;

  test("show compiler version", async () => {
    let body = { params: ["--version"] };

    let res = await postJSON(URL, body);
    expect(res.status).toEqual(200);

    let { success, error, stdout, stderr } = await res.json();
    expect(success).toEqual(true);
    expect(error).toEqual(null);
    expect(stdout).toEqual("Version 0.27.27\n");
    expect(stderr).toEqual("");
  });

  test("compile and run wasm file", async () => {
    let body = {
      files: {
        "assembly/index.ts": base64Encode(PROGRAM_TEXT),
      },
      params: ["assembly/index.ts", "--outFile", "build/index.wasm"],
    };

    let res = await postJSON(URL, body);
    expect(res.status).toEqual(200);

    let json = await res.json();
    expect(json.success).toEqual(true);
    expect(json.error).toBeNull();
    expect(json.stdout).toEqual("");
    expect(json.stderr).toEqual("");
    expect(json.notFoundFiles).toEqual(["asconfig.json"]);
    expect(json.diagnosticMessages).toEqual([]);

    let wasmAscii = json.files["build/index.wasm"].ascii;
    expect(wasmAscii).toBeTruthy();

    let wasmBytes = asciiToUintArr(wasmAscii);

    let module = await WebAssembly.compile(wasmBytes);
    let instance = await WebAssembly.instantiate(module);

    // @ts-ignore
    let result = instance.exports.add(5, 7);

    expect(result).toEqual(12);
  });

  test("compile and run wasm text file", async () => {
    let body = {
      files: {
        "assembly/index.ts": base64Encode(PROGRAM_TEXT),
      },
      params: ["assembly/index.ts", "--textFile", "build/index.wat"],
    };

    let res = await postJSON(URL, body);
    expect(res.status).toEqual(200);

    let json = await res.json();
    expect(json.success).toEqual(true);
    expect(json.error).toBeNull();
    expect(json.stdout).toEqual("");
    expect(json.stderr).toEqual("");
    expect(json.notFoundFiles).toEqual(["asconfig.json"]);
    expect(json.diagnosticMessages).toEqual([]);

    let wasmBase64 = json.files["build/index.wat"].base64;
    expect(wasmBase64).toBeTruthy();

    let wasmText = base64Decode(wasmBase64);
    expect(wasmText).toContain(
      "func $assembly/index/add (param $0 i32) (param $1 i32) (result i32)",
    );
  });

  test("compile with stats option", async () => {
    let body = {
      files: {
        "assembly/index.ts": base64Encode(PROGRAM_TEXT),
      },
      params: ["assembly/index.ts", "--outFile", "build/index.wasm", "--stats"],
    };

    let res = await postJSON(URL, body);
    expect(res.status).toEqual(200);

    let json = await res.json();
    expect(json.success).toEqual(true);

    let stats = json.stats;
    expect(stats.compileCount).toEqual(1);
    expect(stats.compileTime).toBeGreaterThanOrEqual(0);
    expect(stats.emitCount).toEqual(1);
    expect(stats.emitTime).toBeGreaterThanOrEqual(0);
    expect(stats.initializeCount).toEqual(1);
    expect(stats.initializeTime).toBeGreaterThanOrEqual(0);
    expect(stats.optimizeCount).toEqual(1);
    expect(stats.optimizeTime).toBeGreaterThanOrEqual(0);
    expect(stats.parseCount).toBeGreaterThanOrEqual(0); // Also includes libraries
    expect(stats.parseTime).toBeGreaterThanOrEqual(0);
    expect(stats.readCount).toEqual(0);
    expect(stats.total).toBeGreaterThanOrEqual(0);
    expect(stats.transformCount).toEqual(0);
    expect(stats.transformTime).toBeGreaterThanOrEqual(0);
    expect(stats.validateCount).toEqual(1);
    expect(stats.validateTime).toBeGreaterThanOrEqual(0);
    expect(stats.writeCount).toEqual(0);
  });

  test("returns AST", async () => {
    let expectedAST = [
      {
        kind: "Variable",
        range: { start: 0, end: 9 },
        decorators: null,
        declarations: [
          {
            kind: "VariableDeclaration",
            range: { start: 4, end: 9 },
            name: {
              kind: "Identifier",
              range: { start: 4, end: 5 },
              text: "a",
              isQuoted: false,
            },
            decorators: null,
            flags: ["Let"],
            overriddenModuleName: null,
            type: null,
            initializer: {
              kind: "Literal",
              range: { start: 8, end: 9 },
              literalKind: 1,
              value: { low: 1, high: 0, unsigned: false },
            },
          },
        ],
      },
    ];

    let body = {
      files: {
        "index.ts": base64Encode(`let a = 1;`),
      },
      params: ["index.ts"],
      incudeAST: true,
    };

    let res = await postJSON(URL, body);
    expect(res.status).toEqual(200);

    let json = await res.json();
    expect(json.success).toEqual(true);

    let astBase64 = json.ast_files["index.ts"];
    expect(astBase64).toBeTruthy();

    let astString = base64Decode(astBase64);
    let ast = JSON.parse(astString);

    expect(ast).toEqual(expectedAST);
  });

  test("compilation warnings", async () => {
    let PROGRAM_WITH_WARNING = `
      export namespace A {
      }
    `;
    let body = {
      files: {
        "index.ts": base64Encode(PROGRAM_WITH_WARNING),
      },
      params: ["index.ts", "--outFile", "index.wasm"],
    };

    let res = await postJSON(URL, body);
    expect(res.status).toEqual(200);

    let json = await res.json();
    expect(json.success).toEqual(true);
    expect(json.error).toEqual(null);
    expect(json.stdout).toEqual("");
    expect(json.stderr).toContain(
      "WARNING AS235: Only variables, functions and enums become WebAssembly module exports.",
    );
    expect(json.stderr).toContain("export namespace A {");
    expect(json.stderr).toContain("in index.ts(2,24)");
    expect(json.notFoundFiles).toEqual(["asconfig.json"]);

    expect(json.diagnosticMessages).toEqual([
      {
        category: 2,
        code: 235,
        message:
          "Only variables, functions and enums become WebAssembly module exports.",
        range: {
          start: 24,
          end: 25,
          source: { normalizedPath: "index.ts" },
        },
        relatedRange: null,
      },
    ]);
  });

  test("compilation error", async () => {
    let WILL_NOT_COMPILE = `
      export function add(a: i32, b: i32): i32 {
        return a + b + c;
      }
    `;
    let body = {
      files: {
        "index.ts": base64Encode(WILL_NOT_COMPILE),
      },
      params: ["index.ts", "--outFile", "index.wasm"],
    };

    let res = await postJSON(URL, body);
    expect(res.status).toEqual(200);

    let json = await res.json();
    expect(json.success).toEqual(false);
    expect(json.error).toEqual({
      name: "Error",
      message: "1 compile error(s)",
      stack: "1 compile error(s)",
    });
    expect(json.stdout).toEqual("");
    expect(json.stderr).toContain("ERROR TS2304: Cannot find name 'c'");
    expect(json.stderr).toContain("return a + b + c;");
    expect(json.stderr).toContain("in index.ts(3,24)");
    expect(json.notFoundFiles).toEqual(["asconfig.json"]);
    expect(json.files).toEqual({});

    expect(json.diagnosticMessages).toEqual([
      {
        category: 3,
        code: 2304,
        message: "Cannot find name 'c'.",
        range: {
          start: 73,
          end: 74,
          source: { normalizedPath: "index.ts" },
        },
        relatedRange: null,
      },
    ]);
  });
});
