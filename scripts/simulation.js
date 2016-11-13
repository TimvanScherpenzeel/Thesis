/*
 * @author mrdoob / http://www.mrdoob.com
 * https://github.com/mrdoob/brokenmantra/blob/master/js/gpgpu/SimulationShader.js
 * https://github.com/zammiez/CIS565-Final-WebGL-Cloth-Simulation
 */

GPGPU.Simulation = function (shaderText) {
    
    var initVelMat = new THREE.ShaderMaterial({
        vertexShader: shaderText[2],
        fragmentShader: shaderText[3]
    });

    var updateVelMat = new THREE.ShaderMaterial({
        uniforms: {        
            clothWidth: { type: "f", value: clothWidth },
            tVelocity: { type: "t", value: texture },
            tPositions: { type: "t", value: texture },
            u_timestep: { type: "f", value: 0.0 },
            u_mass: { type: "f", value: 0.0 },
            u_windX: { type: "f", value: 0.0 },
            u_windY: { type: "f", value: 0.0 },
            u_windZ: { type: "f", value: 0.0 },
            u_time: { type: "f", value: 0.0 },
            u_damping: { type: "f", value: 0.0 },
            u_pins: { type: "v4", value: new THREE.Vector4(1.0, 1.0, 0.0, 0.0)},
            Str: { type: "v2", value: new THREE.Vector2(0, 0)},
            Shr: { type: "v2", value: new THREE.Vector2(0, 0)},
            Bnd: { type: "v2", value: new THREE.Vector2(0, 0)},
        },

        vertexShader: shaderText[4],
        fragmentShader: shaderText[5]
    });

    var updatePosMat = new THREE.ShaderMaterial({

        uniforms: {
            tVelocity: { type: "t", value: texture },
            tPositions: { type: "t", value: texture },
            origin: { type: "t", value: texture },
            timer: { type: "f", value: 0.0 },
            isStart: { type: "i", value: 1 },
            u_pins: { type: "v4", value: new THREE.Vector4(0.0, 0.0, 0.0, 0.0)},
            u_newPinPos: { type: "v4", value: new THREE.Vector4(0.0, 0.0, 0.0, 0.0)},
        },

        vertexShader: shaderText[6],
        fragmentShader: shaderText[7]
    });

    return {

        initVelMat: initVelMat,

        updateVelMat: updateVelMat,

        updatePosMat: updatePosMat,

        setGUISettings: function (GUI) {
            updatePosMat.uniforms.u_pins.value = new THREE.Vector4(GUI.getPin1(), GUI.getPin2());
            updateVelMat.uniforms.u_timestep.value = GUI.getTimeStep();
            updateVelMat.uniforms.Str.value = new THREE.Vector2(GUI.getKsStruct(), -GUI.getKdStruct());
            updateVelMat.uniforms.Shr.value = new THREE.Vector2(GUI.getKsShear(), -GUI.getKdShear());
            updateVelMat.uniforms.Bnd.value = new THREE.Vector2(GUI.getKsBend(), -GUI.getKdBend());
            updateVelMat.uniforms.u_windX.value = GUI.getWindForceX();
            updateVelMat.uniforms.u_windY.value = GUI.getWindForceY();
            updateVelMat.uniforms.u_windZ.value = GUI.getWindForceZ();
            updateVelMat.uniforms.u_damping.value = GUI.getDamping();
            updateVelMat.uniforms.u_mass.value = GUI.getMass();
            updateVelMat.uniforms.u_pins.value = new THREE.Vector4(GUI.getPin1(), GUI.getPin2());
            updateVelMat.uniforms.u_time.value = clock.getElapsedTime();
        },

        setPositionsTexture: function (positions) {           
            updatePosMat.uniforms.tPositions.value = positions;
            updateVelMat.uniforms.tPositions.value = positions;
            return this;
        },

        setVelocityTexture: function (velocities) {
            updatePosMat.uniforms.tVelocity.value = velocities;
            return this;
        },

        setOriginsTexture: function (origins) {
            updatePosMat.uniforms.origin.value = origins;
            return this;
        },

        setTimer: function (timer) {
            updatePosMat.uniforms.timer.value = timer;
            return this;
        },

        setStart: function (isStart) {
            updatePosMat.uniforms.isStart.value = isStart;
            return this;
        },

        setPrevVelocityTexture: function (velocities) {
            updateVelMat.uniforms.tVelocity.value = velocities;
            return this;
        },

    }

};
