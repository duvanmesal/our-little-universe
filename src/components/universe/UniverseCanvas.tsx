import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
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
  active: boolean;
  travelling: boolean;
  onSelect: (id: Destination) => void;
  onReady: () => void;
  onSettled: () => void;
  onError: () => void;
  onSecret: () => void;
}
/** Lower the GPU budget once when sustained frame times exceed 25ms, never oscillating. */
function FrameBudget({ onSlow }: { onSlow: () => void }) {
  const sample = useRef({ warmup: 0, frames: 0, seconds: 0, lowered: false });
  useFrame((_, delta) => {
    const s = sample.current;
    if (s.lowered || delta > 0.25) return;
    s.warmup += delta;
    if (s.warmup < 2) return;
    s.frames++;
    s.seconds += delta;
    if (s.frames < 90) return;
    if (s.seconds / s.frames > 0.025) {
      s.lowered = true;
      onSlow();
    }
    s.frames = 0;
    s.seconds = 0;
  });
  return null;
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
    active,
    travelling,
    onSelect,
    onReady,
    onSettled,
    onError,
    onSecret,
  } = props;
  const [visible, setVisible] = useState(true);
  const [lowQuality, setLowQuality] = useState(false);
  const lowerQuality = useCallback(() => setLowQuality(true), []);
  useEffect(() => {
    const sync = () => setVisible(!document.hidden);
    sync();
    document.addEventListener('visibilitychange', sync);
    return () => document.removeEventListener('visibilitychange', sync);
  }, []);
  const lightweight = mobile || lowQuality;
  const running = visible && active && (travelling || (!reduced && !paused));
  const labels = mode === 'explore' && !selected;
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
      frameloop={!visible ? 'never' : running ? 'always' : 'demand'}
      camera={{ position: scene.introEye, fov: scene.fov, near: 0.1, far: 180 }}
      dpr={[1, lowQuality ? 1 : mobile ? 1.1 : 1.5]}
      gl={{ alpha: true, antialias: !mobile, powerPreference: 'low-power' }}
      onCreated={onReady}
      fallback={null}
    >
      <ContextGuard onError={onError} />
      {running && !lowQuality && <FrameBudget onSlow={lowerQuality} />}
      <ambientLight intensity={0.6} />
      <StarField reduced={reduced || paused} count={lightweight ? 650 : 1400} />
      <SceneFade shown={!selected || selected === 'us'} reduced={reduced}>
        <Sun
          mobile={lightweight}
          reduced={reduced || paused || (!!selected && selected !== 'us')}
          labels={labels}
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
              mobile={lightweight}
              active={!selected || selected === p.id}
              planet={p}
              reduced={reduced || paused}
              moving={mode === 'explore' && !selected && !paused}
              labels={labels}
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
