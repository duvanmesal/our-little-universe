import { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import {
  AdditiveBlending,
  BufferAttribute,
  BufferGeometry,
  type Points,
  type ShaderMaterial,
} from 'three';

export default function StarField({ reduced, count }: { reduced: boolean; count: number }) {
  const stars = useRef<Points>(null);
  const material = useRef<ShaderMaterial>(null);
  const geometry = useMemo(() => {
    const position = new Float32Array(count * 3);
    const sizes = new Float32Array(count);
    let seed = 9321;
    const random = () => {
      seed = (seed * 16807) % 2147483647;
      return seed / 2147483647;
    };
    for (let i = 0; i < count; i++) {
      position[i * 3] = (random() - 0.5) * 150;
      position[i * 3 + 1] = (random() - 0.5) * 100;
      position[i * 3 + 2] = -15 - random() * 70;
      sizes[i] = 0.5 + random() * 2.4;
    }
    return new BufferGeometry()
      .setAttribute('position', new BufferAttribute(position, 3))
      .setAttribute('aSize', new BufferAttribute(sizes, 1));
  }, [count]);
  useEffect(() => () => geometry.dispose(), [geometry]);
  const uniforms = useMemo(() => ({ uTime: { value: 0 } }), []);
  useFrame(({ clock, pointer }, delta) => {
    if (reduced || !stars.current || !material.current) return;
    material.current.uniforms.uTime!.value = clock.elapsedTime;
    stars.current.rotation.y +=
      (pointer.x * 0.015 - stars.current.rotation.y) * Math.min(delta, 0.05);
    stars.current.rotation.x +=
      (-pointer.y * 0.01 - stars.current.rotation.x) * Math.min(delta, 0.05);
  });
  return (
    <points ref={stars} geometry={geometry} frustumCulled={false}>
      <shaderMaterial
        ref={material}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        blending={AdditiveBlending}
        vertexShader={`attribute float aSize; varying float vLight; uniform float uTime; void main(){ vec4 mv=modelViewMatrix*vec4(position,1.0); gl_Position=projectionMatrix*mv; gl_PointSize=aSize*1.4; vLight=.45+.35*sin(uTime*.35+position.x); }`}
        fragmentShader={`varying float vLight; void main(){float d=length(gl_PointCoord-.5);float a=smoothstep(.5,.05,d);gl_FragColor=vec4(.78,.82,1.0,a*vLight);}`}
      />
    </points>
  );
}
