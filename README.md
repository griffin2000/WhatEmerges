# WhatEmerges
3D art project based on iso-surfaces

Generates an isosurface based on volume produced by JS front end.  Uses the Dual Marching Cubes library (https://github.com/dominikwodniok/dualmc) compiled to WASM via emscripten, executed in a web worker.  

The volume is generated via a "kernel" as snippet of JS code that is executed on the worker thread for each voxel.  The main thread sends a kernel and region of the volume to generate data for. 

The "raw" high performance emscripten C interface is used, so the C++ code avoids features (such as smart pointers) that cannot be supported by that interface.

## Running

Compiled versions of the Emscripten WASM and JS wrapper are checked in, but the included windows batch file [build.bat](src/em/build.bat) can be used to compile if needed.

To run the application from the root folder enter:
```
yarn install
yarn start
```

Then go to http://localhost:8080/ in a web browser.
