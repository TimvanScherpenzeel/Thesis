/**
 * @author mrdoob / http://www.mrdoob.com
 * https://github.com/mrdoob/brokenmantra/blob/master/js/GPGPU.js
 */

var GPGPU = function (renderer) {

    var camera = new THREE.OrthographicCamera(-0.5, 0.5, 0.5, -0.5, 0, 1);

    var scene = new THREE.Scene();

    var mesh = new THREE.Mesh(new THREE.PlaneBufferGeometry(1, 1));
    scene.add(mesh);

    var velTexture = new THREE.WebGLRenderTarget(cloth_w, cloth_h, {
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

    this.pass = function (shader, target, gui) {
        shader.setGUISettings(gui);
        shader.setPrevVelocityTexture(prevVelTexture);
        mesh.material = shader.updateVelMat;
        renderer.render(scene, camera, velTexture, false);

        shader.setVelocityTexture(velTexture);
        mesh.material = shader.material;
        renderer.render(scene, camera, target, false);

        var a = velTexture;
        velTexture = prevVelTexture;
        prevVelTexture = a;
       
    };
};
