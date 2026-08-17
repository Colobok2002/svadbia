import { useEffect, useRef } from "react";
import cloudTiny from "../assets/figma/accent-01.svg";
import cloudThought from "../assets/figma/accent-02.svg";
import cloudLarge from "../assets/figma/accent-04.svg";
import cloudSmall from "../assets/figma/accent-05.svg";
import girl from "../assets/figma/raw-01.png";
import sleepingBaby from "../assets/figma/raw-02.png";
import clickHand from "../assets/figma/raw-18.png";
import "./DreamSlide.scss";

function fadeOutElement(element, duration = 360) {
  if (!element) return () => {};
  const from = Number.parseFloat(getComputedStyle(element).opacity) || 0;
  const startedAt = performance.now();
  let frameId;
  const animate = (now) => {
    const progress = Math.min(1, (now - startedAt) / duration);
    const eased = 1 - ((1 - progress) ** 3);
    element.style.opacity = String(from * (1 - eased));
    element.style.filter = `blur(${eased * 8}px)`;
    if (progress < 1) frameId = requestAnimationFrame(animate);
    else element.style.opacity = "0";
  };
  frameId = requestAnimationFrame(animate);
  return () => cancelAnimationFrame(frameId);
}

export default function DreamSlide({ isActive = false }) {
  const boyRef = useRef(null);
  const cloudRefs = useRef([]);
  const girlCloudRefs = useRef([]);
  const girlGroupRef = useRef(null);
  const clickButtonRef = useRef(null);
  const clickHandRef = useRef(null);
  const clickReadyRef = useRef(false);
  const girlShownRef = useRef(false);
  const revealVersionRef = useRef(0);
  const hasEnteredRef = useRef(false);
  const exitTimersRef = useRef([]);
  const exitAnimationsRef = useRef([]);

  useEffect(() => {
    const revealVersion = revealVersionRef.current + 1;
    revealVersionRef.current = revealVersion;
    let frameId;
    let cancelled = false;
    const timers = [];
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const boy = boyRef.current;
    const clouds = cloudRefs.current.filter(Boolean);
    const girlClouds = girlCloudRefs.current.filter(Boolean);
    const girlGroup = girlGroupRef.current;
    const clickButton = clickButtonRef.current;
    const clickHandElement = clickHandRef.current;

    const setHidden = (element) => {
      if (!element) return;
      element.style.opacity = "0";
      element.style.filter = "blur(8px)";
    };
    const setVisible = (element) => {
      if (!element) return;
      element.style.opacity = "1";
      element.style.filter = "none";
    };
    const fadeIn = (element, duration = 560) => {
      if (!element || cancelled) return;
      const startedAt = performance.now();
      const animateFade = (now) => {
        if (cancelled) return;
        const progress = Math.min(1, (now - startedAt) / duration);
        const eased = 1 - ((1 - progress) ** 3);
        element.style.opacity = String(eased);
        element.style.filter = `blur(${(1 - eased) * 8}px)`;
        if (progress < 1) requestAnimationFrame(animateFade);
        else element.style.filter = "none";
      };
      requestAnimationFrame(animateFade);
    };

    if (!isActive) {
      if (!hasEnteredRef.current) {
        [boy, ...clouds, girlGroup, ...girlClouds, clickButton].forEach(setHidden);
      }
      if (clickButton) clickButton.style.pointerEvents = "none";
      return () => { cancelled = true; };
    }

    hasEnteredRef.current = true;
    exitTimersRef.current.forEach((timer) => window.clearTimeout(timer));
    exitAnimationsRef.current.forEach((cancel) => cancel());
    exitTimersRef.current = [];
    exitAnimationsRef.current = [];
    [boy, ...clouds, girlGroup, ...girlClouds, clickButton].forEach(setHidden);
    clickReadyRef.current = false;
    girlShownRef.current = false;
    if (clickButton) clickButton.style.pointerEvents = "none";

    if (reducedMotion) {
      [boy, ...clouds].forEach(setVisible);
      setVisible(clickButton);
      if (clickButton) clickButton.style.pointerEvents = "auto";
      clickReadyRef.current = true;
      return () => { cancelled = true; };
    }

    const schedule = (callback, delay) => {
      const timer = window.setTimeout(callback, delay);
      timers.push(timer);
    };
    schedule(() => fadeIn(boy, 700), 80);
    schedule(() => fadeIn(clouds[0], 520), 600);
    schedule(() => fadeIn(clouds[1], 520), 900);
    schedule(() => fadeIn(clouds[2], 620), 1220);
    schedule(() => {
      clickReadyRef.current = true;
      if (clickButton) {
        clickButton.style.pointerEvents = "auto";
        fadeIn(clickButton, 420);
      }
    }, 1780);

    const startedAt = performance.now();
    const animate = (now) => {
      if (cancelled) return;
      const seconds = (now - startedAt) / 500;
      const motions = [
        ["rotate(157.95deg)", Math.sin(seconds * 1.35) * 3, Math.sin(seconds * 1.1) * 1.2],
        ["rotate(192.95deg)", Math.sin(seconds * 1.05 + 0.7) * 5, Math.sin(seconds * 0.9 + 0.5) * 2.6],
        ["", Math.sin(seconds * 0.75 + 1.1) * 10, Math.sin(seconds * 0.7 + 0.4) * 1.2],
      ];
      clouds.forEach((element, index) => {
        const [base, y, rotation] = motions[index];
        element.style.transform = `${base} translateY(${y}px) rotate(${rotation}deg)`;
      });
      girlClouds.forEach((element, index) => {
        const y = Math.sin(seconds * (index ? 0.72 : 1.05) + index) * (index ? 9 : 6);
        const rotation = Math.sin(seconds * 0.8 + index) * 1.2;
        const base = index ? "" : "rotate(-60.95deg)";
        element.style.transform = `${base} translateY(${y}px) rotate(${rotation}deg)`;
      });
      if (clickReadyRef.current && clickHandElement) {
        const pulse = 1 + Math.sin(seconds * 2.6) * 0.08;
        clickHandElement.style.transform = `rotate(-75deg) scale(${pulse})`;
      }
      frameId = requestAnimationFrame(animate);
    };
    frameId = requestAnimationFrame(animate);
    return () => {
      cancelled = true;
      revealVersionRef.current += 1;
      cancelAnimationFrame(frameId);
      timers.forEach((timer) => window.clearTimeout(timer));
      if (!isActive) return;
      if (clickButton) clickButton.style.pointerEvents = "none";
      clickReadyRef.current = false;
      girlShownRef.current = false;
      const exitElements = [
        ...girlClouds.slice().reverse(),
        girlGroup,
        clickButton,
        clouds[2],
        clouds[1],
        clouds[0],
        boy,
      ].filter(Boolean);
      exitElements.forEach((element, index) => {
        const timer = window.setTimeout(() => {
          const cancel = fadeOutElement(element, 320);
          exitAnimationsRef.current.push(cancel);
        }, index * 110);
        exitTimersRef.current.push(timer);
      });
    };
  }, [isActive]);

  const revealGirl = () => {
    if (!clickReadyRef.current || girlShownRef.current) return;
    girlShownRef.current = true;
    const revealVersion = revealVersionRef.current;
    const girlGroup = girlGroupRef.current;
    const girlClouds = girlCloudRefs.current.filter(Boolean);
    if (clickButtonRef.current) clickButtonRef.current.style.pointerEvents = "none";
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      [girlGroup, ...girlClouds].forEach((element) => {
        if (!element) return;
        element.style.opacity = "1";
        element.style.filter = "none";
      });
      return;
    }
    const fade = (element, duration = 600) => {
      if (!element) return;
      const startedAt = performance.now();
      const animateFade = (now) => {
        if (revealVersionRef.current !== revealVersion) return;
        const progress = Math.min(1, (now - startedAt) / duration);
        const eased = 1 - ((1 - progress) ** 3);
        element.style.opacity = String(eased);
        element.style.filter = `blur(${(1 - eased) * 8}px)`;
        if (progress < 1) requestAnimationFrame(animateFade);
        else element.style.filter = "none";
      };
      requestAnimationFrame(animateFade);
    };
    fade(girlGroup, 720);
    girlClouds.forEach((cloud, index) => window.setTimeout(() => {
      if (revealVersionRef.current === revealVersion) fade(cloud, 500);
    }, 520 + index * 260));
  };

  return (
    <section className="slide dream-slide" id="grow" data-slide>
      <div className="dream-slide__scene">
        <div className="dream-slide__boy-group">
          <img
            ref={boyRef}
            className="dream-slide__baby"
            src={sleepingBaby}
            alt="Ребёнок мечтает во сне"
          />
          <div className="dream-slide__clouds">
            <img
              className="dream-slide__cloud dream-slide__cloud--small"
              src={cloudTiny}
              alt=""
              ref={(element) => { cloudRefs.current[0] = element; }}
            />
            <img
              className="dream-slide__cloud dream-slide__cloud--medium"
              src={cloudSmall}
              alt=""
              ref={(element) => { cloudRefs.current[1] = element; }}
            />
            <div
              className="dream-slide__cloud dream-slide__cloud--large"
              ref={(element) => { cloudRefs.current[2] = element; }}
              onPointerDown={revealGirl}
              onClick={revealGirl}
            >
              <img src={cloudLarge} alt="" />
              <p className="dream-slide__cloud-text script">
                Интересно,
                <br />
                кто будет моей бусинкой,
                <br />
                когда я вырасту?
              </p>
              <button
                ref={clickButtonRef}
                className="dream-slide__cloud-button"
                type="button"
                onPointerDown={revealGirl}
              >
                <img ref={clickHandRef} className="dream-slide__cloud-hand" src={clickHand} alt="" aria-hidden="true" />
              </button>
            </div>
          </div>
        </div>
        <div className="dream-slide__girl-group" ref={girlGroupRef}>
          <div
            className="dream-slide__girl-thoughts"
            aria-label="Мысли девочки"
          >
            <img
              className="dream-slide__girl-thought dream-slide__girl-thought--small"
              src={cloudSmall}
              alt=""
              ref={(element) => { girlCloudRefs.current[0] = element; }}
            />
            <div
              className="dream-slide__girl-thought dream-slide__girl-thought--large"
              ref={(element) => { girlCloudRefs.current[1] = element; }}
            >
              <img src={cloudThought} alt="" />
              <p className="script">Есть ещё вопросы кто?</p>
            </div>
          </div>
          <img
            className="dream-slide__girl"
            src={girl}
            alt="Девочка в детстве"
          />
        </div>
      </div>
      <a className="figma-button" href="#invite">
        Подрости
      </a>
    </section>
  );
}
