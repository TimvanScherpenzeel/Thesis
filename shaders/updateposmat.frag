varying vec2 vUv;

uniform sampler2D tVelocity;
uniform sampler2D tPositions;

uniform sampler2D origin;
uniform float timer;
uniform int isStart;

uniform vec4 u_pins;
uniform vec4 u_newPinPos;

void main() {
  vec4 pos = texture2D(tPositions, vUv);
  vec4 vel = texture2D(tVelocity, vUv);

  if(isStart == 1) {
    pos = vec4(texture2D(origin, vUv).xyz, 0.1);
  } else {
    bool pinBoolean = false;
    if(!pinBoolean) pinBoolean = (vUv.y < 0.035 && vUv.x < 0.035 && u_pins.y > 0.0); //Pin 1, Top left
    if(!pinBoolean) pinBoolean = (vUv.y > 0.965 && vUv.x < 0.035 && u_pins.x > 0.0); // Pin 2, Top right

    if(! pinBoolean) {

       // Second part of semi-implicit Eulers method
      pos.xyz += vel.xyz * timer;
    }

  }

   // Set the new velocity of the particle
  gl_FragColor = vec4(pos.xyz,1.0);
}