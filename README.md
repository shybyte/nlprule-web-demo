# nlprule-web-demo
Web Demo for https://github.com/bminixhofer/nlprule.

You can find it online at https://shybyte.github.io/nlprule-web-demo/.

## Prerequisites

### Install tools

* NodeJS 14 (https://nodejs.org/en/)
* wasm-pack (https://rustwasm.github.io/wasm-pack/installer/)
  `curl https://rustwasm.github.io/wasm-pack/installer/init.sh -sSf | sh`

## Build and start in dev mode

### Build nlprule wasm

```bash
 cd nlprule-wasm
 wasm-pack build
 cd ..
```

### Start minimal-example in dev mode

```bash
 cd minimal-example
 npm start
```

### Start webworker-example in dev mode

```bash
 cd webworker-example
 npm start
```

### Start webworker-example-solid in dev mode

```bash
 cd webworker-example-solid
 npm start
```


## License

MIT

## Copyright

Copyright (c) 2021 Marco Stahl