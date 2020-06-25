import * as THREE from 'three';
import { BufferAttribute } from 'three';

  
  async function init() {

    var worker = new Worker('/dist/createIsoThread.js');

   

    //var loader = new GLTFLoader();

    var camera, scene, renderer;
  
    camera = new THREE.PerspectiveCamera( 70, window.innerWidth / window.innerHeight, 1, 10000 );
    camera.position.x = 32;
    camera.position.y = 32;
    camera.position.z = 100;

    scene = new THREE.Scene();


    const canvas = document.getElementById("canvas");
    
    renderer = new THREE.WebGLRenderer( { antialias: true, canvas } );
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize( window.innerWidth, window.innerHeight );
    renderer.setClearColor ( new THREE.Color(0x2222aa));

    const annotVals = [];
    //scene.add(mesh);

    window.addEventListener( 'resize', onWindowResize, false );

    function onWindowResize() {

      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
  
      renderer.setSize( window.innerWidth, window.innerHeight );
  
    }


    var light = new THREE.HemisphereLight( 0xffffbb, 0x080820, 0.1 );
    scene.add( light );
    var directionalLight = new THREE.DirectionalLight( 0xffffff);
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


    const mtl =  new THREE.MeshStandardMaterial({
      color:0xff0000,
      side: THREE.DoubleSide,
      //wireframe:true,
    })
    const sphere = new THREE.Mesh(
      geom,
     mtl,
    );
    scene.add(sphere);

    scene.add( directionalLight.target );
    directionalLight.target.position.x = 0.0;
    directionalLight.target.position.y = 0.0;
    directionalLight.target.position.z = -100.0;
    scene.add( directionalLight );

    async function animate() {
  
      
      requestAnimationFrame( animate );
  
      renderer.render( scene, camera );
  
    }

    let frameIdx =0;
    function updateVolume() {

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

      worker.postMessage({
        regionStart:new THREE.Vector3(x-regionDim2,y-regionDim2,z),
        regionSize:new THREE.Vector3(regionDim,regionDim,regionDim),
        kernel: `
        v0.copy(localDims);
        v0.multiplyScalar(0.5);
        v1.subVectors(localCoord, v0);
        
        let v = v1.length()/${regionDim2};
        v = Math.min(v,1.0);
        v = 1.0-v;
  
        addVolumeValue(globalCoord, v);
        
        `,
      });

      frameIdx++;
      if(frameIdx>30) {
        mtl.wireframe=true;
      }
      setTimeout( updateVolume, 500 );

    }

    updateVolume();
    animate();

    worker.addEventListener('message', function(e) {  

      
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