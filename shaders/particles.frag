uniform sampler2D map;
uniform sampler2D tex;
uniform vec3 camPos;
varying vec2 vUv;
varying vec4 vPosition;
varying vec3 vNormal;

void main () {
    // https://en.wikipedia.org/wiki/Blinn%E2%80%93Phong_shading_model
    // http://www.mathematik.uni-marburg.de/~thormae/lectures/graphics1/code/WebGLShaderLightMat/ShaderLightMat.html
    vec3 pos = vPosition.xyz;
    vec3 viewDir = normalize(camPos - pos);
    vec3 nor = vNormal;
    
    if (dot(viewDir,nor) <= 0.0) {
        nor = -nor;
    }

    // Possibly replace with a phong THREE shaderchunk
    vec3 lightDir = vec3(1.0, 1.0, 1.0);
    lightDir = normalize(lightDir);
    vec3 reflDir = reflect(-lightDir, nor);

    float lamb = max(dot(lightDir, nor), 0.0);
    float spec = 0.0;
    float amb = 0.2;
    vec3 lightCol = vec3(0.1, 0.1, 0.1);
    
    if (lamb > 0.0) {
        float specAngle = max(dot(reflDir, viewDir), 0.0);
        spec = pow(specAngle,1.0);
    }
    
    // Show normals as texture
    // gl_FragColor = vec4(nor ,1.0);

    // Rotate the texture to correct the orientation
    vec4 clothTexture = texture2D(tex, vec2(vUv.y, 1.0 - vUv.x));

    // Apply lighting and texture
    gl_FragColor = vec4(((lamb + spec + amb) * lightCol), 1.0) + clothTexture;
}