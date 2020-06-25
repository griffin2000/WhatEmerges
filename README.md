# WhatEmerges
3D art project based on iso-surfaces

Generates an isosurface based on volume produced by JS front end.  Uses the Dual Marching Cubes library (https://github.com/dominikwodniok/dualmc) compiled to WASM via emscripten, executed in a web worker.  

The volume is generated via a "kernel" as snippet of JS code that is executed on the worker thread for each voxel.  The main thread sends a kernel and region of the volume to generate data for. 

