import { useEffect, useMemo } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { Vector3 } from 'three';
import { planets } from '../../data/universe';
import type { Destination, Mode } from '../../types/universe';
import StarField from './StarField';
import Sun from './Sun';
import Planet from './Planet';
import Orbit from './Orbit';
import CameraController from './CameraController';
import SceneFade from './SceneFade';
import { scene } from '../../config/scene';

interface Props {
  selected: Destination | null;
  mode: Mode;
  reduced: boolean;
  paused: boolean;
  mobile: boolean;
  onSelect: (id: Destination) => void;
  onReady: () => void;
  onSettled: () => void;
  onError: () => void;
  onSecret: () => void;
}
function ContextGuard({ onError }: { onError: () => void }) {
  const { gl } = useThree();
  useEffect(() => {
    const canvas = gl.domElement;
    const lost = (e: Event) => {
      e.preventDefault();
      onError();
    };
    canvas.addEventListener('webglcontextlost', lost);
    return () => canvas.removeEventListener('webglcontextlost', lost);
  }, [gl, onError]);
  return null;
}
export default function UniverseCanvas(props: Props) {
  const {
    selected,
    mode,
    reduced,
    paused,
    mobile,
    onSelect,
    onReady,
    onSettled,
    onError,
    onSecret,
  } = props;
  const positions = useMemo(
    () =>
      new Map<string, Vector3>([
        ['us', new Vector3()],
        ...planets.map(
          (p) =>
            [p.id, new Vector3(Math.cos(p.angle) * p.orbit, 0, Math.sin(p.angle) * p.orbit)] as [
              string,
              Vector3,
            ],
        ),
      ]),
    [],
  );
  return (
    <Canvas
      frameloop={reduced ? 'demand' : 'always'}
      camera={{ position: scene.introEye, fov: scene.fov, near: 0.1, far: 180 }}
      dpr={[1, mobile ? 1.25 : 1.6]}
      gl={{ alpha: true, antialias: !mobile, powerPreference: 'low-power' }}
      onCreated={onReady}
      fallback={null}
    >
      <ContextGuard onError={onError} />
      <ambientLight intensity={0.6} />
      <StarField
        reduced={reduced || paused}
        count={mobile ? (mode === 'ending' ? 850 : 650) : mode === 'ending' ? 2200 : 1800}
      />
      <SceneFade shown={!selected || selected === 'us'} reduced={reduced}>
        <Sun
          mobile={mobile}
          reduced={reduced || paused}
          labels={!selected && mode !== 'ending' && mode !== 'constellations'}
          onSelect={() => onSelect('us')}
        />
      </SceneFade>
      {planets.map((p) => (
        <group key={p.id}>
          <Orbit
            radius={p.orbit}
            active={mode === 'explore' && !selected}
            reduced={reduced}
            focused={!!selected}
          />
          <SceneFade shown={!selected || selected === p.id} reduced={reduced}>
            <Planet
              mobile={mobile}
              planet={p}
              reduced={reduced || paused}
              moving={mode === 'explore' && !selected && !paused}
              labels={!selected && mode !== 'ending' && mode !== 'constellations'}
              positions={positions}
              onSelect={() => onSelect(p.id)}
              onSecret={onSecret}
            />
          </SceneFade>
        </group>
      ))}
      <CameraController
        selected={selected}
        mode={mode}
        reduced={reduced}
        mobile={mobile}
        positions={positions}
        onSettled={onSettled}
      />
    </Canvas>
  );
}
