import { useEffect, useRef } from "react";
import { Color, Mesh, Program, Renderer, Triangle } from "ogl";
import "./Iridescence.css";

// Adapted from the open-source React Bits Iridescence background.
const vertexShader = `
attribute vec2 uv;
attribute vec2 position;

varying vec2 vUv;

void main() {
  vUv = uv;
  gl_Position = vec4(position, 0, 1);
}
`;

const fragmentShader = `
precision highp float;

uniform float uTime;
uniform vec3 uColor;
uniform vec3 uResolution;
uniform vec2 uMouse;
uniform float uAmplitude;
uniform float uSpeed;

varying vec2 vUv;

void main() {
  float mr = min(uResolution.x, uResolution.y);
  vec2 uv = (vUv.xy * 2.0 - 1.0) * uResolution.xy / mr;

  uv += (uMouse - vec2(0.5)) * uAmplitude;

  float d = -uTime * 0.5 * uSpeed;
  float a = 0.0;
  for (float i = 0.0; i < 8.0; ++i) {
    a += cos(i - d - a * uv.x);
    d += sin(uv.y * i + a);
  }
  d += uTime * 0.5 * uSpeed;
  vec3 col = vec3(cos(uv * vec2(d, a)) * 0.6 + 0.4, cos(a + d) * 0.5 + 0.5);
  col = cos(col * cos(vec3(d, a, 2.5)) * 0.5 + 0.5) * uColor;
  gl_FragColor = vec4(col, 1.0);
}
`;

export default function Iridescence({
  color = [1, 1, 1],
  speed = 1,
  amplitude = 0.1,
  pointerReact = false,
  dpr = 1.5,
  maxFps = 60,
  paused = false,
  className = "",
}) {
  const containerRef = useRef(null);
  const pausedRef = useRef(paused);

  useEffect(() => {
    pausedRef.current = paused;
  }, [paused]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return undefined;

    const renderer = new Renderer({ dpr: Math.min(window.devicePixelRatio, dpr) });
    const { gl } = renderer;
    gl.clearColor(1, 1, 1, 1);
    container.replaceChildren(gl.canvas);

    const geometry = new Triangle(gl);
    const program = new Program(gl, {
      vertex: vertexShader,
      fragment: fragmentShader,
      uniforms: {
        uTime: { value: 0 },
        uColor: { value: new Color(...color) },
        uResolution: { value: new Color(1, 1, 1) },
        uMouse: { value: new Float32Array([0.5, 0.5]) },
        uAmplitude: { value: amplitude },
        uSpeed: { value: speed },
      },
    });
    const mesh = new Mesh(gl, { geometry, program });

    const resize = () => {
      const width = container.clientWidth;
      const height = container.clientHeight;
      renderer.setSize(width, height);
      program.uniforms.uResolution.value = new Color(
        gl.canvas.width,
        gl.canvas.height,
        gl.canvas.width / gl.canvas.height,
      );
    };

    const movePointer = (event) => {
      const bounds = container.getBoundingClientRect();
      program.uniforms.uMouse.value[0] = (event.clientX - bounds.left) / bounds.width;
      program.uniforms.uMouse.value[1] = 1 - (event.clientY - bounds.top) / bounds.height;
    };

    let frame;
    let previousFrameTime = 0;
    const frameInterval = 1000 / maxFps;
    const render = (time) => {
      if (!pausedRef.current && !document.hidden && time - previousFrameTime >= frameInterval) {
        previousFrameTime = time - ((time - previousFrameTime) % frameInterval);
        program.uniforms.uTime.value = time * 0.001;
        renderer.render({ scene: mesh });
      }
      frame = window.requestAnimationFrame(render);
    };

    window.addEventListener("resize", resize);
    if (pointerReact) window.addEventListener("pointermove", movePointer, { passive: true });
    resize();
    frame = window.requestAnimationFrame(render);

    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", movePointer);
      gl.getExtension("WEBGL_lose_context")?.loseContext();
      gl.canvas.remove();
    };
  }, [amplitude, color, dpr, maxFps, pointerReact, speed]);

  return <div ref={containerRef} className={`iridescence-container ${className}`.trim()} />;
}
