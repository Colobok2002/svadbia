import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, MotionConfig, motion, useReducedMotion } from "motion/react";
import ReactCardFlipModule from "react-card-flip";
import { defaultGuest, guests, rsvpFormUrl } from "./data/guests";
import LineWaves from "./components/LineWaves/LineWaves";

import girl from "./assets/figma/raw-01.png";
import sleepingBaby from "./assets/figma/raw-02.png";
import weddingPolaroidA from "./assets/figma/raw-03.png";
import childhoodWeddingA from "./assets/figma/raw-08.png";
import heartLineA from "./assets/figma/raw-09.png";
import friendsA from "./assets/figma/raw-10.png";
import childhoodWeddingB from "./assets/figma/raw-11.png";
import friendsB from "./assets/figma/raw-14.png";
import heart from "./assets/figma/raw-15.png";
import heartLineB from "./assets/figma/raw-16.png";
import childPink from "./assets/figma/raw-17.png";

const ReactCardFlip = ReactCardFlipModule.default ?? ReactCardFlipModule;

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

const calendarLabels = {
  "label.addtocalendar": "Добавить в календарь",
  ical: "Файл календаря",
  close: "Закрыть",
  continue: "Продолжить",
  cancel: "Отмена",
  "modal.opensafari.ical.h": "Откройте Safari",
  "modal.opensafari.ical.text": "На iPhone файл календаря надёжнее открывается через Safari.",
  "modal.webview.ical.h": "Откройте в браузере",
  "modal.webview.ical.text": "Встроенный браузер приложения может не открыть файл календаря.",
};

const weddingCalendarEvents = [
  {
    id: "registry",
    day: "25",
    weekday: "пятница",
    time: "13:40",
    eyebrow: "День первый",
    title: "Церемония в ЗАГСе",
    shortAddress: "Московский проспект, 38к5",
    calendar: {
      name: "Свадьба Ильи и Дарины — церемония в ЗАГСе",
      description: "Церемония бракосочетания Ильи и Дарины.",
      startDate: "2026-09-25",
      startTime: "13:40",
      endDate: "2026-09-25",
      endTime: "15:00",
      timeZone: "Europe/Moscow",
      location: registryVenue.address,
      status: "CONFIRMED",
      options: ["Apple", "Google", "iCal"],
      optionsMobile: ["Google", "iCal"],
      optionsIOS: ["Apple", "Google", "iCal"],
      iCalFileName: "ilya-darina-registry",
      listStyle: "modal",
      forceOverlay: true,
      lightMode: "light",
      customLabels: calendarLabels,
    },
  },
  {
    id: "celebration",
    day: "26",
    weekday: "суббота",
    time: "17:00",
    eyebrow: "День второй",
    title: "Праздник в доме",
    shortAddress: "Чандровская улица, 79А",
    calendar: {
      name: "Свадьба Ильи и Дарины — праздник в доме",
      description: "Праздник в доме. Будут баня и джакузи — возьмите тапочки и полотенце.",
      startDate: "2026-09-26",
      startTime: "17:00",
      endDate: "2026-09-26",
      endTime: "23:59",
      timeZone: "Europe/Moscow",
      location: celebrationVenue.address,
      status: "CONFIRMED",
      options: ["Apple", "Google", "iCal"],
      optionsMobile: ["Google", "iCal"],
      optionsIOS: ["Apple", "Google", "iCal"],
      iCalFileName: "ilya-darina-celebration",
      listStyle: "modal",
      forceOverlay: true,
      lightMode: "light",
      customLabels: calendarLabels,
    },
  },
];

const slides = [
  { id: "welcome", label: "Начало", chapter: "Пролог", theme: "light" },
  { id: "grow", label: "История", chapter: "01", theme: "light" },
  { id: "together", label: "Мы", chapter: "02", theme: "light" },
  { id: "invite", label: "Приглашение", chapter: "03", theme: "rose" },
  { id: "registry", label: "Роспись", chapter: "04", theme: "rose" },
  { id: "celebration", label: "Праздник", chapter: "05", theme: "rose" },
  { id: "date", label: "Дата", chapter: "06", theme: "dark" },
  { id: "details", label: "Детали", chapter: "07", theme: "dark" },
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

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.035, delayChildren: 0.02 } },
};

const reveal = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.74, ease: [0.16, 1, 0.3, 1] } },
};

