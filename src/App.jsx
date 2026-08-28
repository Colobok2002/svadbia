import { AnimatePresence, MotionConfig, motion, useReducedMotion } from "motion/react";
import { useEffect, useMemo, useRef, useState } from "react";
import ReactCardFlipModule from "react-card-flip";
import { createPortal } from "react-dom";
import PearlFilmBackdrop from "./components/PearlFilmBackdrop/PearlFilmBackdrop";
import { defaultGuest, guests } from "./data/guests";

import girl from "./assets/figma/raw-01.png";
import sleepingBaby from "./assets/figma/raw-02.png";
import childhoodWeddingA from "./assets/figma/raw-08.png";
import heartLineA from "./assets/figma/raw-09.png";
import heart from "./assets/figma/raw-15.png";
import celebrationBbq from "./assets/figma/celebration-bbq.jpg";
import celebrationConcert from "./assets/figma/celebration-concert.jpg";
import celebrationDj from "./assets/figma/celebration-dj.jpg";
import celebrationHouse from "./assets/figma/celebration-house.jpg";
import celebrationJacuzzi from "./assets/figma/celebration-jacuzzi.png";
import celebrationKaraoke from "./assets/figma/celebration-karaoke.jpg";
import celebrationSauna from "./assets/figma/celebration-sauna.jpg";
import celebrationToast from "./assets/figma/celebration-toast.jpg";
import heroWeddingPhoto from "./assets/figma/slide-1.png";
import inviteRings from "./assets/figma/invite-rings.png";
import inviteCar from "./assets/figma/kar.png";
import registryKids from "./assets/figma/registry-kids.png";
import storyArcherPhoto from "./assets/figma/story-archer.png";
import storyKeysPhoto from "./assets/figma/story-keys.png";

const ReactCardFlip = ReactCardFlipModule.default ?? ReactCardFlipModule;

const preloadSources = [
  girl,
  sleepingBaby,
  heroWeddingPhoto,
  inviteRings,
  registryKids,
  storyArcherPhoto,
  storyKeysPhoto,
  childhoodWeddingA,
  heartLineA,
  inviteCar,
  celebrationHouse,
  celebrationJacuzzi,
  celebrationSauna,
  celebrationBbq,
  celebrationConcert,
  celebrationToast,
  celebrationDj,
  celebrationKaraoke,
  heart,
];

const registryVenue = {
  name: "Дворец бракосочетания",
  address: "Московский проспект, 38к5, Чебоксары, Чувашская Республика — Чувашия",
  coordinates: "56.146289,47.216639",
};

const celebrationVenue = {
  name: "Дом в Чандрово",
  address: "Чандровская улица, 79А, деревня Чандрово, городской округ Чебоксары, Чувашская Республика — Чувашия",
  coordinates: "56.123282,47.090756",
};

const celebrationPhotos = [
  { src: celebrationHouse, label: "Дом", alt: "Загородный дом, где пройдёт праздник" },
  { src: celebrationJacuzzi, label: "Джакузи", alt: "Джакузи для гостей праздника" },
  { src: celebrationSauna, label: "Баня", alt: "Тёплая деревянная баня" },
  { src: celebrationBbq, label: "Шашлык", alt: "Шашлык на мангале для праздничного вечера" },
  { src: celebrationConcert, label: "Музыка", alt: "Яркий концерт и гости праздника" },
  { src: celebrationToast, label: "За нас", alt: "Гости поднимают бокалы за молодожёнов" },
  { src: celebrationDj, label: "Танцы", alt: "Собака-диджей за проигрывателем" },
  { src: celebrationKaraoke, label: "Караоке", alt: "Микрофоны для праздничного караоке" },
];

const telegramInviteUrl = "https://t.me/+13sjd8qlNRpjNTUy";

const wideHeartPath = {
  x: [24, 120, 300, 480, 576, 480, 300, 120, 24],
  y: [270, 94, 26, 94, 270, 438, 498, 438, 270],
};
const tallHeartPath = {
  x: [300, 414, 468, 414, 300, 186, 132, 186, 300],
  y: [12, 94, 260, 426, 508, 426, 260, 94, 12],
};
const middleHeartPath = {
  x: [72, 180, 300, 420, 528, 420, 300, 180, 72],
  y: [250, 140, 104, 140, 250, 364, 410, 364, 250],
};
const storyHeartParticles = [
  { path: wideHeartPath, duration: 10, phase: 0, size: "is-large" },
  { path: wideHeartPath, duration: 10, phase: 3, size: "" },
  { path: wideHeartPath, duration: 10, phase: 6, size: "is-small" },
  { path: tallHeartPath, duration: 8.5, phase: 1, size: "" },
  { path: tallHeartPath, duration: 8.5, phase: 5, size: "is-large" },
  { path: middleHeartPath, duration: 7.5, phase: 2, size: "is-small" },
  { path: middleHeartPath, duration: 7.5, phase: 6, size: "" },
];

function phaseHeartPath(values, phase) {
  const loop = values.slice(0, -1);
  const start = phase % loop.length;
  const phased = [...loop.slice(start), ...loop.slice(0, start)];
  return [...phased, phased[0]];
}

