
call  emcc    main.cpp IsoSurface.cpp -O3  -o js/dc.js -std=c++17 -DEMSCRIPTEN=1 -s MODULARIZE=1 -s EXPORT_NAME=DC -s EXPORTED_FUNCTIONS="['_malloc']" -s TOTAL_MEMORY=1048576000
mv js/*.wasm ../..