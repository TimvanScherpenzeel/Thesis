var container, canvas, gl,stats;

// iOS devices only support half floats
// https://github.com/yomboprime/GPGPU-threejs-demos/issues/5
// https://stackoverflow.com/questions/13976091/floating-point-textures-in-opengl-es-2-0-on-ios-without-clamping-them-to-0-1
// "GL_OES_texture_float" is supported when printing glGetString(GL_EXTENSIONS) on iOS devices however it does not actually work.
var floatType = (/(iPad|iPhone|iPod)/g.test(navigator.userAgent)) ? THREE.HalfFloatType : THREE.FloatType;

// Simulation count
var count = 0;

// Clock for wind simulation
var clock = new THREE.Clock();

// Cloth size
var cloth_w = cloth_h = 100;

// GUI
var gui;

var geometry;

var scene, camera, light, camControl, renderer;

var data, vtxIds, texture, points; 

var fboParticles, rtTexturePos, rtTexturePos2, simulationShader;

function init() {
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
        context: gl,
        // antialias: true 
    });

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
    data = new Float32Array(cloth_w * cloth_h * 4);
    vtxIds = new Float32Array(cloth_w * cloth_h * 4);
    
    for (var i = 0, t = 0, x = 0; x < cloth_w; x++) {
        for (var y = 0; y < cloth_h; y++) {
            data[i + 0] = x * 1.0 / cloth_w;
            data[i + 1] = 1.0;
            data[i + 2] = y * 1.0 / cloth_h;
            data[i + 3] = 0.1;

            vtxIds[i + 0] = t;
            vtxIds[i + 1] = t;
            vtxIds[i + 2] = t;
            vtxIds[i + 3] = t;

            i += 4;
            t++;
        }
    }

    // https://threejs.org/docs/?q=Data#Reference/Textures/DataTexture
    texture = new THREE.DataTexture(data, cloth_w, cloth_h, THREE.RGBAFormat, THREE.FloatType);
    texture.needsUpdate = true;

    gpgpu = new GPGPU(renderer);
    simulationShader = new GPGPU.SimulationShader();
    simulationShader.setOriginsTexture(texture);

    // http://mrdoob.com/lab/javascript/webgl/particles/particles_zz85.html + https://github.com/toji/webgl2-particles
    // Set up an off-screen targets to render the data textures to
    rtTexturePos = new THREE.WebGLRenderTarget(cloth_w, cloth_h, {
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

    for (var i = 0, l = cloth_w * cloth_h; i < l; i++) {
        var vertex = new THREE.Vector3();
        vertex.x = (i % cloth_w) / cloth_w;
        vertex.y = Math.floor(i / cloth_w) / cloth_h;
        geometry.vertices.push(vertex);
    }

    for (var x = 0; x < cloth_w - 1; x++) {
        for (var y = 0; y < cloth_h - 1; y++) {

            var v0 = x + cloth_w * y;
            var v1 = x + cloth_w * y + cloth_h;

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
            "width": { type: "f", value: cloth_w },
            "height": { type: "f", value: cloth_h },
            "camPos": { type: "v3", value: camera.position }
        },
        vertexShader: document.getElementById('vs-particles').textContent,
        fragmentShader: document.getElementById('fs-particles').textContent,
        blending: THREE.AdditiveBlending,
        depthWrite: true,
        depthTest: true,
        wireframe: gui.getWireframe()
    });

    mesh = new THREE.Mesh(geometry, clothMaterial);
    mesh.scale.set(50, 50, 50);
    scene.add(mesh);
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

window.addEventListener('resize', onWindowResize, false);

function render() {

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

        // Switch the reference to the FBO's to ping-pong
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

gui = new gui();
gui.init();

init();

render();