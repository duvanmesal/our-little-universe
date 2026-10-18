import { useLayoutEffect, useRef, type ReactNode } from 'react';
import { useFrame } from '@react-three/fiber';
import { Material, Mesh, ShaderMaterial, Sprite, type Group } from 'three';
import { motion } from '../../config/motion';

interface Surface {
  material: Material;
  opacity: number;
  depthWrite: boolean;
}

export default function SceneFade({
  shown,
  reduced,
  children,
}: {
  shown: boolean;
  reduced: boolean;
  children: ReactNode;
}) {
  const group = useRef<Group>(null);
  const opacity = useRef(shown ? 1 : 0);
  const surfaces = useRef<Surface[]>([]);
  const lastOpacity = useRef(-1);
  useLayoutEffect(() => {
    const found = new Set<Material>();
    group.current?.traverse((object) => {
      if (object instanceof Mesh || object instanceof Sprite) {
        const materials = Array.isArray(object.material) ? object.material : [object.material];
        materials.forEach((material) => found.add(material));
      }
    });
    surfaces.current = [...found].map((material) => {
      material.transparent = true;
      material.needsUpdate = true;
      return { material, opacity: material.opacity, depthWrite: material.depthWrite };
    });
  }, []);
  useFrame((_, delta) => {
    const goal = shown ? 1 : 0;
    if (!group.current) return;
    opacity.current = reduced
      ? goal
      : opacity.current +
        (goal - opacity.current) * (1 - Math.exp(-Math.min(delta, 0.05) * motion.fadeSpeed));
    if (Math.abs(opacity.current - goal) < 0.002) opacity.current = goal;
    if (opacity.current === lastOpacity.current) return;
    lastOpacity.current = opacity.current;
    group.current.visible = opacity.current > 0;
    for (const surface of surfaces.current) {
      const { material } = surface;
      const alpha = surface.opacity * opacity.current;
      material.opacity = alpha;
      material.depthWrite = surface.depthWrite && opacity.current > 0.99;
      if (material instanceof ShaderMaterial && material.uniforms.uOpacity)
        material.uniforms.uOpacity.value = alpha;
    }
  });
  return <group ref={group}>{children}</group>;
}
