export const surfaceVertex = /* glsl */ `
  varying vec3 vNormal;
  varying vec3 vPosition;
  varying vec3 vView;
  void main() {
    vNormal = normalize(normalMatrix * normal);
    vPosition = position;
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    vView = normalize(-mv.xyz);
    gl_Position = projectionMatrix * mv;
  }
`;

const noise = /* glsl */ `
  float hash(vec3 p) { return fract(sin(dot(p, vec3(127.1,311.7,74.7))) * 43758.5453); }
  float noise3(vec3 p) {
    vec3 i = floor(p), f = fract(p); f = f*f*(3.0-2.0*f);
    return mix(mix(mix(hash(i),hash(i+vec3(1,0,0)),f.x),mix(hash(i+vec3(0,1,0)),hash(i+vec3(1,1,0)),f.x),f.y),
      mix(mix(hash(i+vec3(0,0,1)),hash(i+vec3(1,0,1)),f.x),mix(hash(i+vec3(0,1,1)),hash(i+vec3(1,1,1)),f.x),f.y),f.z);
  }
  float fbm(vec3 p) { float n=0.0; float a=.5; for(int i=0;i<4;i++){ n+=a*noise3(p);p=p*2.07+vec3(4.1);a*=.5;} return n; }
`;

export const surfaceFragment = /* glsl */ `
  uniform vec3 uColor;
  uniform vec3 uDark;
  uniform float uSeed;
  uniform float uTime;
  uniform float uOpacity;
  varying vec3 vNormal;
  varying vec3 vPosition;
  varying vec3 vView;
  ${noise}
  void main() {
    vec3 p = vPosition * 3.0 + uSeed;
    float cloud = fbm(p*2.0 + fbm(p*3.0));
    float bands = sin(vPosition.y*23.0 + cloud*8.0 + uSeed) * .5 + .5;
    float detail = noise3(p*65.0);
    vec3 base = mix(uDark,uColor,clamp(cloud*.85+bands*.32+detail*.12,0.0,1.0));
    float light = max(dot(normalize(vNormal),normalize(vec3(-.65,.65,1.0))),0.0);
    float rim = pow(1.0-max(dot(normalize(vNormal),vView),0.0),3.5);
    vec3 color = base*(.09+light*1.3) + uColor*rim*.22;
    gl_FragColor = vec4(color,uOpacity);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
  }
`;

export const sunFragment = /* glsl */ `
  uniform float uTime;
  uniform float uOpacity;
  varying vec3 vNormal;
  varying vec3 vPosition;
  varying vec3 vView;
  ${noise}
  void main() {
    float n = fbm(vPosition*7.0+vec3(uTime*.055));
    float grain = noise3(vPosition*95.0+uTime*.025);
    float facing = max(dot(normalize(vNormal),vView),0.0);
    vec3 warm = mix(vec3(1.0,.40,.13),vec3(1.0,.85,.54),n*.9+grain*.18);
    gl_FragColor = vec4(warm*(1.05+pow(facing,.4)*.65),uOpacity);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
  }
`;
