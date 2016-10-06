/**
 * @author mrdoob / http://www.mrdoob.com
 * https://github.com/mrdoob/brokenmantra/blob/master/js/gpgpu/SimulationShader.js
 */

GPGPU.SimulationShader = function () {
    
    var initVelMat = new THREE.ShaderMaterial({
        vertexShader: [
          'precision highp float;',
          'void main() {',
          '  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);',
          '}',
        ].join('\n'),

        fragmentShader: [
          'precision highp float;',
          'void main() {',
          '  gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);',
          '}',
        ].join('\n'),
    });

    var updateVelMat = new THREE.ShaderMaterial({
        uniforms: {        
            cloth_w: { type: "f", value: cloth_w },
            tVelocity: { type: "t", value: texture },
            tPositions: { type: "t", value: texture },
            timestep: { type: "f", value: 0.003 },
            u_windX: { type: "f", value: 0.0 },
            u_windY: { type: "f", value: 0.0 },
            u_windZ: { type: "f", value: 0.0 },
            u_time: { type: "f", value: 0.0 },
            u_damping: { type: "f", value: 0.0 },
            Str: { type: "v2", value: new THREE.Vector2(1850.0, -0.25)},
            Shr: { type: "v2", value: new THREE.Vector2(1850.0, -0.25)},
            Bnd: { type: "v2", value: new THREE.Vector2(550.0, -0.25)},
            u_pins: { type: "v4", value: new THREE.Vector4(1.0, 1.0, 0.0, 0.0)},
        },

        vertexShader: [
            'precision highp float;',
            'varying vec2 vUv;',
            'void main() {',
            '  vUv = uv.xy;',
            '  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);',
            '}',
        ].join('\n'),

        fragmentShader: [
            'precision highp float;',
            'varying vec2 vUv;',
            'uniform float cloth_w;',
            'uniform sampler2D tVelocity;',  
            'uniform sampler2D tPositions;',
            'uniform float timestep;',
            'uniform float u_windX;',
            'uniform float u_windY;',
            'uniform float u_windZ;',
            'uniform float u_time;',
            'uniform float u_damping;',
            'uniform vec2 Str;',
            'uniform vec2 Shr;',
            'uniform vec2 Bnd;',
            'uniform vec4 u_pins;',

            'vec2 getNeighbor(int n, out float ks, out float kd) {',
               // structural springs (adjacent neighbors)
               //
               //        o
               //        |
               //     o--m--o
               //        |
               //        o
               //

            '  if (n < 4){ ks = Str[0]; kd = Str[1]; }', //ksStr, kdStr
            '  if (n == 0) return vec2(1.0, 0.0);',
            '  if (n == 1) return vec2(0.0, -1.0);',
            '  if (n == 2) return vec2(-1.0, 0.0);',
            '  if (n == 3) return vec2(0.0, 1.0);',

               // shear springs (diagonal neighbors)
               //
               //     o  o  o
               //      \   /
               //     o  m  o
               //      /   \
               //     o  o  o
               //

            '  if (n<8) { ks = Shr[0]; kd = Shr[1]; } ',//ksShr,kdShr
            '  if (n == 4) return vec2(1.0, -1.0);',
            '  if (n == 5) return vec2(-1.0, -1.0);',
            '  if (n == 6) return vec2(-1.0, 1.0);',
            '  if (n == 7) return vec2(1.0, 1.0);',

               // bend spring (adjacent neighbors 1 node away)   
               //
               //     o   o   o   o   o
               //             | 
               //     o   o   |   o   o
               //             |   
               //     o-------m-------o
               //             |  
               //     o   o   |   o   o
               //             |
               //     o   o   o   o   o
               //

            '  if (n<12) { ks = Bnd[0]; kd = Bnd[1]; }', //ksBnd,kdBnd
            '  if (n == 8) return vec2(2.0, 0.0);',
            '  if (n == 9) return vec2(0.0, -2.0);',
            '  if (n == 10) return vec2(-2.0, 0.0);',
            '  if (n == 11) return vec2(0.0, 2.0);',
            '  return vec2(0.0,0.0);',
            '}',
            
            'void main() {',
            '  vec4 pos = texture2D(tPositions, vUv);',
            '  vec3 F = vec3(0.0, -9.8 * 0.1, 0.0);', // Mass currently not implemented yet

            // Wind simulation
            '  F.x += u_windX * sin(u_time + 10.0);',
            '  F.y += u_windY * cos(u_time + 10.0);',
            '  F.z += u_windZ * sin(u_time + 10.0);',

            '  vec4 vel =  texture2D(tVelocity, vUv);',
            '  F += -u_damping * vel.xyz;',

            '  for (int k = 0; k < 12; k++) {',
            '    vec3 tempVel = vel.xyz;',
            '    float ks, kd;',
            '    vec2 nCoord = getNeighbor(k, ks, kd);',

            '    float inv_cloth_size = 1.0 / cloth_w;',
            '    float rest_length = length(nCoord*inv_cloth_size);',

            '    nCoord = nCoord * (1.0 / cloth_w);',
            '    vec2 newCoord = vUv+nCoord;',
            '    if(newCoord.x <=0.0 || newCoord.x >= 1.0 || newCoord.y <= 0.0 || newCoord.y >= 1.0) continue;',

            '    vec3 posNP = texture2D(tPositions, newCoord).xyz;',
            '    vec3 v2 = texture2D(tVelocity, newCoord).xyz;',
            '    vec3 deltaP = pos.xyz - posNP;',

            '    tempVel += deltaP;',

            '    vec3 deltaV = tempVel - v2;',
            '    float dist = length(deltaP);',
            '    float leftTerm = -ks * (dist - rest_length);',
            '    float rightTerm = kd * (dot(deltaV, deltaP) / dist);',
            '    vec3 springForce = (leftTerm + rightTerm) * normalize(deltaP);',
            '    F += springForce;',
            '  };',

            '  vec3 acc = F / 0.5;', // Mass currently not implemented yet
            '  bool pinBoolean = false;',
               
            '  if(!pinBoolean) pinBoolean = (vUv.y < 0.035 && vUv.x < 0.035 && u_pins.y > 0.0);', //Pin 1, Top left
            '  if(!pinBoolean) pinBoolean = (vUv.y > 0.965 && vUv.x < 0.035 && u_pins.x > 0.0);', // Pin 2, Top right
            '  if(pinBoolean) vel.xyz = vec3(0.0); else vel.xyz += acc * timestep;',
          
            '  gl_FragColor = vec4(vel.xyz,1.0);',
            '}',
        ].join('\n'),
    });

    var material = new THREE.ShaderMaterial({

        uniforms: {
            cloth_w: { type: "f", value: 100.0 },
            tVelocity: { type: "t", value: texture },
            tPositions: { type: "t", value: texture },
            origin: { type: "t", value: texture },
            timer: { type: "f", value: 0.003 },
            isStart: { type: "i", value: 1 },
            u_pins: { type: "v4", value: new THREE.Vector4(0.0, 0.0, 0.0, 0.0)},
            u_newPinPos: { type: "v4", value: new THREE.Vector4(0.0, 0.0, 0.0, 0.0)},
        },

        vertexShader: [
          'precision highp float;',
          'varying vec2 vUv;',

          'void main() {',
          '  vUv = uv.xy;',
          '  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);',
          '}',
        ].join('\n'),

        fragmentShader: [
          'precision highp float;',
          'varying vec2 vUv;',

          'uniform float cloth_w;',
          'uniform sampler2D tVelocity;',
          'uniform sampler2D tPositions;',

          'uniform sampler2D origin;',
          'uniform float timer;',
          'uniform int isStart;',

          'uniform vec4 u_pins;',
          'uniform vec4 u_newPinPos;',

          'void main() {',
          '  vec4 pos = texture2D(tPositions, vUv);',
          '  vec4 vel = texture2D(tVelocity, vUv);',

          '  if(isStart == 1) {',
          '    pos = vec4(texture2D(origin, vUv).xyz, 0.1);',
          '  } else {',
          '    bool pinBoolean = false;',
               
          '    if(!pinBoolean) pinBoolean = (vUv.y < 0.035 && vUv.x < 0.035 && u_pins.y > 0.0);', //Pin 1, Top left
          '    if(!pinBoolean) pinBoolean = (vUv.y > 0.965 && vUv.x < 0.035 && u_pins.x > 0.0);', // Pin 2, Top right

          '    if(pinBoolean) ; else pos.xyz += vel.xyz*timer;',
          '  }',

          '  gl_FragColor = pos;',
          '}',
        ].join('\n'),
    });

    return {

        initVelMat: initVelMat,

        updateVelMat: updateVelMat,

        material: material,

        setGUISettings: function (gui) {
            material.uniforms.u_pins.value = new THREE.Vector4(gui.getPin1(), gui.getPin2());
            updateVelMat.uniforms.timestep.value = gui.getTimeStep();
            updateVelMat.uniforms.Str.value = new THREE.Vector2(gui.getKsString(), -gui.getKdString());
            updateVelMat.uniforms.Shr.value = new THREE.Vector2(gui.getKsShear(), -gui.getKdShear());
            updateVelMat.uniforms.Bnd.value = new THREE.Vector2(gui.getKsBend(), -gui.getKdBend());
            updateVelMat.uniforms.u_windX.value = gui.getWindForceX();
            updateVelMat.uniforms.u_windY.value = gui.getWindForceY();
            updateVelMat.uniforms.u_windZ.value = gui.getWindForceZ();
            updateVelMat.uniforms.u_damping.value = gui.getDamping();
            updateVelMat.uniforms.u_pins.value = new THREE.Vector4(gui.getPin1(), gui.getPin2());
            updateVelMat.uniforms.u_time.value = clock.getElapsedTime();
        },

        setPositionsTexture: function (positions) {           
            material.uniforms.tPositions.value = positions;
            updateVelMat.uniforms.tPositions.value = positions;
            return this;
        },

        setVelocityTexture: function (velocities) {
            material.uniforms.tVelocity.value = velocities;
            return this;
        },

        setOriginsTexture: function (origins) {
            material.uniforms.origin.value = origins;
            return this;
        },

        setTimer: function (timer) {
            material.uniforms.timer.value = timer;
            return this;
        },

        setStart: function (isStart) {
            material.uniforms.isStart.value = isStart;
            return this;
        },

        setPrevVelocityTexture: function (velocities) {
            updateVelMat.uniforms.tVelocity.value = velocities;
            return this;
        },

    }

};
