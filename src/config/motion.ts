/** Durations in seconds for 3D movement, milliseconds for retained HTML. */
export const motion = {
  camera: { focus: 1.85, overview: 2.2, intro: 3.4, ending: 3.2 },
  contentExit: 240,
  memoryExit: 180,
  dateSpin: 1400,
  fadeSpeed: 5.5,
};

/** Zero velocity and acceleration at both ends. */
export function cinematicEase(progress: number) {
  const t = Math.max(0, Math.min(1, progress));
  return t * t * t * (t * (t * 6 - 15) + 10);
}
