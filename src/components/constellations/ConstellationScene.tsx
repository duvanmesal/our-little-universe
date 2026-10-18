import { useEffect, useMemo, useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import {
  AdditiveBlending,
  BufferGeometry,
  Color,
  Float32BufferAttribute,
  Group,
  Line,
  LineBasicMaterial,
} from 'three';
import {
  connectionPoints,
  connectionRevealed,
  starKey,
  type ConstellationChapter,
} from '../../data/constellations';
import { cinematicEase } from '../../config/motion';

interface Props {
  chapter: ConstellationChapter;
  visited: string[];
  selected: string | null;
  reduced: boolean;
  paused: boolean;
  onError: () => void;
}
type Point = [number, number, number];
const palette = { gold: '#dac6a4', ice: '#a8d9ea', lavender: '#bab4d0' };
const vertexShader = `varying vec2 vUv; void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`;
const fragmentShader = `
varying vec2 vUv;
uniform vec3 tint;
void main() {
  vec2 p = (vUv - .5) * 2.;
  float r = length(p);
  float halo = exp(-r * 5.) * .22;
  float core = exp(-r * 35.);
  float rays = (exp(-abs(p.x) * 100.) + exp(-abs(p.y) * 100.)) * pow(max(0., 1. - r), 3.) * .45;
  float light = (halo + core + rays) * (1. - smoothstep(.65, 1., r));
  gl_FragColor = vec4(mix(tint, vec3(1.), core), light);
}`;

function Glow({ color }: { color: string }) {
  const uniforms = useMemo(() => ({ tint: { value: new Color(color) } }), [color]);
  return (
    <mesh>
      <planeGeometry args={[0.65, 0.65]} />
      <shaderMaterial
        uniforms={uniforms}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        transparent
        blending={AdditiveBlending}
        depthWrite={false}
      />
    </mesh>
  );
}

function Connection({
  points,
  lit,
  reduced,
  paused,
  color,
}: {
  points: Point[];
  lit: boolean;
  reduced: boolean;
  paused: boolean;
  color: string;
}) {
  const elapsed = useRef(0);
  const spark = useRef<Group>(null);
  const { invalidate } = useThree();
  const vertices = useMemo(() => {
    const result: number[] = [];
    points.slice(0, -1).forEach((from, segment) => {
      const to = points[segment + 1]!;
      for (let i = 0; i < 32; i++)
        result.push(...from.map((v, axis) => v + ((to[axis]! - v) * i) / 32));
    });
    result.push(...points[points.length - 1]!);
    return result;
  }, [points]);
  const line = useMemo(() => {
    const geometry = new BufferGeometry();
    geometry.setAttribute('position', new Float32BufferAttribute(vertices, 3));
    geometry.setDrawRange(0, 0);
    return new Line(
      geometry,
      new LineBasicMaterial({ color, transparent: true, opacity: 0.8, depthWrite: false }),
    );
  }, [vertices, color]);
  useEffect(
    () => () => {
      line.geometry.dispose();
      line.material.dispose();
    },
    [line],
  );
  useEffect(() => {
    invalidate();
  }, [lit, reduced, paused, invalidate]);
  useFrame((_, delta) => {
    elapsed.current = !lit
      ? 0
      : reduced || paused
        ? 1
        : Math.min(1, elapsed.current + Math.min(delta, 0.05) / 1.15);
    const progress = cinematicEase(elapsed.current);
    const count = vertices.length / 3;
    const head = Math.floor(progress * (count - 1));
    line.geometry.setDrawRange(0, lit ? head + 1 : 0);
    if (spark.current) {
      spark.current.visible = lit && progress > 0 && progress < 1 && !reduced && !paused;
      spark.current.position.set(vertices[head * 3]!, vertices[head * 3 + 1]!, 0.01);
      spark.current.scale.setScalar(Math.sin(Math.PI * progress) * 0.8);
    }
    if (lit && progress < 1) invalidate();
  });
  return (
    <>
      <primitive object={line} />
      <group ref={spark} visible={false}>
        <Glow color={color} />
      </group>
    </>
  );
}

function Star({
  position,
  color,
  lit,
  selected,
  instant,
}: {
  position: Point;
  color: string;
  lit: boolean;
  selected: boolean;
  instant: boolean;
}) {
  const group = useRef<Group>(null);
  const { invalidate } = useThree();
  const target = selected ? 1.7 : lit ? 1.15 : 0.7;
  useEffect(() => {
    invalidate();
  }, [target, instant, invalidate]);
  useFrame((_, delta) => {
    if (!group.current) return;
    const current = group.current.scale.x;
    const next = instant
      ? target
      : current + (target - current) * (1 - Math.exp(-Math.min(delta, 0.05) * 8));
    group.current.scale.setScalar(next);
    if (Math.abs(target - next) > 0.001) invalidate();
  });
  return (
    <group position={position}>
      <group ref={group}>
        <Glow color={color} />
      </group>
    </group>
  );
}

function Sky({ chapter, visited, selected, reduced, paused, onError }: Props) {
  const { viewport, gl } = useThree();
  const coordinates = useMemo(() => {
    const project = ([x, y]: [number, number]): Point => [
      (x / 100 - 0.5) * viewport.width,
      (0.5 - y / 100) * viewport.height,
      0,
    ];
    return {
      stars: new Map(chapter.stars.map((star) => [star.id, project(star.position)])),
      paths: chapter.connections.map((edge) => connectionPoints(chapter, edge).map(project)),
    };
  }, [chapter, viewport.width, viewport.height]);
  useEffect(() => {
    const canvas = gl.domElement;
    const lost = (event: Event) => {
      event.preventDefault();
      onError();
    };
    canvas.addEventListener('webglcontextlost', lost);
    return () => canvas.removeEventListener('webglcontextlost', lost);
  }, [gl, onError]);
  const color = palette[chapter.tone];
  return (
    <>
      {chapter.connections.map((edge, index) => (
        <Connection
          key={edge.join('-')}
          points={coordinates.paths[index]!}
          lit={connectionRevealed(chapter, edge, visited)}
          reduced={reduced}
          paused={paused}
          color={color}
        />
      ))}
      {chapter.stars.map((star) => (
        <Star
          key={star.id}
          position={coordinates.stars.get(star.id)!}
          color={color}
          lit={visited.includes(starKey(chapter.id, star.id))}
          selected={selected === star.id}
          instant={reduced || paused}
        />
      ))}
    </>
  );
}

export default function ConstellationScene(props: Props) {
  return (
    <Canvas
      frameloop="demand"
      // Ignore CSS entrance transforms when measuring the drawing surface.
      resize={{ offsetSize: true }}
      dpr={[1, 1.5]}
      camera={{ position: [0, 0, 5], fov: 40 }}
      gl={{ alpha: true, antialias: true, powerPreference: 'low-power' }}
    >
      <Sky {...props} />
    </Canvas>
  );
}
