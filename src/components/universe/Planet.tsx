import { useMemo, useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei/web/Html.js';
import { Color, type Group, type Mesh, Vector3 } from 'three';
import type { PlanetData } from '../../types/universe';
import { surfaceFragment, surfaceVertex } from './materials';

interface Props {
  planet: PlanetData;
  moving: boolean;
  reduced: boolean;
  mobile: boolean;
  labels: boolean;
  positions: Map<string, Vector3>;
  onSelect: () => void;
  onSecret: () => void;
}
export default function Planet({
  planet: p,
  moving,
  reduced,
  mobile,
  labels,
  positions,
  onSelect,
  onSecret,
}: Props) {
  const orbit = useRef<Group>(null);
  const body = useRef<Mesh>(null);
  const moon = useRef<Group>(null);
  const angle = useRef(p.angle);
  const moonClicks = useRef(0);
  const [hovered, setHovered] = useState(false);
  const uniforms = useMemo(
    () => ({
      uColor: { value: new Color(p.color) },
      uDark: { value: new Color(p.darkColor) },
      uSeed: { value: p.seed },
      uTime: { value: 0 },
      uOpacity: { value: 1 },
    }),
    [p],
  );
  useFrame((_, delta) => {
    if (!orbit.current || !body.current) return;
    const dt = Math.min(delta, 0.05);
    if (moving && !reduced) angle.current += dt * p.speed;
    orbit.current.position.set(
      Math.cos(angle.current) * p.orbit,
      0,
      Math.sin(angle.current) * p.orbit,
    );
    const position = positions.get(p.id);
    if (position) position.copy(orbit.current.position);
    if (!reduced) {
      body.current.rotation.y += dt * 0.065;
      if (moon.current) moon.current.rotation.y += dt * 0.22;
    }
    const scale = hovered ? 1.1 : 1;
    body.current.scale.lerp(newScale.setScalar(scale), reduced ? 1 : 1 - Math.exp(-dt * 6));
  });
  return (
    <group ref={orbit} position={[Math.cos(p.angle) * p.orbit, 0, Math.sin(p.angle) * p.orbit]}>
      <mesh
        ref={body}
        onPointerOver={(e) => {
          e.stopPropagation();
          setHovered(true);
        }}
        onPointerOut={() => setHovered(false)}
        onClick={(e) => {
          e.stopPropagation();
          onSelect();
        }}
      >
        <sphereGeometry args={[p.size, mobile ? 24 : 48, mobile ? 16 : 32]} />
        <shaderMaterial
          uniforms={uniforms}
          vertexShader={surfaceVertex}
          fragmentShader={surfaceFragment}
        />
      </mesh>
      {p.rings && (
        <group rotation={[0.35, 0, 0.2]}>
          <mesh rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[p.size * 1.45, p.size * 2.15, 96]} />
            <meshBasicMaterial
              color={p.color}
              transparent
              opacity={0.23}
              side={2}
              depthWrite={false}
            />
          </mesh>
          <mesh rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[p.size * 2.23, p.size * 2.28, 96]} />
            <meshBasicMaterial color={p.color} transparent opacity={0.3} side={2} />
          </mesh>
        </group>
      )}
      {p.moon && (
        <group ref={moon}>
          <mesh
            position={[p.size * 1.8, 0.12, 0.2]}
            onClick={(e) => {
              e.stopPropagation();
              moonClicks.current++;
              if (moonClicks.current === 3) {
                onSecret();
                moonClicks.current = 0;
              }
            }}
          >
            <sphereGeometry args={[0.1, 16, 12]} />
            <meshStandardMaterial color="#bbb6bf" roughness={1} />
          </mesh>
        </group>
      )}
      {(p.id === 'adventures' || p.id === 'dreams') &&
        [0, 1, 2, 3, 4].map((i) => (
          <mesh
            key={i}
            position={[Math.cos(i * 1.25) * p.size * 1.75, Math.sin(i * 1.25) * p.size * 1.6, 0.2]}
          >
            <sphereGeometry args={[0.025, 8, 8]} />
            <meshBasicMaterial color={p.color} />
          </mesh>
        ))}
      {
        <Html position={[0, -p.size - 0.72, 0]} center zIndexRange={[10, 0]}>
          <button
            className={`planet-label ${hovered ? 'is-hovered' : ''} ${labels ? '' : 'label-hidden'}`}
            tabIndex={labels ? 0 : -1}
            aria-hidden={!labels}
            inert={!labels}
            onPointerEnter={() => setHovered(true)}
            onPointerLeave={() => setHovered(false)}
            onClick={onSelect}
          >
            <strong>{p.name}</strong>
            <span>{p.description}</span>
          </button>
        </Html>
      }
    </group>
  );
}
const newScale = new Vector3();
