import { useEffect, useRef } from "react";
import { Mesh, Program, Renderer, Triangle } from "ogl";
import "./LightRays.css";

// Adapted from the React Bits Light Rays background component.
const hexToRgb = (hex) => {
  const match = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return match
    ? [parseInt(match[1], 16) / 255, parseInt(match[2], 16) / 255, parseInt(match[3], 16) / 255]
    : [1, 1, 1];
};

const getAnchorAndDirection = (origin, width, height) => {
  const outside = 0.2;
  const positions = {
    "top-left": { anchor: [0, -outside * height], direction: [0, 1] },
    "top-center": { anchor: [0.5 * width, -outside * height], direction: [0, 1] },
    "top-right": { anchor: [width, -outside * height], direction: [0, 1] },
    left: { anchor: [-outside * width, 0.5 * height], direction: [1, 0] },
    right: { anchor: [(1 + outside) * width, 0.5 * height], direction: [-1, 0] },
    "bottom-left": { anchor: [0, (1 + outside) * height], direction: [0, -1] },
    "bottom-center": { anchor: [0.5 * width, (1 + outside) * height], direction: [0, -1] },
    "bottom-right": { anchor: [width, (1 + outside) * height], direction: [0, -1] },
  };
  return positions[origin] ?? positions["top-center"];
};

const vertexShader = `
attribute vec2 position;
varying vec2 vUv;

void main() {
  vUv = position * 0.5 + 0.5;
  gl_Position = vec4(position, 0.0, 1.0);
}
`;

const fragmentShader = `
precision highp float;

uniform float iTime;
uniform vec2 iResolution;
uniform vec2 rayPos;
uniform vec2 rayDir;
uniform vec3 raysColor;
uniform float raysSpeed;
uniform float lightSpread;
uniform float rayLength;
uniform float pulsating;
uniform float fadeDistance;
uniform float saturation;
uniform vec2 mousePos;
uniform float mouseInfluence;
uniform float noiseAmount;
uniform float distortion;

varying vec2 vUv;

float randomNoise(vec2 st) {
  return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
}

float rayStrength(
  vec2 source,
  vec2 referenceDirection,
  vec2 coordinate,
  float seedA,
  float seedB,
  float speed
) {
  vec2 sourceToCoordinate = coordinate - source;
  vec2 normalizedDirection = normalize(sourceToCoordinate);
  float cosineAngle = dot(normalizedDirection, referenceDirection);
  float distortedAngle = cosineAngle + distortion * sin(iTime * 2.0 + length(sourceToCoordinate) * 0.01) * 0.2;
  float spread = pow(max(distortedAngle, 0.0), 1.0 / max(lightSpread, 0.001));
  float distanceFromSource = length(sourceToCoordinate);
  float maximumDistance = iResolution.x * rayLength;
  float lengthFalloff = clamp((maximumDistance - distanceFromSource) / maximumDistance, 0.0, 1.0);
  float fadeFalloff = clamp(
    (iResolution.x * fadeDistance - distanceFromSource) / (iResolution.x * fadeDistance),
    0.5,
    1.0
  );
  float pulse = pulsating > 0.5 ? 0.82 + 0.18 * sin(iTime * speed * 3.0) : 1.0;
  float baseStrength = clamp(
    (0.45 + 0.15 * sin(distortedAngle * seedA + iTime * speed)) +
    (0.3 + 0.2 * cos(-distortedAngle * seedB + iTime * speed)),
    0.0,
    1.0
  );
  return baseStrength * lengthFalloff * fadeFalloff * spread * pulse;
}

void main() {
  vec2 coordinate = vec2(gl_FragCoord.x, iResolution.y - gl_FragCoord.y);
  vec2 finalDirection = rayDir;

  if (mouseInfluence > 0.0) {
    vec2 mouseScreenPosition = mousePos * iResolution.xy;
    vec2 mouseDirection = normalize(mouseScreenPosition - rayPos);
    finalDirection = normalize(mix(rayDir, mouseDirection, mouseInfluence));
  }

  vec4 firstRays = vec4(1.0) * rayStrength(rayPos, finalDirection, coordinate, 36.2214, 21.11349, 1.5 * raysSpeed);
  vec4 secondRays = vec4(1.0) * rayStrength(rayPos, finalDirection, coordinate, 22.3991, 18.0234, 1.1 * raysSpeed);
  vec4 color = firstRays * 0.5 + secondRays * 0.4;

  if (noiseAmount > 0.0) {
    float grain = randomNoise(coordinate * 0.01 + iTime * 0.1);
    color.rgb *= 1.0 - noiseAmount + noiseAmount * grain;
  }

  float brightness = 1.0 - coordinate.y / iResolution.y;
  color.r *= 0.1 + brightness * 0.8;
  color.g *= 0.3 + brightness * 0.6;
  color.b *= 0.5 + brightness * 0.5;

  if (saturation != 1.0) {
    float gray = dot(color.rgb, vec3(0.299, 0.587, 0.114));
    color.rgb = mix(vec3(gray), color.rgb, saturation);
  }

  color.rgb *= raysColor;
  gl_FragColor = color;
}
`;

