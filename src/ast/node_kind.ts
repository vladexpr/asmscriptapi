let nodeKindMap = {
  Source: 0,
  NamedType: 1,
  FunctionType: 2,
  TypeName: 3,
  TypeParameter: 4,
  Parameter: 5,
  Identifier: 6,
  Assertion: 7,
  Binary: 8,
  Call: 9,
  Class: 10,
  Comma: 11,
  ElementAccess: 12,
  False: 13,
  Function: 14,
  InstanceOf: 15,
  Literal: 16,
  New: 17,
  Null: 18,
  Omitted: 19,
  Parenthesized: 20,
  PropertyAccess: 21,
  Ternary: 22,
  Super: 23,
  This: 24,
  True: 25,
  Constructor: 26,
  UnaryPostfix: 27,
  UnaryPrefix: 28,
  Compiled: 29,
  Block: 30,
  Break: 31,
  Continue: 32,
  Do: 33,
  Empty: 34,
  Export: 35,
  ExportDefault: 36,
  ExportImport: 37,
  Expression: 38,
  For: 39,
  ForOf: 40,
  If: 41,
  Import: 42,
  Return: 43,
  Switch: 44,
  Throw: 45,
  Try: 46,
  Variable: 47,
  Void: 48,
  While: 49,
  Module: 50,
  ClassDeclaration: 51,
  EnumDeclaration: 52,
  EnumValueDeclaration: 53,
  FieldDeclaration: 54,
  FunctionDeclaration: 55,
  ImportDeclaration: 56,
  InterfaceDeclaration: 57,
  MethodDeclaration: 58,
  NamespaceDeclaration: 59,
  TypeDeclaration: 60,
  VariableDeclaration: 61,
  Decorator: 62,
  ExportMember: 63,
  SwitchCase: 64,
  IndexSignature: 65,
  Comment: 66,
};

function buildNodeKindMap(): ReadonlyMap<Number, String> {
  let result = new Map<Number, String>();
  Object.keys(nodeKindMap).forEach((name) => {
    // @ts-ignore
    let code = nodeKindMap[name];
    result.set(code, name);
  });
  return result;
}

export const NODE_KIND_MAP = buildNodeKindMap();