const weddingCalendarEvents = [
  {
    id: "registry",
    day: "25",
    weekday: "пятница",
    time: "13:40",
    eyebrow: "День первый",
    title: "Церемония в ЗАГСе",
    shortAddress: "Московский проспект, 38к5",
    icsFile: "registry.ics",
    calendar: {
      name: "Свадьба Ильи и Дарины — церемония в ЗАГСе",
      description: "Церемония бракосочетания Ильи и Дарины.",
      startDate: "2026-09-25",
      startTime: "13:40",
      endDate: "2026-09-25",
      endTime: "15:00",
      timeZone: "Europe/Moscow",
      location: registryVenue.address,
    },
  },
  {
    id: "celebration",
    day: "26",
    weekday: "суббота",
    time: "17:00",
    eyebrow: "День второй",
    title: "Праздник в загородном доме",
    shortAddress: "Чандровская улица, 79А",
    icsFile: "celebration.ics",
    calendar: {
      name: "Свадьба Ильи и Дарины — праздник в загородном доме",
      description: "Праздник в загородном доме. Будут баня и джакузи — не забудьте тапочки и полотенце.",
      startDate: "2026-09-26",
      startTime: "17:00",
      endDate: "2026-09-26",
      endTime: "23:59",
      timeZone: "Europe/Moscow",
      location: celebrationVenue.address,
    },
  },
];

function getGoogleCalendarUrl(event) {
  const { calendar } = event;
  const compact = (date, time) => `${date.replaceAll("-", "")}T${time.replace(":", "")}00`;
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: calendar.name,
    dates: `${compact(calendar.startDate, calendar.startTime)}/${compact(calendar.endDate, calendar.endTime)}`,
    ctz: calendar.timeZone,
    details: calendar.description,
    location: calendar.location,
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

const slides = [
  { id: "welcome", label: "Начало", chapter: "Пролог", theme: "light" },
  { id: "grow", label: "История", chapter: "01", theme: "light" },
  { id: "together", label: "Мы", chapter: "02", theme: "light" },
  { id: "invite", label: "Приглашение", chapter: "03", theme: "rose" },
  { id: "registry", label: "Роспись", chapter: "04", theme: "rose" },
  { id: "celebration", label: "Праздник", chapter: "05", theme: "rose" },
  { id: "date", label: "Дата", chapter: "06", theme: "dark" },
  { id: "rsvp", label: "Ответ", chapter: "Финал", theme: "dark" },
];

const panelVariants = {
  enter: (direction) => ({
    x: direction > 0 ? 32 : -32,
    scale: 0.99,
  }),
  center: {
    opacity: 1,
    x: 0,
    scale: 1,
    transition: { duration: 0.76, ease: [0.16, 1, 0.3, 1] },
  },
  exit: () => ({
    opacity: 0,
    x: 0,
    scale: 0.995,
    transition: { duration: 0.2, ease: [0.4, 0, 1, 1] },
  }),
};

const mobilePanelVariants = {
  enter: (direction) => ({
    opacity: 0,
    y: direction > 0 ? 14 : -14,
  }),
  center: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.48, ease: [0.16, 1, 0.3, 1] },
  },
  exit: (direction) => ({
    opacity: 0,
    y: direction > 0 ? -8 : 8,
    transition: { duration: 0.16, ease: [0.4, 0, 1, 1] },
  }),
};

const keepPanelComposited = (_, generatedTransform) => (
  generatedTransform === "none"
    ? "translateZ(0)"
    : `${generatedTransform} translateZ(0)`
);

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.035, delayChildren: 0.02 } },
};

const reveal = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.74, ease: [0.16, 1, 0.3, 1] } },
};

const inviteCarReveal = {
  hidden: { opacity: 0, x: 150, y: 22, rotate: 3 },
  show: {
    opacity: 1,
    x: 0,
    y: 0,
    rotate: 0,
    transition: { duration: 1.05, ease: [0.16, 1, 0.3, 1] },
  },
};

const inviteRingsReveal = {
  hidden: { opacity: 0, scale: 0.68, rotate: -24 },
  show: {
    opacity: 1,
    scale: 1,
    rotate: 0,
    transition: { duration: 0.9, delay: 0.16, ease: [0.16, 1, 0.3, 1] },
  },
};

const revealWithoutFade = {
  hidden: { y: 24 },
  show: { y: 0, transition: { duration: 0.78, ease: [0.16, 1, 0.3, 1] } },
};

const celebrationSequence = {
  hidden: { y: 24 },
  show: {
    y: 0,
    transition: {
      duration: 0.78,
      ease: [0.16, 1, 0.3, 1],
      staggerChildren: 0.09,
      delayChildren: 0.08,
    },
  },
};

const celebrationItem = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.56, ease: [0.16, 1, 0.3, 1] } },
};

const cardSequence = {
  hidden: { y: 24 },
  show: {
    y: 0,
    transition: {
      duration: 0.78,
      ease: [0.16, 1, 0.3, 1],
      staggerChildren: 0.085,
      delayChildren: 0.08,
    },
  },
};

const cardContentSequence = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07, delayChildren: 0.04 } },
};

const cardItem = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { duration: 0.52, ease: [0.16, 1, 0.3, 1] } },
};

