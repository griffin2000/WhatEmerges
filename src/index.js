//Main front-end file that renders to canvas 
import * as THREE from 'three';
import { BufferAttribute } from 'three';

  
async function init() {

    //Start the iso-surface thread
    var worker = new Worker('/dist/createIsoThread.js');

    var camera, scene, renderer;
  
    //Create a camera
    camera = new THREE.PerspectiveCamera( 70, window.innerWidth / window.innerHeight, 1, 10000 );
    camera.position.x = 32;
    camera.position.y = 32;
    camera.position.z = 100;

    scene = new THREE.Scene();


    //Create a THREE renderer from canvas
    const canvas = document.getElementById("canvas");
    
    renderer = new THREE.WebGLRenderer( { antialias: true, canvas } );
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize( window.innerWidth, window.innerHeight );
    renderer.setClearColor ( new THREE.Color(0x2222aa));

    //Handle window resizes
    window.addEventListener( 'resize', onWindowResize, false );

    function onWindowResize() {

      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
  
      renderer.setSize( window.innerWidth, window.innerHeight );
  
    }


    //Add lights
    var light = new THREE.HemisphereLight( 0xffffbb, 0x080820, 0.1 );
    scene.add( light );
    var directionalLight = new THREE.DirectionalLight( 0xffffff);
    scene.add( directionalLight.target );
    directionalLight.target.position.x = 0.0;
    directionalLight.target.position.y = 0.0;
    directionalLight.target.position.z = -100.0;
    scene.add( directionalLight );

    //Add the iso-surface mesh (initially just a single quad)
    const pos = new Float32Array([
      -1,-1,0,
      +1,-1,0,
      -1,+1,0,
      +1,+1,0,
    ]);
    const norm = new Float32Array([
      0,0,1,
      0,0,1,
      0,0,1,
      0,0,1,
    ]);
    const ind = new Uint32Array([
      0,1,2,
      3,2,1,
    ]);

    const geom = new THREE.BufferGeometry();
    geom.setIndex(new BufferAttribute(ind,1));
    geom.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3, false));
    geom.setAttribute("normal", new THREE.Float32BufferAttribute(norm, 3, true));
    geom.computeBoundingBox();

    //Just plain red material for now
    const mtl =  new THREE.MeshStandardMaterial({
      color:0xff0000,
      side: THREE.DoubleSide,
      //wireframe:true,
    })
    const isosurface = new THREE.Mesh(
      geom,
      mtl,
    );
    scene.add(isosurface);


    async function animate() {
  
      
      requestAnimationFrame( animate );
  
      renderer.render( scene, camera );
  
    }


    //Update the volume via the worker thread
    let frameIdx =0;
    function updateVolume() {


      //Rotate a spherical region around the volume, setting values as you go
      const regionDim = 8;
      const regionDim2 = regionDim/2;
      const r = 25;
      const cx = 32;
      const cy = 32;
      const cz = 32;
      const vr = r * Math.abs(Math.sin(frameIdx*0.02));

      const x = ~~(cx + vr * Math.cos(frameIdx*0.1));
      const y = ~~(cy + vr * Math.sin(frameIdx*0.1));
      const z = ~~(cz + vr * Math.sin(frameIdx*0.02));

      //Send kernel to the worker thread
      worker.postMessage({
        regionStart:new THREE.Vector3(x-regionDim2,y-regionDim2,z),
        regionSize:new THREE.Vector3(regionDim,regionDim,regionDim),
        kernel: `

        //Calculate middle of volume
        v0.copy(localDims);
        v0.multiplyScalar(0.5);
        //Get distance from middle of volume
        v1.subVectors(localCoord, v0);
        
        //Get inverse of distance to center (clamped by region size)
        let v = v1.length()/${regionDim2};
        v = Math.min(v,1.0);
        v = 1.0-v;
  
        addVolumeValue(globalCoord, v);
        
        `,
      });

      frameIdx++;

      //Update every 0.5s (should be faster but emscripten performance bug means that would blow up the command queue)
      setTimeout( updateVolume, 50 );

    }

    updateVolume();
    animate();

    //Receive message from worker thread
    worker.addEventListener('message', function(e) {  


      //Update the geometry based on the iso-surface vertex and index data received from thread
      const msg = e.data;
      console.log("Received "+msg.indCount+" indices")
      const buffer = msg.buffer;
      const pos = new Float32Array(buffer,msg.vertOffset,msg.vertCount);
      const norm = new Float32Array(buffer,msg.normOffset,msg.vertCount);
      const ind = new Uint32Array(buffer,msg.indOffset,msg.indCount);
      geom.setIndex(new BufferAttribute(ind,1));
      geom.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3, false));
      geom.setAttribute("normal", new THREE.Float32BufferAttribute(norm, 3, false));
      geom.computeBoundingBox();
  
    }, false);
  }


  init().then(()=>{
    console.log("Done");
  })