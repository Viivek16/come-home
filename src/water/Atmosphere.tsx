/**
 * Above the water on every screen (§4): a fine grain overlay (mix-blend overlay,
 * ~4%) + a soft radial vignette pulling focus to center. Pure CSS, no JS cost.
 */
export default function Atmosphere() {
  return (
    <>
      <div className="grain" aria-hidden />
      <div className="center-scrim" aria-hidden />
      <div className="vignette" aria-hidden />
    </>
  );
}
