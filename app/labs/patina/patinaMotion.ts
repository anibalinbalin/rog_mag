export type PatinaMotionSettings = {
  dispBase: number;
  lightZ: number;
  viewArc: number;
  /** Fixed key-light position; relocating it moves the lane the highlight
      travels in. Defaults preserve the original upper-right key. */
  lightX?: number;
  lightY?: number;
  /** Observer path shape: vertical half-span (travels +spanY → −spanY) and
      how many full sine periods the lateral swing completes over the scroll
      (0.5 = one single arc). Defaults preserve the original path. */
  spanY?: number;
  periods?: number;
};

export function getPatinaSceneState(
  progress: number,
  reducedMotion: boolean,
  settings: PatinaMotionSettings,
) {
  const p = reducedMotion ? 0.5 : Math.min(Math.max(progress, 0), 1);
  const spanY = settings.spanY ?? 0.72;
  const periods = settings.periods ?? 1;

  return {
    // Relief gives the cover depth, but never responds to scroll. Keeping this
    // invariant prevents perspective from making the book grow or drift.
    displacement: settings.dispBase,
    light: {
      x: settings.lightX ?? 0.26,
      y: settings.lightY ?? 0.52,
      z: settings.lightZ,
    },
    // The projection stays fixed. Only the view vector used by the material
    // travels, like an observer panning over a book resting on a table.
    observer: {
      x: Math.sin(p * Math.PI * 2 * periods) * settings.viewArc,
      y: spanY - p * spanY * 2,
      z: 2.1,
    },
  };
}