const chooserDialog = {
  hidden: { opacity: 0, y: 34, scale: 0.97 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.5,
      ease: [0.16, 1, 0.3, 1],
      staggerChildren: 0.075,
      delayChildren: 0.1,
    },
  },
  exit: { opacity: 0, y: 20, scale: 0.985, transition: { duration: 0.26, ease: [0.4, 0, 1, 1] } },
};

const chooserItem = {
  hidden: { opacity: 0, y: 13 },
  show: { opacity: 1, y: 0, transition: { duration: 0.48, ease: [0.16, 1, 0.3, 1] } },
  exit: { opacity: 0, y: 6, transition: { duration: 0.16 } },
};

function preloadImage(src, onDone) {
  return new Promise((resolve) => {
    const image = new Image();
    let settled = false;
    let timeoutId;

    const finish = async () => {
      if (settled) return;
      settled = true;
      window.clearTimeout(timeoutId);
      try {
        await image.decode?.();
      } catch {
        // onload is enough when decode is unavailable or rejects.
      }
      onDone();
      resolve();
    };

    image.onload = finish;
    image.onerror = finish;
    image.src = src;
    timeoutId = window.setTimeout(finish, 10000);
    if (image.complete) void finish();
  });
}

function useSitePreloader() {
  const [progress, setProgress] = useState(0);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const total = preloadSources.length + 1;
    let completed = 0;

    const markDone = () => {
      completed += 1;
      if (!cancelled) setProgress(Math.round((completed / total) * 100));
    };

    const imageTasks = preloadSources.map((src) => preloadImage(src, markDone));
    const requestedFonts = document.fonts
      ? Promise.all([
          document.fonts.load('500 68px "Cormorant Garamond Variable"', "Один момент Илья Дарина"),
          document.fonts.load('italic 500 68px "Cormorant Garamond Variable"', "Один момент"),
          document.fonts.load('600 10px "Manrope Variable"', "Собираем нашу историю 100%"),
        ]).then(() => document.fonts.ready)
      : Promise.resolve();
    const fontTask = requestedFonts
      .catch(() => {})
      .then(async () => {
        markDone();
        // Keep the completed state visible briefly before the exit animation.
        await new Promise((resolve) => window.setTimeout(resolve, 480));
      });
    const minimumDisplay = new Promise((resolve) => window.setTimeout(resolve, 900));

    Promise.all([Promise.all([...imageTasks, fontTask]), minimumDisplay]).then(() => {
      if (cancelled) return;
      setProgress(100);
      setIsReady(true);
    });

    return () => {
      cancelled = true;
    };
  }, []);

  return { isReady, progress };
}

function LoadingScreen({ progress }) {
  return (
    <motion.div
      className="loading-screen"
      role="status"
      aria-live="polite"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.025 }}
      transition={{ duration: 0.62, ease: [0.4, 0, 0.2, 1] }}
    >
      <div className="loading-screen__ornament" aria-hidden="true">
        <motion.i animate={{ rotate: 360 }} transition={{ duration: 9, repeat: Infinity, ease: "linear" }} />
        <motion.span
          animate={{ scale: [1, 1.08, 1] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
        >
          И <b>×</b> Д
        </motion.span>
      </div>
      <div className="loading-screen__copy">
        <p>Собираем нашу историю</p>
        <strong>Один момент</strong>
      </div>
      <div
        className="loading-screen__progress"
        role="progressbar"
        aria-label="Загрузка приглашения"
        aria-valuemin="0"
        aria-valuemax="100"
        aria-valuenow={progress}
      >
        <span><motion.i initial={{ scaleX: 0 }} animate={{ scaleX: progress / 100 }} transition={{ duration: 0.35, ease: "easeOut" }} /></span>
        <output>{String(progress).padStart(2, "0")}%</output>
      </div>
    </motion.div>
  );
}

function getGuest() {
  const hash = window.location.hash.slice(1);
  const hashParams = new URLSearchParams(hash);
  const rawHashId = hashParams.get("id") || hash;
  const hashId = slides.some(({ id }) => id === rawHashId)
    ? ""
    : decodeURIComponent(rawHashId).trim().toLowerCase();
  const queryId = new URLSearchParams(window.location.search).get("guest")?.trim().toLowerCase();
  const id = hashId || queryId || "";
  return { ...defaultGuest, ...(guests[id] || {}), id };
}

function getInitialIndex() {
  const hash = window.location.hash.slice(1);
  const index = slides.findIndex(({ id }) => id === hash);
  return index < 0 ? 0 : index;
}

