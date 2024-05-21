import { CommonFlags } from "types:assemblyscript/src/index-js";

let commonFlags = {
  /** No flags set. */
  None: 0,
  /** Has an `import` modifier. */
  Import: 1,
  /** Has an `export` modifier. */
  Export: 2,
  /** Has a `declare` modifier. */
  Declare: 4,
  /** Has a `const` modifier. */
  Const: 8,
  /** Has a `let` modifier. */
  Let: 16,
  /** Has a `static` modifier. */
  Static: 32,
  /** Has a `readonly` modifier. */
  Readonly: 64,
  /** Has an `abstract` modifier. */
  Abstract: 128,
  /** Has a `public` modifier. */
  Public: 256,
  /** Has a `private` modifier. */
  Private: 512,
  /** Has a `protected` modifier. */
  Protected: 1024,
  /** Has a `get` modifier. */
  Get: 2048,
  /** Has a `set` modifier. */
  Set: 4096,
  /** Has a `override` modifier.  */
  Override: 8192,
  /** Has a definite assignment assertion `!` as in `x!: i32;`. */
  DefinitelyAssigned: 16384,
  /** Is ambient, that is either declared or nested in a declared element. */
  Ambient: 32768,
  /** Is generic. */
  Generic: 65536,
  /** Is part of a generic context. */
  GenericContext: 131072,
  /** Is an instance member. */
  Instance: 262144,
  /** Is a constructor. */
  Constructor: 524288,
  /** Is a module export. */
  ModuleExport: 1048576,
  /** Is a module import. */
  ModuleImport: 2097152,
  /** Is resolved. */
  Resolved: 4194304,
  /** Is compiled. */
  Compiled: 8388608,
  /** Did error. */
  Errored: 16777216,
  /** Has a constant value and is therefore inlined. */
  Inlined: 33554432,
  /** Is scoped. */
  Scoped: 67108864,
  /** Is a stub. */
  Stub: 134217728,
  /** Is an overridden method. */
  Overridden: 268435456,
  /** Is (part of) a closure. */
  Closure: 536870912,
  /** Is quoted. */
  Quoted: 1073741824,
  /** Is internally nullable. */
  InternallyNullable: -2147483648,
};

export function extractCommonFlags(flags: CommonFlags): Array<string> | number {
  let result = Array<string>();

  Object.keys(commonFlags).forEach((name) => {
    // @ts-ignore
    let flagValue = commonFlags[name];

    if (flags & flagValue) {
      result.push(name);
    }
  });

  return result;
}
