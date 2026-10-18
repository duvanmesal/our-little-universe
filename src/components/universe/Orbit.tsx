import { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { BufferGeometry, Float32BufferAttribute, type LineBasicMaterial } from 'three';

export default function Orbit({
  radius,
  active,
  reduced,
  focused,
}: {
  radius: number;
  active: boolean;
  reduced: boolean;
  focused: boolean;
}) {
  const material = useRef<LineBasicMaterial>(null);
  const geometry = useMemo(() => {
    const vertices: number[] = [];
    for (let i = 0; i <= 160; i++) {
      const a = (i / 160) * Math.PI * 2;
      vertices.push(Math.cos(a) * radius, 0, Math.sin(a) * radius);
    }
    return new BufferGeometry().setAttribute('position', new Float32BufferAttribute(vertices, 3));
  }, [radius]);
  useEffect(() => () => geometry.dispose(), [geometry]);
  useFrame((_, delta) => {
    if (!material.current) return;
    const goal = focused ? 0.045 : active ? 0.25 : 0.13;
    material.current.opacity +=
      (goal - material.current.opacity) *
      (reduced ? 1 : 1 - Math.exp(-Math.min(delta, 0.05) * 3.5));
  });
  return (
    <lineLoop geometry={geometry}>
      <lineBasicMaterial
        ref={material}
        color="#9394af"
        transparent
        opacity={0.13}
        depthWrite={false}
      />
    </lineLoop>
  );
}
