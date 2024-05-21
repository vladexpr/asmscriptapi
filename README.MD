
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

## Configuration

Configuration is done through environment variables.