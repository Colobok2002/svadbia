import Iridescence from "../Iridescence/Iridescence";
import "./PearlFilmBackdrop.scss";

const pearlColor = [0.92, 0.83, 0.78];

export default function PearlFilmBackdrop({ reducedMotion = false, mobile = false, paused = false }) {
  return (
    <div className="pearl-film-backdrop">
      <Iridescence
        className="pearl-film-backdrop__light"
        color={pearlColor}
        speed={reducedMotion ? 0 : 0.22}
        amplitude={0.08}
        pointerReact={false}
        dpr={mobile ? 1 : 1.5}
        maxFps={mobile ? 30 : 60}
        paused={paused}
      />

      <svg className="pearl-film-backdrop__grain" aria-hidden="true">
        <filter id="pearl-film-grain">
          <feTurbulence type="fractalNoise" baseFrequency="0.82" numOctaves="4" seed="28" stitchTiles="stitch" />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter="url(#pearl-film-grain)" />
      </svg>
    </div>
  );
}
