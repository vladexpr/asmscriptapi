import express, { NextFunction, Request, Response } from "express";
import { MAX_BODY_SIZE, REQUEST_TIMEOUT } from "./env.js";
import { base64Decode, base64Encode, uintArrToAscii } from "./util.js";
import compression from "compression";
import timeout from "connect-timeout";

import { main, DiagnosticMessage } from "assemblyscript/dist/asc.js";
import { transformAST } from "./ast/ast_transformer.js";
import { Parser } from "types:assemblyscript/src/parser";

export const app = express();

app.use(compression());
app.use(timeout(REQUEST_TIMEOUT));
app.use(
  express.json({
    inflate: true,
    limit: MAX_BODY_SIZE,
    strict: true,
    type: "application/json",
  }),
);

app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  return res.status(500).send(serializeError(err));
});

app.get("/healthz", (_req: Request, res: Response) => {
  res.send("OK");
});

app.post("/compile", async (req: Request, res: Response) => {
  let outputFiles = new Map<string, string>();
  let ast = new Map<string, string>();
  let notFoundFiles = new Set<string>();
  let diagnosticMessages = new Array();

  let astTransformer = (parser: Parser) => {
    transformAST(parser, req.body.files).forEach((value, key) => {
      ast.set(key, base64Encode(value));
    });
  };

  let astTransformers = new Array<any>();
  if (req.body.incudeAST) {
    astTransformers.push({ afterParse: astTransformer });
  }

  let { error, stdout, stderr, stats } = await main(req.body.params, {
    readFile: (filename, _basedir) => {
      let base64Encoded = req.body.files[filename];
      if (base64Encoded) {
        return base64Decode(base64Encoded);
      } else {
        notFoundFiles.add(filename);
        return null;
      }
    },

    listFiles: (_dirname, _baseDir) => {
      // Deny any possible access to the host file system
      // TODO: Needed for libraries/modules, not supported yet.
      return [];
    },

    writeFile: (filename, contents, _baseDir) => {
      var content: any = null;
      if (contents instanceof Uint8Array) {
        content = { ascii: uintArrToAscii(contents) };
      } else {
        content = { base64: base64Encode(contents) };
      }
      outputFiles.set(filename, content);
    },

    transforms: astTransformers,

    reportDiagnostic: (diagnosticMessage: DiagnosticMessage) => {
      diagnosticMessages.push({
        code: diagnosticMessage.code,
        category: diagnosticMessage.category,
        message: diagnosticMessage.message,
        range: diagnosticMessage.range,
        relatedRange: diagnosticMessage.relatedRange,
      });
    },
  });

  res.send({
    success: error == null,
    error: serializeError(error),
    stdout: stdout.toString(),
    stderr: stderr.toString(),
    files: Object.fromEntries(outputFiles),
    ast_files: Object.fromEntries(ast),
    notFoundFiles: Array.from(notFoundFiles),
    stats: stats,
    diagnosticMessages: diagnosticMessages,
  });
});

function serializeError(error: Error | null) {
  if (error == null) {
    return null;
  }
  return {
    name: error.name,
    message: error.message,
    stack: error.stack,
  };
}
