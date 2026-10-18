import { useEffect, useLayoutEffect, useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Vector3 } from 'three';
import { cinematicEase, motion } from '../../config/motion';
import type { Destination, Mode } from '../../types/universe';

interface Props {
  selected: Destination | null;
  mode: Mode;
  reduced: boolean;
  mobile: boolean;
  positions: Map<string, Vector3>;
  onSettled: () => void;
}

export default function CameraController({
  selected,
  mode,
  reduced,
  mobile,
  positions,
  onSettled,
}: Props) {
  const { camera, gl, invalidate } = useThree();
  const target = useRef(new Vector3());
  const drag = useRef({ x: 0, y: 0, zoom: 0, down: false, px: 0, py: 0 });
  const flight = useMemo(
    () => ({
      fromEye: new Vector3(),
      toEye: new Vector3(),
      fromLook: new Vector3(),
      toLook: new Vector3(),
      offset: new Vector3(),
      elapsed: 0,
      duration: 1,
      active: true,
      lift: 0,
    }),
    [],
  );

  useLayoutEffect(() => {
    drag.current.down = false;
    flight.fromEye.copy(camera.position);
    flight.fromLook.copy(target.current);
    flight.elapsed = 0;
    flight.active = true;
    if (selected) {
      flight.toLook.copy(positions.get(selected) ?? flight.offset.set(0, 0, 0));
      flight.toLook.x += mobile ? 0 : 2.1;
      flight.toLook.y -= mobile ? 0.6 : 0;
      flight.toEye.copy(flight.toLook).add(flight.offset.set(0, 2.4, mobile ? 9 : 7));
      flight.duration = motion.camera.focus;
    } else if (mode === 'constellations') {
      flight.toLook.set(0, 3, 0);
      flight.toEye.set(8, 18, mobile ? 55 : 42);
      flight.duration = motion.camera.ending;
    } else {
      const multiplier = mode === 'ending' ? 1.3 : mode === 'intro' ? 1.06 : 1;
      flight.toLook.set(0, 0, 0);
      flight.toEye.set(
        drag.current.x,
        (mobile ? 22 : 9) * multiplier + drag.current.y,
        ((mobile ? 38 : 22) + drag.current.zoom) * multiplier,
      );
      flight.duration =
        mode === 'ending'
          ? motion.camera.ending
          : mode === 'intro'
            ? motion.camera.intro
            : motion.camera.overview;
    }
    flight.lift = Math.min(1.1, flight.fromEye.distanceTo(flight.toEye) * 0.045);
    invalidate();
  }, [selected, mode, mobile, reduced, camera, positions, flight, invalidate]);

  useEffect(() => {
    const el = gl.domElement;
    const down = (e: PointerEvent) => {
      if (selected || mode !== 'explore' || flight.active) return;
      Object.assign(drag.current, { down: true, px: e.clientX, py: e.clientY });
    };
    const move = (e: PointerEvent) => {
      const d = drag.current;
      if (!d.down) return;
      d.x = Math.max(-3, Math.min(3, d.x + (e.clientX - d.px) * 0.008));
      d.y = Math.max(-2, Math.min(2, d.y + (e.clientY - d.py) * 0.008));
      d.px = e.clientX;
      d.py = e.clientY;
      invalidate();
    };
    const up = () => {
      drag.current.down = false;
    };
    const wheel = (e: WheelEvent) => {
      if (selected || mode !== 'explore') return;
      e.preventDefault();
      if (flight.active) return;
      drag.current.zoom = Math.max(-3, Math.min(5, drag.current.zoom + e.deltaY * 0.008));
      invalidate();
    };
    el.addEventListener('pointerdown', down);
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
    window.addEventListener('pointercancel', up);
    el.addEventListener('wheel', wheel, { passive: false });
    return () => {
      el.removeEventListener('pointerdown', down);
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
      window.removeEventListener('pointercancel', up);
      el.removeEventListener('wheel', wheel);
    };
  }, [gl, selected, mode, flight, invalidate]);

  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.05);
    if (flight.active) {
      flight.elapsed += dt;
      const progress = reduced ? 1 : Math.min(1, flight.elapsed / flight.duration);
      const eased = cinematicEase(progress);
      camera.position.lerpVectors(flight.fromEye, flight.toEye, eased);
      // A shallow arc gives the journey depth without rolling the horizon.
      camera.position.y += Math.sin(Math.PI * eased) ** 2 * flight.lift;
      target.current.lerpVectors(flight.fromLook, flight.toLook, eased);
      if (progress === 1) {
        flight.active = false;
        onSettled();
      }
    } else if (!selected && mode === 'explore') {
      flight.toEye.set(
        drag.current.x,
        (mobile ? 22 : 9) + drag.current.y,
        (mobile ? 38 : 22) + drag.current.zoom,
      );
      camera.position.lerp(flight.toEye, reduced ? 1 : 1 - Math.exp(-dt * 4.5));
    }
    camera.lookAt(target.current);
  });
  return null;
}
