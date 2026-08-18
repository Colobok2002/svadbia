import { useEffect, useRef } from "react";

const MAX_RENDER_PIXELS = 180000;
const FRAME_INTERVAL = 1000 / 24;

function fract(value) {
  return value - Math.floor(value);
}

export default function SilkBackground() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = canvas?.parentElement;
    if (!canvas || !container) return undefined;

    const context = canvas.getContext("2d", {
      alpha: false,
      desynchronized: true,
    });
    if (!context) return undefined;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let frameId;
    let imageData;
    let lastPaintAt = -Infinity;

    const resizeCanvas = () => {
      const { width, height } = container.getBoundingClientRect();
      const cssWidth = Math.max(1, Math.round(width));
      const cssHeight = Math.max(1, Math.round(height));
      const renderScale = Math.min(
        1,
        Math.sqrt(MAX_RENDER_PIXELS / Math.max(cssWidth * cssHeight, 1)),
      );

      canvas.width = Math.max(1, Math.round(cssWidth * renderScale));
      canvas.height = Math.max(1, Math.round(cssHeight * renderScale));
      canvas.style.width = `${cssWidth}px`;
      canvas.style.height = `${cssHeight}px`;
      imageData = context.createImageData(canvas.width, canvas.height);
    };

    const renderSilk = (seconds) => {
      if (!imageData) return;
      const { width, height } = canvas;
      const pixels = imageData.data;
      const aspect = width / height;
      let offset = 0;

      for (let y = 0; y < height; y += 1) {
        const v = y / height;
        for (let x = 0; x < width; x += 1) {
          const u = x / width;
          const diagonal = (u - 0.5) * aspect + (v - 0.5) * 0.68;
          const drift = seconds * 0.075;
          const warp = diagonal
            + Math.sin(v * 7.2 - drift) * 0.055
            + Math.sin(u * 10.5 + v * 2.4 + drift * 0.7) * 0.026;

          const broadFold = Math.sin(warp * 15.2 - drift * 1.2);
          const softFold = Math.sin(warp * 7.1 + Math.sin(v * 5.5 + drift) * 0.8);
          const fineFold = Math.sin(warp * 31 + v * 4.2 - drift * 1.8);
          const highlight = Math.max(0, broadFold);
          const sheen = highlight ** 8;
          const grain = fract(Math.sin(x * 12.9898 + y * 78.233) * 43758.5453) - 0.5;
          const light = 0.53
            + broadFold * 0.13
            + softFold * 0.105
            + fineFold * 0.025
            + sheen * 0.22
            + grain * 0.018;
          const edgeShade = 1 - Math.min(0.12, Math.abs(u - 0.5) * 0.12);

          pixels[offset] = Math.max(0, Math.min(255, 204 * light * edgeShade + 35));
          pixels[offset + 1] = Math.max(0, Math.min(255, 196 * light * edgeShade + 35));
          pixels[offset + 2] = Math.max(0, Math.min(255, 151 * light * edgeShade + 35));
          pixels[offset + 3] = 255;
          offset += 4;
        }
      }

      context.putImageData(imageData, 0, 0);
    };

    const animate = (now) => {
      if (now - lastPaintAt >= FRAME_INTERVAL) {
        renderSilk(now / 1000);
        lastPaintAt = now;
      }
      frameId = requestAnimationFrame(animate);
    };

    const startAnimation = () => {
      cancelAnimationFrame(frameId);
      if (reducedMotion.matches) {
        renderSilk(0);
        return;
      }
      frameId = requestAnimationFrame(animate);
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        cancelAnimationFrame(frameId);
      } else {
        startAnimation();
      }
    };

    const handleResize = () => {
      resizeCanvas();
      renderSilk(performance.now() / 1000);
    };

    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(container);
    resizeCanvas();
    renderSilk(0);
    startAnimation();
    reducedMotion.addEventListener("change", startAnimation);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      cancelAnimationFrame(frameId);
      resizeObserver.disconnect();
      reducedMotion.removeEventListener("change", startAnimation);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  return (
    <div className="silk-background" aria-hidden="true">
      <canvas ref={canvasRef} />
    </div>
  );
}