function Photo({ src, alt, className = "", rotate = 0, delay = 0, motionPreset = "float" }) {
  const reducedMotion = useReducedMotion();
  const canFloat = !reducedMotion && window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  const variants = motionPreset === "car"
    ? inviteCarReveal
    : motionPreset === "rings" ? inviteRingsReveal : reveal;

  const idleAnimation = reducedMotion
    ? { x: 0, y: 0, rotate, scale: 1 }
    : motionPreset === "car"
      ? { x: [0, 4, 0], y: [0, -3, 0], rotate: [rotate, rotate + 0.35, rotate], scale: 1 }
      : motionPreset === "rings"
        ? { x: 0, y: [0, -7, 0], rotate: [rotate, rotate + 4, rotate], scale: [1, 1.045, 1] }
        : canFloat
          ? { x: 0, y: [0, -7, 0], rotate: [rotate, rotate + 0.7, rotate], scale: 1 }
          : { x: 0, y: 0, rotate, scale: 1 };

  const idleTransition = reducedMotion
    ? { duration: 0 }
    : motionPreset === "car"
      ? { duration: 3.6, delay: 1.05, repeat: Infinity, ease: "easeInOut" }
      : motionPreset === "rings"
        ? { duration: 4.2, delay: 0.9, repeat: Infinity, ease: "easeInOut" }
        : canFloat
          ? { duration: 7.5, delay, repeat: Infinity, ease: "easeInOut" }
          : { duration: 0 };

  return (
    <motion.figure
      className={`editorial-photo ${className}`}
      variants={variants}
      whileHover={{ scale: 1.025, rotate: rotate * 0.35, y: -5 }}
      transition={{ type: "spring", stiffness: 180, damping: 18 }}
    >
      <motion.img
        src={src}
        alt={alt}
        animate={idleAnimation}
        transition={idleTransition}
      />
    </motion.figure>
  );
}

function RouteLink({ venue }) {
  const webRoute = `https://yandex.ru/maps/?rtext=~${venue.coordinates}&rtt=auto`;
  const appRoute = `yandexmaps://maps.yandex.ru/?rtext=~${venue.coordinates}&rtt=auto`;

  const openRoute = (event) => {
    const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
    if (!isMobile) return;

    event.preventDefault();
    let fallbackTimer;

    const stopFallback = () => {
      if (document.hidden) window.clearTimeout(fallbackTimer);
    };

    document.addEventListener("visibilitychange", stopFallback, { once: true });
    fallbackTimer = window.setTimeout(() => {
      document.removeEventListener("visibilitychange", stopFallback);
      window.location.assign(webRoute);
    }, 2200);

    window.location.assign(appRoute);
  };

  return (
    <a
      className="route-link"
      href={webRoute}
      target="_blank"
      rel="noreferrer"
      onClick={openRoute}
      aria-label={`Построить маршрут до ${venue.name} в Яндекс Картах`}
    >
      <span>
        <small>Яндекс Карты</small>
        Построить маршрут
      </span>
      <i aria-hidden="true">↗</i>
    </a>
  );
}

function Intro({ goTo }) {
  return (
    <motion.div className="panel-layout hero-layout" variants={stagger} initial="hidden" animate="show">
      <div className="hero-copy">
        <motion.p className="eyebrow" variants={reveal}>Свадебное приглашение · 25–26.09.2026</motion.p>
        <motion.h1 className="hero-title" variants={reveal}>
          Илья <span>&amp;</span><br />Дарина
        </motion.h1>
        <motion.p className="hero-lead" variants={reveal}>
          Наша самая важная глава начинается — и мы хотим разделить её с вами.
        </motion.p>
        <motion.button className="primary-action" onClick={() => goTo(1)} variants={reveal} whileTap={{ scale: 0.96 }}>
          Узнать, что за суета <span>↗</span>
        </motion.button>
      </div>
      <motion.div className="hero-portrait" variants={reveal}>
        <div className="hero-portrait__frame">
          <img src={heroWeddingPhoto} alt="Илья в костюме жениха и Дарина в образе невесты" />
        </div>
        <motion.div className="orbit-copy" animate={{ rotate: 360 }} transition={{ duration: 28, repeat: Infinity, ease: "linear" }}>
          <span>НАША ИСТОРИЯ • НАШ ДЕНЬ • НАШИ ЛЮДИ • </span>
        </motion.div>
        <img className="hero-heart" src={heart} alt="" />
      </motion.div>
    </motion.div>
  );
}

function DreamReveal() {
  const [isRevealed, setIsRevealed] = useState(false);
  const toggleReveal = () => setIsRevealed((current) => !current);

  return (
    <ReactCardFlip
      isFlipped={isRevealed}
      flipDirection="horizontal"
      flipSpeedFrontToBack={0.92}
      flipSpeedBackToFront={0.82}
      containerClassName="dream-flip"
    >
      <button
        key="front"
        type="button"
        className="dream-reveal-card dream-reveal-card--front"
        onClick={toggleReveal}
        aria-label="Узнать, о ком мечтал Илья"
      >
        <motion.span
          className="dream-scene dream-scene--question"
          initial={false}
          animate={{ opacity: isRevealed ? 0 : 1 }}
          transition={{
            duration: isRevealed ? 0.1 : 0.24,
            delay: isRevealed ? 0 : 0.28,
          }}
        >
          <motion.img className="dream-scene__boy" src={sleepingBaby} alt="Илья в детстве" variants={cardItem} />
          <motion.span className="dream-thought" variants={cardItem}>
            Интересно,<br />кто будет<br /><em>моей женой?</em>
          </motion.span>
          <motion.span className="dream-scene__hint" variants={cardItem}>Спойлер</motion.span>
        </motion.span>
      </button>

      <button
        key="back"
        type="button"
        className="dream-reveal-card dream-reveal-card--back"
        onClick={toggleReveal}
        aria-label="Вернуть фотографию Ильи"
      >
        <span className="dream-scene dream-scene--answer">
          <motion.img
            className="dream-scene__girl"
            src={girl}
            alt="Дарина в детстве"
            initial={false}
            animate={isRevealed ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: 14, scale: 0.98 }}
            transition={{ duration: 0.58, delay: isRevealed ? 0.24 : 0, ease: [0.16, 1, 0.3, 1] }}
          />
          <motion.span
            className="dream-answer"
            initial={false}
            animate={isRevealed ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
            transition={{ duration: 0.48, delay: isRevealed ? 0.36 : 0, ease: [0.16, 1, 0.3, 1] }}
          >
            <small>Спойлер из будущего</small>
            <strong>И однажды ему приснилась эта хмурая девочка</strong>
          </motion.span>
          <motion.span
            className="dream-scene__hint"
            initial={false}
            animate={isRevealed ? { opacity: 1, y: 0 } : { opacity: 0, y: 6 }}
            transition={{ duration: 0.4, delay: isRevealed ? 0.48 : 0, ease: [0.16, 1, 0.3, 1] }}
          >
            Нажми ещё раз ↙
          </motion.span>
        </span>
      </button>
    </ReactCardFlip>
  );
}

