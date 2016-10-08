/*
 * @author mrdoob / http://www.mrdoob.com
 * https://github.com/mrdoob/brokenmantra/blob/master/js/gpgpu/SimulationShader.js
 * https://github.com/zammiez/CIS565-Final-WebGL-Cloth-Simulation
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
            u_mass: { type: "f", value: 0.0 },
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
            'uniform float u_mass;',
            'uniform float u_windX;',
            'uniform float u_windY;',
            'uniform float u_windZ;',
            'uniform float u_time;',
            'uniform float u_damping;',
            'uniform vec2 Str;',
            'uniform vec2 Shr;',
            'uniform vec2 Bnd;',
            'uniform vec4 u_pins;',

            // returns the position of the given vertex along with its spring and damping constants
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

            '  if (n < 8) { ks = Shr[0]; kd = Shr[1]; } ',//ksShr,kdShr
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

            '  if (n < 12) { ks = Bnd[0]; kd = Bnd[1]; }', //ksBnd,kdBnd
            '  if (n == 8) return vec2(2.0, 0.0);',
            '  if (n == 9) return vec2(0.0, -2.0);',
            '  if (n == 10) return vec2(-2.0, 0.0);',
            '  if (n == 11) return vec2(0.0, 2.0);',
            '  return vec2(0.0,0.0);',
            '}',
            
            'void main() {',
            // Get the attributes of the current particle
            '  vec4 pos = texture2D(tPositions, vUv);',
            '  vec4 vel =  texture2D(tVelocity, vUv);',

            // Set a constant gravitational force
            '  vec3 gravity = vec3(0.0, -9.8 * 0.1, 0.0);',

            // Set the gravity as a constant base force (simplified)
            '  vec3 force = gravity;',

            // Add damping
            // '  vec3 force = gravity * mass.xyz + vel.xyz * -u_damping;', // Mass currently not implemented yet
            '  force += -u_damping * vel.xyz;',

            // Wind simulation
            '  force.x += u_windX * sin(u_time + 10.0);',
            '  force.y += u_windY * cos(u_time + 10.0);',
            '  force.z += u_windZ * sin(u_time + 10.0);',

            // Get neighbors
            // Compute for all 12 neighbors of the current vertex (constructed by the springs above)
            //
            //             o        
            //             | 
            //         o---o---o    
            //         |   |   |
            //     o---o---m---o---o
            //         |   |   |
            //         o---o---o    
            //             |
            //             o        

            // Satisfy the constraints
            '  for (int k = 0; k < 12; k++) {',
            '    vec3 tempVel = vel.xyz;',
            '    float ks, kd;',

                 // Get neighbor coordinates
            '    vec2 neighborCoord = getNeighbor(k, ks, kd);',

                 // Size of a single patch in world space
            '    float invClothSize = 1.0 / cloth_w;',

                 // Length of a single patch at rest
            '    float restLength = length(neighborCoord * invClothSize);',

            '    neighborCoord = neighborCoord * (1.0 / cloth_w);',
            '    vec2 newCoord = vUv + neighborCoord;',

                 // Check for out of bounds indices
            '    if(newCoord.x <= 0.0 || newCoord.x >= 1.0 || newCoord.y <= 0.0 || newCoord.y >= 1.0) continue;',

                 // Calculate the velocity and change in position and velocity
            '    vec3 posNeighborParticle = texture2D(tPositions, newCoord).xyz;',
            '    vec3 velNeighborParticle = texture2D(tVelocity, newCoord).xyz;',
            '    vec3 deltaPos = pos.xyz - posNeighborParticle;',
            '    tempVel += deltaPos;',
            '    vec3 deltaVel = tempVel - velNeighborParticle;',
            '    float distance = length(deltaPos);',

                 // Calculate the spring force
            '    vec3 springForce = (-ks * (distance - restLength) + kd * (dot(deltaVel, deltaPos) / distance)) * normalize(deltaPos);',
            '    force += springForce;',
            '  };',

               // Calculate the acceleration using Newtons second law of motion: a = F / m
            '  vec3 acc;',
            '  if(u_mass == 0.0) acc = vec3(0.0); else acc = force / u_mass;',

            '  bool pinBoolean = false;',  
            '  if(!pinBoolean) pinBoolean = (vUv.y < 0.035 && vUv.x < 0.035 && u_pins.y > 0.0);', //Pin 1, Top left
            '  if(!pinBoolean) pinBoolean = (vUv.y > 0.965 && vUv.x < 0.035 && u_pins.x > 0.0);', // Pin 2, Top right

               // If the vertex is not marked as pin run the simulation
            '  if(pinBoolean) {',
            '    vel.xyz = vec3(0.0);',
            '  } else {',

                 // Euler method is broken up into two parts: 
                 // 1. VelocityNew = VelocityCurrent + Acceleration * Timestep
                 // 2. PositionNew = PositionCurrent + VelocityNew * Timestep

                 // First part of the Euler method
            '    vel.xyz += acc * timestep;',
            '  }',

               // Set the new velocity of the particle
            '  gl_FragColor = vec4(vel.xyz,1.0);',
            '}',
        ].join('\n'),
    });

    var updatePosMat = new THREE.ShaderMaterial({

        uniforms: {
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

          '    if(! pinBoolean) {',

                 // Second part of the Euler method
          '      pos.xyz += vel.xyz * timer;',
          '    }',

          '  }',

          '  gl_FragColor = pos;',
          '}',
        ].join('\n'),
    });

    return {

        initVelMat: initVelMat,

        updateVelMat: updateVelMat,

        updatePosMat: updatePosMat,

        setGUISettings: function (gui) {
            updatePosMat.uniforms.u_pins.value = new THREE.Vector4(gui.getPin1(), gui.getPin2());
            updateVelMat.uniforms.timestep.value = gui.getTimeStep();
            updateVelMat.uniforms.Str.value = new THREE.Vector2(gui.getKsString(), -gui.getKdString());
            updateVelMat.uniforms.Shr.value = new THREE.Vector2(gui.getKsShear(), -gui.getKdShear());
            updateVelMat.uniforms.Bnd.value = new THREE.Vector2(gui.getKsBend(), -gui.getKdBend());
            updateVelMat.uniforms.u_windX.value = gui.getWindForceX();
            updateVelMat.uniforms.u_windY.value = gui.getWindForceY();
            updateVelMat.uniforms.u_windZ.value = gui.getWindForceZ();
            updateVelMat.uniforms.u_damping.value = gui.getDamping();
            updateVelMat.uniforms.u_mass.value = gui.getMass();
            updateVelMat.uniforms.u_pins.value = new THREE.Vector4(gui.getPin1(), gui.getPin2());
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