const revealWithoutFade = {
  hidden: { y: 24 },
  show: { y: 0, transition: { duration: 0.78, ease: [0.16, 1, 0.3, 1] } },
};

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

function Photo({ src, alt, className = "", rotate = 0, delay = 0 }) {
  return (
    <motion.figure
      className={`editorial-photo ${className}`}
      variants={reveal}
      whileHover={{ scale: 1.025, rotate: rotate * 0.35, y: -5 }}
      transition={{ type: "spring", stiffness: 180, damping: 18 }}
    >
      <motion.img
        src={src}
        alt={alt}
        animate={{ y: [0, -7, 0], rotate: [rotate, rotate + 0.7, rotate] }}
        transition={{ duration: 7.5, delay, repeat: Infinity, ease: "easeInOut" }}
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
          История, в которой самая важная глава начинается вместе с вами.
        </motion.p>
        <motion.button className="primary-action" onClick={() => goTo(1)} variants={reveal} whileTap={{ scale: 0.96 }}>
          Открыть приглашение <span>↗</span>
        </motion.button>
      </div>
      <motion.div className="hero-portrait" variants={reveal}>
        <div className="hero-portrait__frame">
          <img src={childhoodWeddingA} alt="Илья в костюме жениха и Дарина в образе невесты" />
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
        <span className="dream-scene dream-scene--question">
          <img className="dream-scene__boy" src={sleepingBaby} alt="Илья в детстве" />
          <span className="dream-thought">
            Интересно,<br />кто будет<br /><em>моей женой?</em>
          </span>
          <span className="dream-scene__hint">Нажми на карточку ↗</span>
        </span>
      </button>

      <button
        key="back"
        type="button"
        className="dream-reveal-card dream-reveal-card--back"
        onClick={toggleReveal}
        aria-label="Вернуть фотографию Ильи"
      >
        <span className="dream-scene dream-scene--answer">
          <img className="dream-scene__girl" src={girl} alt="Дарина в детстве" />
          <span className="dream-answer">
            <small>Спойлер из будущего</small>
            <strong>Вот она.</strong>
          </span>
          <span className="dream-scene__hint">Нажми ещё раз ↙</span>
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
        <h2>Сначала каждый<br />мечтал <em>о своём</em></h2>
        <p>Мы ещё не знали друг друга, но жизнь уже тихо складывала нашу историю.</p>
      </motion.div>
      <div className="story-collage story-collage--dream">
        <motion.div className="dream-reveal" variants={revealWithoutFade}>
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
        <Photo src={childPink} alt="Дарина в детстве" className="photo-child-pink" rotate={-7} />
        <Photo src={childhoodWeddingA} alt="Детская свадьба" className="photo-little-wedding" rotate={6} delay={0.8} />
        <motion.img className="collage-line" src={heartLineB} alt="" variants={reveal} />
      </div>
      <motion.div className="chapter-copy" variants={reveal}>
        <p className="eyebrow">Глава вторая · тот самый поворот</p>
        <h2>А потом<br />мы нашли <em>друг друга</em></h2>
        <p>И оказалось, что самые важные мечты сбываются совсем не так, как их представляешь.</p>
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
        <p className="invite-statement">мы скоро станем семьёй и хотим, чтобы вы были рядом в этот день.</p>
      </motion.div>
      <div className="invite-collage">
        <Photo src={friendsA} alt="Илья и Дарина" className="photo-couple-cutout" rotate={-2} />
        <Photo src={weddingPolaroidA} alt="Детская свадебная фотография" className="photo-polaroid" rotate={6} delay={1.4} />
      </div>
    </motion.div>
  );
}

function Registry() {
  return (
    <motion.div className="panel-layout event-layout" variants={stagger} initial="hidden" animate="show">
      <motion.div className="event-number" variants={reveal}>13:40</motion.div>
      <motion.article className="event-card" variants={revealWithoutFade}>
        <p className="eyebrow">Сначала — главное</p>
        <h2>Церемония</h2>
        <p>{registryVenue.name}</p>
        <address>{registryVenue.address}</address>
        <RouteLink venue={registryVenue} />
        <div className="event-meta"><span>Пятница</span><span>25 сентября</span></div>
      </motion.article>
      <Photo src={childhoodWeddingB} alt="Детская свадебная фотография" className="photo-registry" rotate={7} />
    </motion.div>
  );
}