function Grow() {
  return (
    <motion.div className="panel-layout story-layout" variants={stagger} initial="hidden" animate="show">
      <motion.div className="chapter-copy" variants={reveal}>
        <p className="eyebrow">Глава первая · когда мы были маленькими</p>
        <h2>Сначала он часто мечтал <em>во сне</em></h2>
      </motion.div>
      <div className="story-collage story-collage--dream">
        <motion.div className="dream-reveal" variants={cardSequence}>
          <DreamReveal />
        </motion.div>
      </div>
    </motion.div>
  );
}

function Together() {
  return (
    <motion.div className="panel-layout story-layout story-layout--reverse" variants={stagger} initial="hidden" animate="show">
      <div className="story-collage story-collage--together">
        <motion.svg className="story-heart-field" viewBox="0 0 600 520" variants={reveal} aria-hidden="true">
          {storyHeartParticles.map(({ path, duration, phase, size }) => {
            const x = phaseHeartPath(path.x, phase);
            const y = phaseHeartPath(path.y, phase);
            return (
            <motion.text
              className={`story-orbit-heart ${size}`.trim()}
              textAnchor="middle"
              dominantBaseline="middle"
              initial={{ x: x[0], y: y[0] }}
              animate={{ x, y, rotate: [0, 12, 0, -12, 0, 12, 0, -12, 0] }}
              transition={{ duration, repeat: Infinity, ease: "linear" }}
              key={`${duration}-${phase}`}
            >
              ♥
            </motion.text>
            );
          })}
        </motion.svg>
        <Photo src={storyArcherPhoto} alt="Дарина с луком" className="story-photo-card photo-story-archer" />
        <Photo src={storyKeysPhoto} alt="Илья с ключами" className="story-photo-card photo-story-keys" delay={0.8} />
      </div>
      <motion.div className="chapter-copy" variants={reveal}>
        <p className="eyebrow">Глава вторая · тот самый поворот</p>
        <h2>А потом он вырос — и девочка появилась <em>не во сне, а наяву</em></h2>
        <p>Она попала ему прямо в сердце, и он стал подбирать к нему ключик, пока остальные претенденты безнадёжно проигрывали.</p>
      </motion.div>
    </motion.div>
  );
}

function Invite({ guest }) {
  return (
    <motion.div className="panel-layout invite-layout" variants={stagger} initial="hidden" animate="show">
      <motion.div className="invite-copy" variants={reveal}>
        <p className="eyebrow">Теперь официально</p>
        <h2>{guest.salutation},</h2>
        <p className="invite-statement">мы скоро станем семьёй — и очень хотим, чтобы в эти дни вы были рядом.</p>
      </motion.div>
      <div className="invite-collage">
        <Photo src={inviteCar} alt="Свадебная машина семьи Суетологов" className="photo-invite-car" rotate={-1} motionPreset="car" />
        <Photo src={inviteRings} alt="Обручальные кольца" className="photo-invite-rings" rotate={5} motionPreset="rings" />
      </div>
    </motion.div>
  );
}

function Registry() {
  return (
    <motion.div className="panel-layout event-layout" variants={stagger} initial="hidden" animate="show">
      <motion.div className="event-number" variants={reveal}>13:40</motion.div>
      <motion.article className="event-card" variants={cardSequence}>
        <motion.p className="eyebrow" variants={cardItem}>Сначала — самое главное</motion.p>
        <motion.h2 variants={cardItem}>Церемония</motion.h2>
        <motion.p variants={cardItem}>{registryVenue.name}</motion.p>
        <motion.address variants={cardItem}>{registryVenue.address}</motion.address>
        <motion.div className="event-card__route" variants={cardItem}>
          <RouteLink venue={registryVenue} />
        </motion.div>
        <motion.div className="event-meta" variants={cardItem}><span>Пятница</span><span>25 сентября</span></motion.div>
      </motion.article>
      <Photo src={registryKids} alt="Мальчик и девочка в свадебных нарядах" className="photo-registry" rotate={7} />
    </motion.div>
  );
}

