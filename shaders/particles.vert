uniform sampler2D map;
uniform float width;
uniform float height;
varying vec2 vUv;
varying vec4 vPosition;
varying vec3 vNormal;

// https://learnit.itu.dk/pluginfile.php/127709/mod_resource/content/1/topic_5.cpp
vec3 calculateNormal (vec3 p1, vec3 p2, vec3 p3) {
    vec3 nor;
    vec3 e1 = p2 - p1;
    vec3 e2 = p3 - p1;

    nor.x = e1.y * e2.z - e1.z * e2.y;
    nor.y = e1.z * e2.x - e1.x * e2.z;
    nor.z = e1.x * e2.y - e1.y * e2.x;
    nor = normalize(nor);
    return nor;
}

void main () {
    vUv = position.xy + vec2(0.5 / width, 0.5 / height);
    vec3 color = texture2D(map, vUv).rgb;
    vPosition = vec4(color,1.0);

    vec3 up = texture2D(map, vUv + vec2(0.0, 1.0 / height)).rgb;
    vec3 down = texture2D(map, vUv + vec2(0.0, -1.0 / height)).rgb;
    vec3 left = texture2D(map, vUv + vec2(-1.0 / width)).rgb;
    vec3 right = texture2D(map, vUv + vec2(1.0 / width)).rgb;
    
    vNormal = vec3(0.0, 0.0, 0.0); 
    vec3 nor0 = calculateNormal(color, up, right);
    vec3 nor1 = calculateNormal(color, right, down);
    vec3 nor2 = calculateNormal(color, down, left);
    vec3 nor3 = calculateNormal(color, right, up);

    if(dot(nor0, nor1) <= 0.0) {
        nor1 = -nor1;
    }

    if(dot(nor0, nor2) <= 0.0) {
        nor2 = -nor2;
    } 
    if(dot(nor0, nor3) <= 0.0) {
        nor3 = -nor3;
    }

    vNormal += (nor0 + nor1 + nor2 + nor3);
    
    // Prevents the edges of the cloth from Z-fighting
    if(vUv.x <= 0.5 / width || vUv.y <= 0.5 / height || vUv.x >= 1.0-0.5 / width || vUv.y >= 1.0 - 0.5 / width) {
        vNormal = vec3(0.0, 0.0, 0.0); 
    } 

    vNormal = normalize(vNormal);

    gl_Position = projectionMatrix * modelViewMatrix * vec4(color, 1.0);

}