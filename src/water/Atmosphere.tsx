/**
 * Above the water on every screen (§4): a fine grain overlay (mix-blend overlay,
 * ~4%) + a soft radial vignette pulling focus to center. Pure CSS, no JS cost.
 * The backdrop's per-bucket legibility scrim (§7, inside <Scene/>) is the
 * contrast floor now, so the old flat veil is gone — no double-darkening.
 */
export default function Atmosphere() {
  return (
    <>
      <div className="grain" aria-hidden />
      <div className="center-scrim" aria-hidden />
      <div className="bleed-base" aria-hidden />
      <div className="vignette" aria-hidden />
    </>
  );
}