function Celebration() {
  const reducedMotion = useReducedMotion();
  const [photoIndex, setPhotoIndex] = useState(0);
  const [isPhotoDragging, setIsPhotoDragging] = useState(false);

  useEffect(() => {
    if (reducedMotion || isPhotoDragging) return undefined;
    const timer = window.setTimeout(() => {
      setPhotoIndex((current) => (current + 1) % celebrationPhotos.length);
    }, 2800);
    return () => window.clearTimeout(timer);
  }, [isPhotoDragging, photoIndex, reducedMotion]);

  const selectPhoto = (index) => {
    setPhotoIndex((index + celebrationPhotos.length) % celebrationPhotos.length);
  };
  const finishPhotoDrag = (_, info) => {
    setIsPhotoDragging(false);
    const gesture = Math.abs(info.offset.x) > 5 ? info.offset.x : info.velocity.x;
    const isSwipe = Math.abs(info.offset.x) > 22 || Math.abs(info.velocity.x) > 180;
    if (isSwipe) selectPhoto(photoIndex + (gesture < 0 ? 1 : -1));
  };
  const activePhoto = celebrationPhotos[photoIndex];

  return (
    <motion.div className="panel-layout celebration-layout" variants={stagger} initial="hidden" animate="show">
      <motion.div className="celebration-copy" variants={celebrationSequence}>
        <motion.div className="celebration-intro" variants={celebrationItem}>
          <p className="eyebrow">А после — самое весёлое</p>
          <h2>Праздник<br /><em>в домике</em></h2>
          <p>Уютный дом, тёплый вечер и только те, кого мы действительно хотим видеть рядом.</p>
        </motion.div>
        <div className="celebration-venue">
          <motion.div className="celebration-venue__address" variants={celebrationItem}>
            <span>17:00</span>
            <address>{celebrationVenue.address}</address>
          </motion.div>
          <motion.div className="celebration-venue__route" variants={celebrationItem}>
            <RouteLink venue={celebrationVenue} />
          </motion.div>
          <motion.p className="parking-note" variants={celebrationItem}>
            <i aria-hidden="true">P</i>
            <span><strong>Парковка</strong> Внедорожник можно оставить возле дома, легковую машину — возле памятника.</span>
          </motion.p>
          <motion.p className="parking-note parking-note--extra" variants={celebrationItem}>
            <i aria-hidden="true">♨</i>
            <span><strong>Баня и джакузи</strong> Будут доступны в течение всего вечера.</span>
          </motion.p>
          <motion.p className="parking-note parking-note--extra" variants={celebrationItem}>
            <i aria-hidden="true">✓</i>
            <span><strong>Возьмите с собой</strong> Не забудьте тапочки и полотенце.</span>
          </motion.p>
          <motion.div className="celebration-meta" variants={celebrationItem}>
            <span>Суббота</span><span>26 сентября</span>
          </motion.div>
        </div>
      </motion.div>
      <motion.div className="celebration-gallery" variants={reveal}>
        <div className="celebration-gallery__frame">
          <AnimatePresence initial={false} mode="popLayout">
            <motion.figure
              key={activePhoto.src}
              initial={reducedMotion ? false : { opacity: 0, scale: 1.035 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={reducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0.985 }}
              transition={{ duration: reducedMotion ? 0.01 : 0.7, ease: [0.16, 1, 0.3, 1] }}
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.35}
              dragMomentum={false}
              dragSnapToOrigin
              onDragStart={() => setIsPhotoDragging(true)}
              onDragEnd={finishPhotoDrag}
            >
              <img src={activePhoto.src} alt={activePhoto.alt} />
              <figcaption>
                <span>{String(photoIndex + 1).padStart(2, "0")}</span>
                <strong>{activePhoto.label}</strong>
              </figcaption>
            </motion.figure>
          </AnimatePresence>
        </div>
        <div className="celebration-gallery__controls" aria-label="Фотографии места праздника">
          <button type="button" onClick={() => selectPhoto(photoIndex - 1)} aria-label="Предыдущая фотография">←</button>
          <div>
            {celebrationPhotos.map((photo, index) => (
              <button
                type="button"
                className={index === photoIndex ? "is-active" : ""}
                onClick={() => selectPhoto(index)}
                aria-label={`Показать: ${photo.label}`}
                aria-current={index === photoIndex ? "true" : undefined}
                key={photo.src}
              />
            ))}
          </div>
          <button type="button" onClick={() => selectPhoto(photoIndex + 1)} aria-label="Следующая фотография">→</button>
        </div>
      </motion.div>
    </motion.div>
  );
}

function CalendarEventCard({ event, onChoose }) {
  return (
    <motion.button
      type="button"
      className={`date-event-card date-event-card--${event.id}`}
      variants={cardSequence}
      whileTap={{ scale: 0.975 }}
      onClick={() => onChoose(event)}
      aria-label={`Добавить в календарь: ${event.title}, ${event.day} сентября в ${event.time}`}
    >
      <motion.span className="date-event-card__sheet" variants={cardItem}>
        <span className="date-event-card__month"><span>Сентябрь</span><small>2026</small></span>
        <strong>{event.day}</strong>
        <span className="date-event-card__weekday">{event.weekday}</span>
      </motion.span>
      <motion.span className="date-event-card__info" variants={cardContentSequence}>
        <motion.small variants={cardItem}>{event.eyebrow}</motion.small>
        <motion.strong variants={cardItem}>{event.title}</motion.strong>
        <motion.time variants={cardItem} dateTime={`2026-09-${event.day}T${event.time}`}>{event.time}</motion.time>
        <motion.span className="date-event-card__address" variants={cardItem}>{event.shortAddress}</motion.span>
        <motion.span className="date-event-card__action" variants={cardItem}>Добавить в календарь <i aria-hidden="true">＋</i></motion.span>
      </motion.span>
    </motion.button>
  );
}

