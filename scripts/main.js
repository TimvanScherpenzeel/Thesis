/*

 dMMMMMMP dMP dMP .dMMMb        
   dMP   dMP dMP dMP" VP        Bachelor thesis - Simulating cloth in WebGL
  dMP   dMP dMP  VMMMb          Copyright (c) 2016 Tim van Scherpenzeel
 dMP    YMvAP" dP .dMP          https://www.timvanscherpenzeel.com
dMP      VP"   VMMMP"

*/

// Cloth size
var clothWidth = clothHeight = 100;

// Clock for wind simulation
var clock = new THREE.Clock();

// Simulation count
var count = 0;

mobile = (/(iPad|iPhone|iPod)/g.test(navigator.userAgent)) ? true : false; // Samsung Galaxy S7 Edge reports a user agent of X11, not Android

// iOS devices only support half floats
// https://github.com/yomboprime/GPGPU-threejs-demos/issues/5
// https://stackoverflow.com/questions/13976091/floating-point-textures-in-opengl-es-2-0-on-ios-without-clamping-them-to-0-1
// "GL_OES_texture_float" is supported when printing glGetString(GL_EXTENSIONS) on iOS devices however it does not actually work.
floatType = (mobile) ? THREE.HalfFloatType : THREE.FloatType;

function init () {
    container = document.createElement('div');
    stats = new Stats();
    stats.domElement.style.position = 'absolute';
    stats.domElement.style.left = '10px';
    stats.domElement.style.top = '10px';
    container.appendChild(stats.domElement);

    document.body.appendChild(container);
    canvas = document.createElement('canvas');

    renderer = new THREE.WebGLRenderer({ 
        canvas: canvas,
        // antialias: true
    });

    // renderer.setClearColor( 0xffffff, 1);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    container.appendChild(renderer.domElement);

    scene = new THREE.Scene();

    camera = new THREE.PerspectiveCamera(40, window.innerWidth / window.innerHeight, 1, 10000);
    camera.position.set(60, 100, 123);
    camera.lookAt(scene.position);

    camControl = new THREE.OrbitControls(camera, renderer.domElement);

    scene.add(camera);

    // General lighting
    ambientLight = new THREE.AmbientLight(0x666666);
    scene.add(ambientLight);

    directionalLight = new THREE.DirectionalLight(0xdfebff, 0.7);
    directionalLight.position.set(50, 200, 100);
    directionalLight.position.multiplyScalar(1.3);
    scene.add(directionalLight);

    // Pin holder meshes
    pinHolderTextureLoader = new THREE.TextureLoader();
    pinHolderTexture = pinHolderTextureLoader.load('textures/pin.jpg');
    pinHolderGeometry = new THREE.CylinderGeometry(0.45, 0.55, 1.35, 32);
    pinHolderMaterial = new THREE.MeshPhongMaterial({ 
        color: 0xffffff, 
        specular: 0x111111, 
        shininess: 30, 
        map: pinHolderTexture 
    });

    // Pin holder 1
    pinHolderMesh1 = new THREE.Mesh(pinHolderGeometry, pinHolderMaterial);
    pinHolderMesh1.position.set(49.0, 50, 0.45);
    pinHolderMesh1.rotation.x = Math.PI / 2;
    scene.add(pinHolderMesh1);

    // Pin holder 2
    pinHolderMesh2 = new THREE.Mesh(pinHolderGeometry, pinHolderMaterial);
    pinHolderMesh2.position.set(0.5, 50, 0.45);
    pinHolderMesh2.rotation.x = Math.PI / 2;
    scene.add(pinHolderMesh2);
    
    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Typed_arrays
    // Construct the data arrays of cloth in typed array views (R,G,B,A)
    data = new Float32Array(clothWidth * clothHeight * 4);  
    for (var i = 0, t = 0, x = 0; x < clothWidth; x++) {
        for (var y = 0; y < clothHeight; y++) {
            data[i + 0] = x * 1.0 / clothWidth;
            data[i + 1] = 1.0;
            data[i + 2] = y * 1.0 / clothHeight;
            data[i + 3] = 1.0;
            i += 4;
        }
    }

    // https://threejs.org/docs/?q=Data#Reference/Textures/DataTexture
    texture = new THREE.DataTexture(data, clothWidth, clothHeight, THREE.RGBAFormat, THREE.FloatType);
    texture.needsUpdate = true;

    gpgpu = new GPGPU(renderer);
    simulationShader = new GPGPU.SimulationShader();
    simulationShader.setOriginsTexture(texture);

    // http://mrdoob.com/lab/javascript/webgl/particles/particles_zz85.html + https://github.com/toji/webgl2-particles
    // Set up an off-screen targets to render the data textures to
    rtTexturePos = new THREE.WebGLRenderTarget(clothWidth, clothHeight, {
         wrapS: THREE.ClampToEdgeWrapping,
         wrapT: THREE.ClampToEdgeWrapping,
         minFilter: THREE.NearestFilter,
         magFilter: THREE.NearestFilter,
         format: THREE.RGBAFormat,
         type: floatType,
         stencilBuffer: false
    });

    // Clone the off-screen render target to allow for ping-pong FBO's
    rtTexturePos2 = rtTexturePos.clone();

    // http://mrdoob.com/lab/javascript/webgl/particles/particles_zz85.html
    // Construct the geometry and faces of the cloth
    geometry = new THREE.Geometry();

    for (var i = 0, l = clothWidth * clothHeight; i < l; i++) {
        var vertex = new THREE.Vector3();
        vertex.x = (i % clothWidth) / clothWidth;
        vertex.y = Math.floor(i / clothWidth) / clothHeight;
        geometry.vertices.push(vertex);
    }

    for (var x = 0; x < clothWidth - 1; x++) {
        for (var y = 0; y < clothHeight - 1; y++) {

            var v0 = x + clothWidth * y;
            var v1 = x + clothWidth * y + clothHeight;

            geometry.faces.push(new THREE.Face3(v1 + 1, v0, v1));
            geometry.faces.push(new THREE.Face3(v1, v0 + 1, v0));
            geometry.faces.push(new THREE.Face3(v1, v1 + 1, v0 + 1));
            geometry.faces.push(new THREE.Face3(v0 + 1, v1, v0));
            geometry.faces.push(new THREE.Face3(v1 + 1, v1, v0 + 1));
        }
    }

    // Cloth texture
    var clothTextures = ["textures/cloth_1.jpg", "textures/cloth_2.jpg", "textures/cloth_3.jpg"];
    var randomClothTexture = clothTextures[ Math.floor(Math.random() * clothTextures.length) ];
    var clothTexture = new THREE.TextureLoader().load(randomClothTexture);
    clothTexture.wrapS = clothTexture.wrapT = THREE.ClampToEdgeWrapping;

    clothMaterial = new THREE.ShaderMaterial({
        uniforms: {
            "tex": { type: "t", value: clothTexture },
            "map": { type: "t", value: texture },
            "width": { type: "f", value: clothWidth },
            "height": { type: "f", value: clothHeight },
            "camPos": { type: "v3", value: camera.position }
        },
        vertexShader: document.getElementById('vs-particles').textContent,
        fragmentShader: document.getElementById('fs-particles').textContent,
        blending: THREE.AdditiveBlending,
        depthWrite: true,
        depthTest: true,
        wireframe: gui.getWireframe()
    });

    // Combine the geometry and clothMaterial to form a mesh
    mesh = new THREE.Mesh(geometry, clothMaterial);

    // Scale the mesh as a whole
    mesh.scale.set(50, 50, 50);

    // Add the mesh to the scene
    scene.add(mesh);
}

function onWindowResize () {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

window.addEventListener('resize', onWindowResize, false);

function render () {

    //console.log(camera.position);

    stats.begin();

    // Wireframe toggle
    clothMaterial.wireframe = gui.getWireframe();

    var i = gui.getSimulationSpeed();
    
    while(i > 0){
        i--;

        simulationShader.setTimer(gui.getTimeStep());

        // set the current positions 
        simulationShader.setPositionsTexture(rtTexturePos);

        if (count < 15) {
            gpgpu.initVel(simulationShader);
        }

        if (count > 20) {
            simulationShader.setStart(0);
        }

        gpgpu.pass(simulationShader, rtTexturePos2, gui);
        clothMaterial.uniforms.map.value = rtTexturePos;

        // Switch the reference pointers to the position FBO to ping-pong
        var buffer = rtTexturePos;
        rtTexturePos = rtTexturePos2;
        rtTexturePos2 = buffer;

        count++;
    }

    camControl.update();

    renderer.render(scene, camera);

    stats.end();

    requestAnimationFrame(render);
}

gui = new gui(mobile);
gui.init();

init();

render();