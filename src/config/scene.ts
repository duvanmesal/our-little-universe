/** Geometry shared by the 3D scene and the HTML dedication that lands on the sun. */
export const scene = {
  fov: 32,
  sunRadius: 0.88,
  /** Close framing held behind the dedication; the golden star grows into the sun here. */
  introEye: [0, 1.2, 10.5] as [number, number, number],
};

/** On-screen diameter of the sun, in px, for a stage of the given height at the intro framing. */
export function introSunDiameter(stageHeight: number) {
  const distance = Math.hypot(...scene.introEye);
  const halfFov = (scene.fov / 2) * (Math.PI / 180);
  return (stageHeight * scene.sunRadius) / (distance * Math.tan(halfFov));
}