function CalendarChooser({ event, onClose }) {
  const icsUrl = `${import.meta.env.BASE_URL}calendar/${event.icsFile}`;
  const googleUrl = getGoogleCalendarUrl(event);

  useEffect(() => {
    const closeOnEscape = (keyboardEvent) => {
      if (keyboardEvent.key === "Escape") onClose();
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [onClose]);

  return createPortal(
    <motion.div
      className="calendar-chooser"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.24 }}
      onClick={onClose}
    >
      <motion.div
        className="calendar-chooser__dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="calendar-chooser-title"
        variants={chooserDialog}
        initial="hidden"
        animate="show"
        exit="exit"
        onClick={(clickEvent) => clickEvent.stopPropagation()}
      >
        <motion.button className="calendar-chooser__close" type="button" onClick={onClose} aria-label="Закрыть" variants={chooserItem}>×</motion.button>
        <motion.p variants={chooserItem}>{event.day} сентября · {event.time}</motion.p>
        <motion.h3 id="calendar-chooser-title" variants={chooserItem}>Куда добавить событие?</motion.h3>
        <div className="calendar-chooser__options">
          <motion.a href={icsUrl} target="_blank" rel="noreferrer" onClick={onClose} variants={chooserItem} whileTap={{ scale: 0.975 }}>
            <i aria-hidden="true">A</i>
            <span><strong>Apple Calendar</strong><small>Открыть на iPhone или Mac</small></span>
            <b aria-hidden="true">↗</b>
          </motion.a>
          <motion.a href={googleUrl} target="_blank" rel="noreferrer" onClick={onClose} variants={chooserItem} whileTap={{ scale: 0.975 }}>
            <i aria-hidden="true">G</i>
            <span><strong>Google Calendar</strong><small>Добавить через аккаунт Google</small></span>
            <b aria-hidden="true">↗</b>
          </motion.a>
          <motion.a href={icsUrl} download={event.icsFile} onClick={onClose} variants={chooserItem} whileTap={{ scale: 0.975 }}>
            <i aria-hidden="true">↓</i>
            <span><strong>Файл .ics</strong><small>Для другого приложения календаря</small></span>
            <b aria-hidden="true">↗</b>
          </motion.a>
        </div>
        <motion.small className="calendar-chooser__hint" variants={chooserItem}>Если приглашение открыто внутри Telegram, для Apple Calendar лучше открыть страницу в Safari.</motion.small>
      </motion.div>
    </motion.div>,
    document.body,
  );
}

function DateSlide() {
  const [selectedEvent, setSelectedEvent] = useState(null);

  return (
    <motion.div className="panel-layout date-layout" variants={stagger} initial="hidden" animate="show">
      <motion.div className="date-heading" variants={reveal}>
        <p className="eyebrow">Два дня · одна история</p>
        <h2>Сохраните<br /><em>две даты</em></h2>
        <p>Выберите нужный день — мы подскажем, как добавить событие в календарь.</p>
      </motion.div>
      <div className="date-events">
        {weddingCalendarEvents.map((event) => (
          <CalendarEventCard event={event} onChoose={setSelectedEvent} key={event.id} />
        ))}
      </div>
      <AnimatePresence>
        {selectedEvent && <CalendarChooser event={selectedEvent} onClose={() => setSelectedEvent(null)} />}
      </AnimatePresence>
    </motion.div>
  );
}

function Rsvp({ guest }) {
  return (
    <motion.div className="panel-layout rsvp-layout" variants={stagger} initial="hidden" animate="show">
      <motion.p className="eyebrow" variants={reveal}>Последний, но важный вопрос</motion.p>
      <motion.h2 variants={reveal}>Будете с нами?</motion.h2>
      <motion.p className="rsvp-lead" variants={reveal}>
        {guest.salutation}, присоединяйтесь к нашей группе — там будут новости, напоминания и все детали праздника.
      </motion.p>
      <motion.a
        className="primary-action primary-action--light"
        href={telegramInviteUrl}
        target="_blank"
        rel="noreferrer"
        variants={reveal}
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.96 }}
      >
        Я за суету <span>↗</span>
      </motion.a>
      <motion.img className="rsvp-line" src={heartLineA} alt="" variants={reveal} />
      <motion.div className="rsvp-signature" variants={reveal}>Илья &amp; Дарина</motion.div>
    </motion.div>
  );
}

function SlideContent({ id, guest, goTo }) {
  if (id === "welcome") return <Intro goTo={goTo} />;
  if (id === "grow") return <Grow />;
  if (id === "together") return <Together />;
  if (id === "invite") return <Invite guest={guest} />;
  if (id === "registry") return <Registry />;
  if (id === "celebration") return <Celebration />;
  if (id === "date") return <DateSlide />;
  return <Rsvp guest={guest} />;
}

