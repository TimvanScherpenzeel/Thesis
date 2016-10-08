ClothShader = function() {
    var clothMat = new THREE.ShaderMaterial({
        vertexShader: [
            'uniform sampler2D map;',
            'uniform float width;',
            'uniform float height;',
            'varying vec2 vUv;',
            'varying vec4 vPosition;',
            'varying vec3 vNormal;',

            // https://learnit.itu.dk/pluginfile.php/127709/mod_resource/content/1/topic_5.cpp
            'vec3 calcNormal(vec3 p1,vec3 p2,vec3 p3) {',
                'vec3 nor;',
                'vec3 e1 = p2 - p1;',
                'vec3 e2 = p3 - p1;',

                'nor.x = e1.y * e2.z - e1.z * e2.y;',
                'nor.y = e1.z * e2.x - e1.x * e2.z;',
                'nor.z = e1.x * e2.y - e1.y * e2.x;',
                'nor = normalize(nor);',
                'return nor;',
            '}',

            'void main() {',
                'vUv = position.xy + vec2(0.5 / width, 0.5 / height);',
                'vec3 color = texture2D(map, vUv).rgb;',
                'vPosition = vec4(color,1.0);',

                'vec3 up = texture2D(map, vUv + vec2(0.0, 1.0 / height)).rgb;',
                'vec3 down = texture2D(map, vUv + vec2(0.0, -1.0 / height)).rgb;',
                'vec3 left = texture2D(map, vUv + vec2(-1.0 / width)).rgb;',
                'vec3 right = texture2D(map, vUv + vec2(1.0 / width)).rgb;',
                
                'vNormal = vec3(0.0, 0.0, 0.0);',
                'vec3 nor0 = calcNormal(color, up, right);',
                'vec3 nor1 = calcNormal(color, right, down);',
                'vec3 nor2 = calcNormal(color, down, left);',
                'vec3 nor3 = calcNormal(color, right, up);',

                'if(dot(nor0, nor1) <= 0.0) {',
                '    nor1 = -nor1;',
                '}',

                'if(dot(nor0, nor2) <= 0.0) {',
                '    nor2 = -nor2;',
                '}',

                'if(dot(nor0, nor3) <= 0.0) {',
                '    nor3 = -nor3;',
                '}',

                'vNormal += (nor0 + nor1 + nor2 + nor3);',
                
                // Prevents the edges of the cloth from Z-fighting
                'if(vUv.x <= 0.5 / width || vUv.y <= 0.5 / height || vUv.x >= 1.0-0.5 / width || vUv.y >= 1.0 - 0.5 / width) {',
                    'vNormal = vec3(0.0, 0.0, 0.0);', 
                '}', 

                'vNormal = normalize(vNormal);',

                'gl_Position = projectionMatrix * modelViewMatrix * vec4(color, 1.0);',

            '}',
        ].join('\n'),

        fragmentShader: [
            'uniform sampler2D map;',
            'uniform sampler2D tex;',
            'uniform vec3 camPos;',
            'varying vec2 vUv;',
            'varying vec4 vPosition;',
            'varying vec3 vNormal;',
            
            'void main() {',
                // https://en.wikipedia.org/wiki/Blinn%E2%80%93Phong_shading_model
                // http://www.mathematik.uni-marburg.de/~thormae/lectures/graphics1/code/WebGLShaderLightMat/ShaderLightMat.html
                'vec3 pos = vPosition.xyz;',
                'vec3 viewDir = normalize(camPos - pos);',
                'vec3 nor = vNormal;',
                
                'if (dot(viewDir,nor) <= 0.0) {',
                    'nor = -nor;',
                '}',

                // Possibly replace with a phong THREE shaderchunk
                'vec3 lightDir = vec3(1.0, 1.0, 1.0);',
                'lightDir = normalize(lightDir);',
                'vec3 reflDir = reflect(-lightDir, nor);',

                'float lamb = max(dot(lightDir, nor), 0.0);',
                'float spec = 0.0;',
                'float amb = 0.2;',
                'vec3 lightCol = vec3(0.1, 0.1, 0.1);',
                
                'if (lamb > 0.0) {',
                    'float specAngle = max(dot(reflDir, viewDir), 0.0);',
                    'spec = pow(specAngle,1.0);',
                '}',
                
                // Show normals as texture
                // gl_FragColor = vec4(nor ,1.0);

                // Rotate the texture to correct the orientation
                'vec4 clothTexture = texture2D(tex, vec2(vUv.y, 1.0 - vUv.x));',

                // Apply lighting and texture
                'gl_FragColor = vec4(((lamb + spec + amb) * lightCol), 1.0) + clothTexture;',
            '}',
        ].join('\n'),
    });

    return {
        clothMat: clothMat
    }
};