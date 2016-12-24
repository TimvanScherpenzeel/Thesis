/*
 * @author mrdoob / http://www.mrdoob.com
 * https://github.com/mrdoob/brokenmantra/blob/master/js/GPGPU.js
 * https://github.com/toji/webgl2-particles/tree/gh-pages/js
 */

var GPGPU = function (renderer) {

    var camera = new THREE.OrthographicCamera(-0.5, 0.5, 0.5, -0.5, 0, 1);

    var scene = new THREE.Scene();

    var mesh = new THREE.Mesh(new THREE.PlaneBufferGeometry(1, 1));
    scene.add(mesh);

    var velTexture = new THREE.WebGLRenderTarget(clothWidth, clothHeight, {
        wrapS: THREE.ClampToEdgeWrapping,
        wrapT: THREE.ClampToEdgeWrapping,
        minFilter: THREE.NearestFilter,
        magFilter: THREE.NearestFilter,
        format: THREE.RGBAFormat,
        type: floatType,
        stencilBuffer: false
    });

    var prevVelTexture = velTexture.clone();

    this.initVel = function (shader) {
        mesh.material = shader.initVelMat;
        renderer.render(scene, camera, velTexture, false);
        renderer.render(scene, camera, prevVelTexture, false);
    };

    this.pass = function (shader, target, GUI) {
        shader.setGUISettings(GUI);
        shader.setPrevVelocityTexture(prevVelTexture);
        mesh.material = shader.updateVelMat;
        renderer.render(scene, camera, velTexture, false);

        shader.setVelocityTexture(velTexture);
        mesh.material = shader.updatePosMat;
        renderer.render(scene, camera, target, false);

        // Switch the reference pointers to the velocity FBO to ping-pong
        var buffer = velTexture;
        velTexture = prevVelTexture;
        prevVelTexture = buffer;
       
    };
};