export default function App() {
  const { isReady, progress } = useSitePreloader();
  const guest = useMemo(getGuest, []);
  const reducedMotion = useReducedMotion();
  const [mobile, setMobile] = useState(() => window.matchMedia("(max-width: 820px)").matches);
  const initialIndex = useMemo(getInitialIndex, []);
  const [activeIndex, setActiveIndex] = useState(initialIndex);
  const [direction, setDirection] = useState(1);
  const activeIndexRef = useRef(initialIndex);
  const lockedRef = useRef(false);
  const touchStartRef = useRef(null);
  const transitionTimerRef = useRef();
  const activeSlide = slides[activeIndex];

  useEffect(() => {
    const media = window.matchMedia("(max-width: 820px)");
    const updateMobile = () => setMobile(media.matches);
    media.addEventListener?.("change", updateMobile);
    return () => media.removeEventListener?.("change", updateMobile);
  }, []);

  const goTo = (next) => {
    if (!isReady) return;
    const requested = typeof next === "number" ? next : slides.findIndex(({ id }) => id === next);
    const target = Math.max(0, Math.min(slides.length - 1, requested));
    if (requested < 0 || target === activeIndexRef.current || lockedRef.current) return;
    setDirection(target > activeIndexRef.current ? 1 : -1);
    activeIndexRef.current = target;
    setActiveIndex(target);
    lockedRef.current = true;
    window.clearTimeout(transitionTimerRef.current);
    transitionTimerRef.current = window.setTimeout(() => {
      lockedRef.current = false;
    }, reducedMotion ? 80 : mobile ? 720 : 980);
  };

  useEffect(() => {
    const onWheel = (event) => {
      event.preventDefault();
      if (Math.abs(event.deltaY) < 18) return;
      goTo(activeIndexRef.current + (event.deltaY > 0 ? 1 : -1));
    };
    const onKeyDown = (event) => {
      const delta = ["ArrowDown", "ArrowRight", "PageDown"].includes(event.key)
        ? 1
        : ["ArrowUp", "ArrowLeft", "PageUp"].includes(event.key) ? -1 : 0;
      if (delta) {
        event.preventDefault();
        goTo(activeIndexRef.current + delta);
      }
    };
    const onTouchStart = (event) => { touchStartRef.current = event.touches[0]?.clientY ?? null; };
    const onTouchEnd = (event) => {
      if (touchStartRef.current == null) return;
      const distance = touchStartRef.current - (event.changedTouches[0]?.clientY ?? touchStartRef.current);
      touchStartRef.current = null;
      if (Math.abs(distance) > 45) goTo(activeIndexRef.current + (distance > 0 ? 1 : -1));
    };
    window.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchend", onTouchEnd, { passive: true });
    return () => {
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchend", onTouchEnd);
    };
  }, [isReady, mobile, reducedMotion]);

  useEffect(() => () => window.clearTimeout(transitionTimerRef.current), []);

  return (
    <MotionConfig reducedMotion="user">
    <main className={`story story--${activeSlide.theme}`} aria-busy={!isReady}>
      <div className="pearl-film-backdrop-layer" aria-hidden="true">
        <PearlFilmBackdrop
          reducedMotion={reducedMotion}
          mobile={mobile}
        />
      </div>

      <header className="site-header">
        <button className="monogram" onClick={() => goTo(0)} aria-label="К началу">И<span>×</span>Д</button>
        <div className="site-header__date">25–26 · 09 · 26</div>
      </header>

      <AnimatePresence initial={false} mode="wait" custom={direction}>
        {isReady && <motion.section
          className={`story-panel story-panel--${activeSlide.id}`}
          id={activeSlide.id}
          data-slide
          key={activeSlide.id}
          custom={direction}
          variants={mobile ? mobilePanelVariants : panelVariants}
          transformTemplate={keepPanelComposited}
          initial="enter"
          animate="center"
          exit="exit"
        >
          <SlideContent
            id={activeSlide.id}
            guest={guest}
            goTo={goTo}
          />
        </motion.section>}
      </AnimatePresence>

      <nav className="chapter-nav" aria-label="Разделы приглашения">
        {slides.map((slide, index) => (
          <button
            className={index === activeIndex ? "is-active" : ""}
            onClick={() => goTo(index)}
            aria-current={index === activeIndex ? "page" : undefined}
            aria-label={slide.label}
            data-target={slide.id}
            key={slide.id}
          >
            <i /><span>{slide.label}</span>
          </button>
        ))}
      </nav>

      <footer className="site-footer">
        <div className="chapter-counter"><span>{activeSlide.chapter}</span><i />{String(activeIndex + 1).padStart(2, "0")}</div>
        <div className="footer-controls">
          <button onClick={() => goTo(activeIndex - 1)} disabled={activeIndex === 0} aria-label="Предыдущий экран">←</button>
          <button onClick={() => goTo(activeIndex + 1)} disabled={activeIndex === slides.length - 1} aria-label="Следующий экран">→</button>
        </div>
      </footer>

      <AnimatePresence>
        {!isReady && <LoadingScreen progress={progress} />}
      </AnimatePresence>
    </main>
    </MotionConfig>
  );
}
