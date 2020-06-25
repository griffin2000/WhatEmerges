//// Web worker entry pointer, runs kernels and builds ISO-surface
import * as THREE from 'three';
//Import the Emscripten module
import DC   from './em/js/dc.js';


// Command queue (received from main thread)
let commands = [];

//Wait for emscripten to load....
DC().then((mod)=>{

 
    console.time("alloc volume");
    //Hard coded 64x64x64 volume (due to emscripten bug performance is still an issue)
    const w = 64;
    const h = 64;
    const d = 64;
          
    //Create the volume (value returned is raw emscripten int, just an offset into emscripten heap)
    const vol =mod._createVolume(w,h,d);
    //Create the data for the volume (flat C++ array of shorts)
    const ptr = mod._getVolumeData(vol);
    //Map the volume data on heap to a JS typed array 
    const volumeBuffer = new Uint16Array(mod.HEAP8.buffer, mod.HEAP8.byteOffset+ptr, w*h*d);


    console.timeEnd("alloc volume");

    //Create the iso surface object 
    const isoPtr = mod._createIsoSurface();

    //One "dry run" to force JITing of emscripten code 
    mod._buildIsoSurface(isoPtr, vol,  32767);

    //Frame function, executed every 50ms to check for new commands
    const isoFrame = ()=>{
      //Do wew have commands to execute?
      if(commands.length>0) {


        console.time("fill volume");

        const dims = new THREE.Vector3(w,h,d);
        //Get a copy of new commands and clear the global queue
        const cmds = commands;
        commands = [];

        const regionSize = new THREE.Vector3();
        const regionStart = new THREE.Vector3();
        
        for(let i=0;i<cmds.length;i++) {
          //Values passed via webworker message do not have Vector3 prototype
          regionSize.copy(cmds[i].regionSize);
          regionStart.copy(cmds[i].regionStart);

          //Run the kernel function for the command
          cmds[i].kernelFunction(regionStart,regionSize,dims,volumeBuffer, THREE);
        }

        console.timeEnd("fill volume");
      

        //Build the iso-surface
        console.time("create iso");
        mod._buildIsoSurface(isoPtr, vol,  32767);
        console.timeEnd("create iso");

        //Get the vertex and index data from emscripten
        const vertPtr = mod._getIsoSurfacePosition(isoPtr);
        const normPtr = mod._getIsoSurfaceNormal(isoPtr);
        const vertCount = mod._getIsoSurfaceVertexCount(isoPtr)*3;
        const indPtr = mod._getIsoSurfaceIndices(isoPtr);
        const indCount = mod._getIsoSurfaceIndexCount(isoPtr);

        const xferBuffer= new ArrayBuffer(vertCount*4*2+ indCount*4);
        const vertBuffer = new Float32Array(mod.HEAP8.buffer, mod.HEAP8.byteOffset+vertPtr,vertCount);
        const normBuffer = new Float32Array(mod.HEAP8.buffer, mod.HEAP8.byteOffset+normPtr,vertCount);
        const indBuffer = new Uint32Array(mod.HEAP8.buffer, mod.HEAP8.byteOffset+indPtr,indCount);

        //Send back to main thread via "transferable" array buffer
        const xferVertBuffer = new Float32Array(xferBuffer, 0, vertCount);
        const xferNormBuffer = new Float32Array(xferBuffer, xferVertBuffer.byteLength, vertCount);
        const xferIndBuffer = new Uint32Array(xferBuffer, xferVertBuffer.byteLength+xferNormBuffer.byteLength, indCount);
        
        xferVertBuffer.set(vertBuffer);
        xferNormBuffer.set(normBuffer);
        xferIndBuffer.set(indBuffer);

        postMessage(
          { indCount, 
            indOffset:xferVertBuffer.byteLength+xferNormBuffer.byteLength,
            vertCount, 
            vertOffset:0,
            normOffset:vertBuffer.byteLength, 
            buffer:xferBuffer},
          [xferBuffer]
        );
      }
  
      //Execute again in 50ms
      setTimeout(isoFrame,50);
    }
    isoFrame();
});

//Message handler for commands from main thread
self.addEventListener('message', function(e) {
  const {regionStart,regionSize,kernel} = e.data;

  //Build a function from the kernel string received from main thread
  const func = new Function("regionStart","regionSize","globalDims","volume","THREE", `
    const localCoord = new THREE.Vector3();
    const localDims = regionSize;
    const invLocalDims = new THREE.Vector3(
      1.0/(localDims.x-1),
      1.0/(localDims.y-1),
      1.0/(localDims.z-1),
    );
    
    const globalCoord = new THREE.Vector3();
    const invGlobalDims = new THREE.Vector3(
      1.0/(globalDims.x-1),
      1.0/(globalDims.y-1),
      1.0/(globalDims.z-1),
    );
    const v0 = new THREE.Vector3();
    const v1 = new THREE.Vector3();
    const v2 = new THREE.Vector3();
    const v3 = new THREE.Vector3();
    const setVolumeValue = (coord, floatVal)=>{
      const idx=coord.x + coord.y * globalDims.x + coord.z * globalDims.x * globalDims.y; 
      volume[idx]  = Math.min(~~(floatVal*0xffff), 0xffff);
    }
    const addVolumeValue = (coord, floatVal)=>{
      const idx=coord.x + coord.y * globalDims.x + coord.z * globalDims.x * globalDims.y; 
      volume[idx] = Math.min(volume[idx]+~~(floatVal*0xffff), 0xffff);
    }
    for(let i=0;i<regionSize.x && i<globalDims.x-regionStart.x;i++) {
      for(let j=0;j<regionSize.y  && j<globalDims.y-regionStart.y;j++) {
        for(let k=0;k<regionSize.z  && k<globalDims.z-regionStart.z;k++) {
          localCoord.set(k,j,i);
          globalCoord.addVectors(localCoord,regionStart);

          ${kernel}

        }
      }    
    }
  `);

  //Max queue depth of 50 commands (commands ignored after that)
  if(commands.length<50) {
    commands.push({
      regionSize,
      regionStart,
      kernelFunction: func,
    });
  
  }
}, false);



 