export default function LightRays({
  raysOrigin = "top-center",
  raysColor = "#ffffff",
  raysSpeed = 1,
  lightSpread = 1,
  rayLength = 2,
  pulsating = false,
  fadeDistance = 1,
  saturation = 1,
  followMouse = true,
  mouseInfluence = 0.1,
  noiseAmount = 0,
  distortion = 0,
  className = "",
}) {
  const containerRef = useRef(null);
  const mouseRef = useRef({ x: 0.5, y: 0.5 });
  const smoothMouseRef = useRef({ x: 0.5, y: 0.5 });

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return undefined;

    const renderer = new Renderer({
      dpr: Math.min(window.devicePixelRatio, 1.5),
      alpha: true,
    });
    const { gl } = renderer;
    gl.canvas.style.width = "100%";
    gl.canvas.style.height = "100%";
    container.replaceChildren(gl.canvas);

    const uniforms = {
      iTime: { value: 0 },
      iResolution: { value: [1, 1] },
      rayPos: { value: [0, 0] },
      rayDir: { value: [0, 1] },
      raysColor: { value: hexToRgb(raysColor) },
      raysSpeed: { value: raysSpeed },
      lightSpread: { value: lightSpread },
      rayLength: { value: rayLength },
      pulsating: { value: pulsating ? 1 : 0 },
      fadeDistance: { value: fadeDistance },
      saturation: { value: saturation },
      mousePos: { value: [0.5, 0.5] },
      mouseInfluence: { value: mouseInfluence },
      noiseAmount: { value: noiseAmount },
      distortion: { value: distortion },
    };
    const program = new Program(gl, { vertex: vertexShader, fragment: fragmentShader, uniforms });
    const mesh = new Mesh(gl, { geometry: new Triangle(gl), program });

    const resize = () => {
      const width = container.clientWidth;
      const height = container.clientHeight;
      renderer.setSize(width, height);
      const dpr = renderer.dpr;
      uniforms.iResolution.value = [width * dpr, height * dpr];
      const placement = getAnchorAndDirection(raysOrigin, width * dpr, height * dpr);
      uniforms.rayPos.value = placement.anchor;
      uniforms.rayDir.value = placement.direction;
    };

    const trackPointer = (event) => {
      const bounds = container.getBoundingClientRect();
      mouseRef.current = {
        x: (event.clientX - bounds.left) / bounds.width,
        y: (event.clientY - bounds.top) / bounds.height,
      };
    };

    let animationFrame;
    const render = (time) => {
      uniforms.iTime.value = time * 0.001;
      if (followMouse && mouseInfluence > 0) {
        const smoothing = 0.93;
        smoothMouseRef.current.x = smoothMouseRef.current.x * smoothing + mouseRef.current.x * (1 - smoothing);
        smoothMouseRef.current.y = smoothMouseRef.current.y * smoothing + mouseRef.current.y * (1 - smoothing);
        uniforms.mousePos.value = [smoothMouseRef.current.x, smoothMouseRef.current.y];
      }
      if (!document.hidden) renderer.render({ scene: mesh });
      animationFrame = window.requestAnimationFrame(render);
    };

    window.addEventListener("resize", resize);
    if (followMouse) window.addEventListener("pointermove", trackPointer, { passive: true });
    resize();
    animationFrame = window.requestAnimationFrame(render);

    return () => {
      window.cancelAnimationFrame(animationFrame);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", trackPointer);
      const loseContext = gl.getExtension("WEBGL_lose_context");
      loseContext?.loseContext();
      gl.canvas.remove();
    };
  }, [
    distortion,
    fadeDistance,
    followMouse,
    lightSpread,
    mouseInfluence,
    noiseAmount,
    pulsating,
    rayLength,
    raysColor,
    raysOrigin,
    raysSpeed,
    saturation,
  ]);

  return <div ref={containerRef} className={`light-rays-container ${className}`.trim()} />;
}