function Celebration() {
  return (
    <motion.div className="panel-layout celebration-layout" variants={stagger} initial="hidden" animate="show">
      <motion.div className="celebration-copy" variants={revealWithoutFade}>
        <p className="eyebrow">А после — самое живое</p>
        <h2>Праздник<br /><em>на природе</em></h2>
        <p>Дом, тёплый вечер и люди, которых мы действительно хотим видеть рядом.</p>
        <div className="celebration-venue">
          <div className="celebration-venue__address">
            <span>17:00</span>
            <address>{celebrationVenue.address}</address>
          </div>
          <RouteLink venue={celebrationVenue} />
          <p className="parking-note">
            <i aria-hidden="true">P</i>
            <span><strong>Парковка</strong> На внедорожнике можно припарковаться возле дома, на легковой машине — возле памятника.</span>
          </p>
          <p className="parking-note parking-note--extra">
            <i aria-hidden="true">♨</i>
            <span><strong>Баня и джакузи</strong> Будут доступны во время праздника.</span>
          </p>
          <p className="parking-note parking-note--extra">
            <i aria-hidden="true">✓</i>
            <span><strong>Возьмите с собой</strong> Тапочки и полотенце.</span>
          </p>
        </div>
      </motion.div>
      <Photo src={friendsB} alt="Илья и Дарина" className="photo-celebration" rotate={-3} />
      <motion.img className="celebration-heart" src={heart} alt="" variants={reveal} />
    </motion.div>
  );
}

function CalendarEventCard({ event }) {
  const buttonRef = useRef(null);

  const addToCalendar = async () => {
    const { atcb_action } = await import("add-to-calendar-button");
    await atcb_action(event.calendar, buttonRef.current);
  };

  return (
    <motion.button
      ref={buttonRef}
      type="button"
      className={`date-event-card date-event-card--${event.id}`}
      variants={revealWithoutFade}
      whileTap={{ scale: 0.975 }}
      onClick={addToCalendar}
      aria-label={`Добавить в календарь: ${event.title}, ${event.day} сентября в ${event.time}`}
    >
      <span className="date-event-card__sheet">
        <span className="date-event-card__month"><span>Сентябрь</span><small>2026</small></span>
        <strong>{event.day}</strong>
        <span className="date-event-card__weekday">{event.weekday}</span>
      </span>
      <span className="date-event-card__info">
        <small>{event.eyebrow}</small>
        <strong>{event.title}</strong>
        <time dateTime={`2026-09-${event.day}T${event.time}`}>{event.time}</time>
        <span className="date-event-card__address">{event.shortAddress}</span>
        <span className="date-event-card__action">Добавить в календарь <i aria-hidden="true">＋</i></span>
      </span>
    </motion.button>
  );
}

function DateSlide() {
  return (
    <motion.div className="panel-layout date-layout" variants={stagger} initial="hidden" animate="show">
      <motion.div className="date-heading" variants={reveal}>
        <p className="eyebrow">Два дня · одна история</p>
        <h2>Сохраните<br /><em>две даты</em></h2>
        <p>Нажмите на нужный день — событие откроется в календаре вашего телефона.</p>
      </motion.div>
      <div className="date-events">
        {weddingCalendarEvents.map((event) => <CalendarEventCard event={event} key={event.id} />)}
      </div>
    </motion.div>
  );
}

function Details() {
  return (
    <motion.div className="panel-layout details-layout" variants={stagger} initial="hidden" animate="show">
      <motion.div className="details-heading" variants={reveal}>
        <p className="eyebrow">Почему именно так</p>
        <h2>Без лишнего.<br /><em>По-настоящему.</em></h2>
      </motion.div>
      <motion.div className="details-card" variants={revealWithoutFade}>
        <span>01</span>
        <p>Для нас важен этот день, поэтому мы проведём его не в ресторане, а на природе.</p>
      </motion.div>
      <motion.div className="details-card details-card--second" variants={revealWithoutFade}>
        <span>02</span>
        <p>Хотим прожить с вами искренний активный вечер, который вместе напишем словно сериал.</p>
      </motion.div>
      <Photo src={childPink} alt="Дарина в детстве" className="photo-details" rotate={8} />
    </motion.div>
  );
}

