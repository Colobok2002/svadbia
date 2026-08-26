import LightRays from "../LightRays/LightRays";
import "./GardenBackdrop.scss";

function LeafBranch({ className }) {
  return (
    <svg className={className} viewBox="0 0 360 720" aria-hidden="true">
      <g>
        <path className="garden-leaf__stem" d="M18 714C72 612 102 532 119 438C139 326 189 224 322 74" />
        <path d="M89 564C39 545 24 491 49 450C100 450 132 491 118 536C110 552 101 559 89 564Z" />
        <path d="M124 455C81 421 84 364 118 335C165 351 183 400 158 438C146 451 136 455 124 455Z" />
        <path d="M164 346C138 300 159 249 199 231C237 259 241 311 208 342C192 352 179 352 164 346Z" />
        <path d="M214 249C198 204 225 161 263 151C294 181 291 226 260 249C243 257 229 255 214 249Z" />
        <path d="M261 171C256 130 285 96 320 93C342 123 333 161 303 178C286 183 273 179 261 171Z" />
        <path d="M115 491C141 448 194 439 229 467C215 515 169 538 128 516C117 508 113 500 115 491Z" />
        <path d="M155 380C183 340 234 335 266 365C248 411 202 428 165 404C154 397 151 389 155 380Z" />
        <path d="M205 276C240 246 288 254 311 288C285 327 240 337 211 307C203 298 201 287 205 276Z" />
      </g>
    </svg>
  );
}

export default function GardenBackdrop({ reducedMotion = false }) {
  return (
    <div className={`garden-backdrop${reducedMotion ? " garden-backdrop--still" : ""}`}>
      <LightRays
        raysOrigin="top-right"
        raysColor="#fff0d8"
        raysSpeed={reducedMotion ? 0 : 0.18}
        lightSpread={0.72}
        rayLength={2.8}
        pulsating={!reducedMotion}
        fadeDistance={1.05}
        saturation={0.76}
        followMouse={!reducedMotion}
        mouseInfluence={0.055}
        noiseAmount={0.055}
        distortion={0.035}
      />

      <LeafBranch className="garden-leaf garden-leaf--left" />
      <LeafBranch className="garden-leaf garden-leaf--right" />

      <svg className="garden-paper-noise" aria-hidden="true">
        <filter id="garden-paper-grain">
          <feTurbulence type="fractalNoise" baseFrequency="0.72" numOctaves="3" seed="12" stitchTiles="stitch" />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter="url(#garden-paper-grain)" />
      </svg>
    </div>
  );
}
