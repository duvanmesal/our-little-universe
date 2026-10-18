import { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei/web/Html.js';
import { AdditiveBlending, CanvasTexture, type Mesh, type ShaderMaterial } from 'three';
import { sunFragment, surfaceVertex } from './materials';

export default function Sun({
  reduced,
  mobile,
  labels,
  onSelect,
}: {
  reduced: boolean;
  mobile: boolean;
  labels: boolean;
  onSelect: () => void;
}) {
  const mesh = useRef<Mesh>(null);
  const material = useRef<ShaderMaterial>(null);
  const uniforms = useMemo(() => ({ uTime: { value: 0 }, uOpacity: { value: 1 } }), []);
  const glow = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = 128;
    const ctx = canvas.getContext('2d')!;
    const gradient = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
    gradient.addColorStop(0, 'rgba(255,224,166,.75)');
    gradient.addColorStop(0.22, 'rgba(250,187,112,.35)');
    gradient.addColorStop(0.46, 'rgba(224,145,83,.09)');
    gradient.addColorStop(1, 'rgba(201,119,75,0)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 128, 128);
    return new CanvasTexture(canvas);
  }, []);
  useEffect(() => () => glow.dispose(), [glow]);
  useFrame((_, delta) => {
    if (reduced || !mesh.current || !material.current) return;
    mesh.current.rotation.y += delta * 0.04;
    material.current.uniforms.uTime!.value += Math.min(delta, 0.1);
  });
  return (
    <group>
      <sprite scale={[6.8, 6.8, 1]}>
        <spriteMaterial map={glow} transparent blending={AdditiveBlending} depthWrite={false} />
      </sprite>
      <mesh
        ref={mesh}
        onClick={(e) => {
          e.stopPropagation();
          onSelect();
        }}
      >
        <sphereGeometry args={[0.88, mobile ? 24 : 48, mobile ? 16 : 32]} />
        <shaderMaterial
          ref={material}
          uniforms={uniforms}
          vertexShader={surfaceVertex}
          fragmentShader={sunFragment}
        />
      </mesh>
      <pointLight color="#ffd3a2" intensity={12} distance={24} decay={2} />
      {
        <Html position={[0, -1.7, 0]} center zIndexRange={[10, 0]}>
          <button
            className={`planet-label sun-label ${labels ? '' : 'label-hidden'}`}
            tabIndex={labels ? 0 : -1}
            aria-hidden={!labels}
            inert={!labels}
            onClick={onSelect}
          >
            <strong>Us</strong>
            <span>The center of it all</span>
          </button>
        </Html>
      }
    </group>
  );
}
