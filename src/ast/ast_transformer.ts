import { Range } from "assemblyscript/dist/assemblyscript.js";
import { Parser } from "types:assemblyscript/src/parser";
import { NODE_KIND_MAP } from "./node_kind";
import { extractCommonFlags } from "./common_flags";
import { TOKENS_MAP } from "./token";

function replacer(key: any, value: any) {
  if (key == "kind" && Number.isInteger(value)) {
    return NODE_KIND_MAP.get(value) || value;
  }

  if (key == "flags" && Number.isInteger(value)) {
    return extractCommonFlags(value);
  }

  if (key == "operator" && Number.isInteger(value)) {
    return TOKENS_MAP.get(value) || value;
  }

  if (key == "arrowKind" && Number.isInteger(value)) {
    switch (value) {
      case 0: {
        return "None";
      }
      case 1: {
        return "Parenthesized";
      }
      case 2: {
        return "Single";
      }
      default: {
        return value;
      }
    }
  }

  if (value instanceof Range) {
    // Excluding source to prevent circular reference
    return {
      start: value.start,
      end: value.end,
    };
  }

  return value;
}

export function transformAST(parser: Parser, files: any): Map<string, string> {
  let result = new Map<string, string>();
  let sources = parser.sources;

  for (var source of sources) {
    let path = source.normalizedPath;

    if (files[path] == null) {
      continue;
    }

    let json = JSON.stringify(source.statements, replacer);
    result.set(path, json);
  }

  return result;
}
