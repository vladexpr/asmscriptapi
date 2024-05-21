### Dependencies

- https://jestjs.io/
- https://www.albertgao.xyz/2017/05/24/how-to-test-expressjs-with-jest-and-supertest/
- https://expressjs.com/

### Misc

- [astexplorer.net](https://astexplorer.net/)
- [binaryen](https://github.com/AssemblyScript/binaryen.js/)
- https://madewithwebassembly.com/

### WebAssembly

- [Documentation](https://www.assemblyscript.org/compiler.html#transforms)
- [CLI entry point](https://github.com/AssemblyScript/assemblyscript/blob/main/cli/index.js)
- [Compilter options](https://github.com/AssemblyScript/assemblyscript/blob/main/cli/options.json)
- [ast](https://github.com/AssemblyScript/assemblyscript/blob/main/src/ast.ts)
- [parser](https://github.com/AssemblyScript/assemblyscript/blob/main/src/parser.ts)
- [compiler](https://github.com/AssemblyScript/assemblyscript/blob/64cba2e22bc415994274dd14eeae50a5a9369d70/src/compiler.ts)
- [index-wasm.ts](https://github.com/AssemblyScript/assemblyscript/blob/main/src/index-wasm.ts)

### How to

Transform AST to TS code:

```ts
ASTBuilder.build(source);
```

[How to user parser example](https://github.com/AssemblyScript/assemblyscript/blob/main/tests/parser.js)