function Rsvp({ guest, accepted, onRespond }) {
  return (
    <motion.div className="panel-layout rsvp-layout" variants={stagger} initial="hidden" animate="show">
      <motion.p className="eyebrow" variants={reveal}>Последний, но важный вопрос</motion.p>
      <motion.h2 variants={reveal}>{accepted ? "До встречи!" : "Вы будете с нами?"}</motion.h2>
      <motion.p className="rsvp-lead" variants={reveal}>
        {accepted
          ? `${guest.name}, ваш ответ сохранён. Очень ждём вас 25 и 26 сентября.`
          : `${guest.salutation}, дайте нам знать, сможете ли вы разделить этот день с нами.`}
      </motion.p>
      {!accepted && (
        <motion.button className="primary-action primary-action--light" onClick={onRespond} variants={reveal} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.96 }}>
          Да, я буду <span>♥</span>
        </motion.button>
      )}
      <motion.img className="rsvp-line" src={heartLineA} alt="" variants={reveal} />
      <motion.div className="rsvp-signature" variants={reveal}>Илья &amp; Дарина</motion.div>
    </motion.div>
  );
}

function SlideContent({ id, guest, accepted, onRespond, goTo }) {
  if (id === "welcome") return <Intro goTo={goTo} />;
  if (id === "grow") return <Grow />;
  if (id === "together") return <Together />;
  if (id === "invite") return <Invite guest={guest} />;
  if (id === "registry") return <Registry />;
  if (id === "celebration") return <Celebration />;
  if (id === "date") return <DateSlide />;
  if (id === "details") return <Details />;
  return <Rsvp guest={guest} accepted={accepted} onRespond={onRespond} />;
}

export default function App() {
  const guest = useMemo(getGuest, []);
  const reducedMotion = useReducedMotion();
  const initialIndex = useMemo(getInitialIndex, []);
  const [activeIndex, setActiveIndex] = useState(initialIndex);
  const [direction, setDirection] = useState(1);
  const [accepted, setAccepted] = useState(false);
  const activeIndexRef = useRef(initialIndex);
  const lockedRef = useRef(false);
  const touchStartRef = useRef(null);
  const activeSlide = slides[activeIndex];

  const goTo = (next) => {
    const requested = typeof next === "number" ? next : slides.findIndex(({ id }) => id === next);
    const target = Math.max(0, Math.min(slides.length - 1, requested));
    if (requested < 0 || target === activeIndexRef.current || lockedRef.current) return;
    setDirection(target > activeIndexRef.current ? 1 : -1);
    activeIndexRef.current = target;
    setActiveIndex(target);
    lockedRef.current = true;
    window.setTimeout(() => { lockedRef.current = false; }, reducedMotion ? 80 : 980);
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
  }, [reducedMotion]);

  const respond = () => {
    setAccepted(true);
    if (!rsvpFormUrl) return;
    const url = rsvpFormUrl
      .replace("{id}", encodeURIComponent(guest.id || "unknown"))
      .replace("{guest}", encodeURIComponent(guest.name));
    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <MotionConfig reducedMotion="user">
    <main className={`story story--${activeSlide.theme}`}>
      <div className="line-waves-backdrop" aria-hidden="true">
        <LineWaves
          speed={reducedMotion ? 0 : 0.18}
          innerLineCount={12}
          outerLineCount={17}
          warpIntensity={0.58}
          rotation={-22}
          colorCycleSpeed={0.22}
          brightness={0.56}
          color1="#702c3e"
          color2="#79816e"
          color3="#d19c93"
          enableMouseInteraction={!reducedMotion}
          mouseInfluence={0.28}
        />
      </div>

      <header className="site-header">
        <button className="monogram" onClick={() => goTo(0)} aria-label="К началу">И<span>×</span>Д</button>
        <div className="site-header__date">25–26 · 09 · 26</div>
      </header>

      <AnimatePresence initial={false} mode="wait" custom={direction}>
        <motion.section
          className={`story-panel story-panel--${activeSlide.id}`}
          id={activeSlide.id}
          data-slide
          key={activeSlide.id}
          custom={direction}
          variants={panelVariants}
          initial="enter"
          animate="center"
          exit="exit"
        >
          <SlideContent
            id={activeSlide.id}
            guest={guest}
            accepted={accepted}
            onRespond={respond}
            goTo={goTo}
          />
        </motion.section>
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
    </main>
    </MotionConfig>
  );
}
