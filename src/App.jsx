import { useEffect, useMemo, useRef, useState } from "react";
import { defaultGuest, guests, rsvpFormUrl } from "./data/guests";
import WelcomeSlide from "./components/WelcomeSlide";
import DreamSlide from "./components/DreamSlide";
import SilkBackground from "./components/SilkBackground";

import childPinkA from "./assets/figma/raw-01.png";
import weddingPolaroidA from "./assets/figma/raw-03.png";
import calendarInviteA from "./assets/figma/raw-05.png";
import weddingPolaroidB from "./assets/figma/raw-07.png";
import childhoodWeddingA from "./assets/figma/raw-08.png";
import heartLineA from "./assets/figma/raw-09.png";
import friendsA from "./assets/figma/raw-10.png";
import childhoodWeddingB from "./assets/figma/raw-11.png";
import calendarInviteB from "./assets/figma/raw-12.png";
import friendsB from "./assets/figma/raw-14.png";
import heartB from "./assets/figma/raw-15.png";
import heartLineB from "./assets/figma/raw-16.png";
import childPinkB from "./assets/figma/raw-17.png";
import clickHand from "./assets/figma/raw-18.png";

const slides = [
  ["welcome", "Начало"],
  ["grow", "История"],
  ["together", "Мы"],
  ["invite", "Приглашение"],
  ["registry", "Роспись"],
  ["celebration", "Праздник"],
  ["date", "Дата"],
  ["details", "Детали"],
  ["rsvp", "Ответ"],
];

function getGuest() {
  const hash = window.location.hash.slice(1);
  const hashParams = new URLSearchParams(hash);
  const rawHashId = hashParams.get("id") || hash;
  const hashId = slides.some(([slideId]) => slideId === rawHashId) ? "" : decodeURIComponent(rawHashId)
    .trim()
    .toLowerCase();
  const queryId = new URLSearchParams(window.location.search)
    .get("guest")
    ?.trim()
    .toLowerCase();
  const id = hashId || queryId;
  return { ...defaultGuest, ...(guests[id] || {}), id };
}

function getInitialSlide() {
  const hash = window.location.hash.slice(1);
  return slides.some(([id]) => id === hash) ? hash : slides[0][0];
}

function SlideNav({ active, onNavigate }) {
  return (
    <nav className="slide-nav" aria-label="Навигация по приглашению">
      {slides.map(([id, label]) => (
        <a
          href={`#${id}`}
          key={id}
          className={active === id ? "is-active" : ""}
          aria-current={active === id ? "page" : undefined}
          onClick={(event) => {
            event.preventDefault();
            event.stopPropagation();
            onNavigate(id);
          }}
        >
          <span>{label}</span><i />
        </a>
      ))}
    </nav>
  );
}

function NextArrow({ href, label }) {
  const arrowRef = useRef(null);

  useEffect(() => {
    const element = arrowRef.current;
    if (!element || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return undefined;
    }

    let frameId;
    const startedAt = performance.now();
    const animate = (now) => {
      const seconds = (now - startedAt) / 1000;
      const offset = Math.sin(seconds * Math.PI) * 7;
      element.style.transform = `translateX(-50%) translateY(${offset}px)`;
      frameId = requestAnimationFrame(animate);
    };

    frameId = requestAnimationFrame(animate);
    return () => {
      cancelAnimationFrame(frameId);
      element.style.transform = "";
    };
  }, []);

  return (
    <a ref={arrowRef} className="next-arrow" href={href} aria-label={label}>
      ↓
    </a>
  );
}

export default function App() {
  const guest = useMemo(getGuest, []);
  const [activeSlide, setActiveSlide] = useState(getInitialSlide);
  const [rsvp, setRsvp] = useState(false);
  const trackRef = useRef(null);
  const activeIndexRef = useRef(Math.max(0, slides.findIndex(([id]) => id === getInitialSlide())));
  const offsetRef = useRef(activeIndexRef.current * -100);
  const animationRef = useRef(null);
  const touchStartRef = useRef(null);

  const goToSlide = (idOrIndex) => {
    const requestedIndex = typeof idOrIndex === "number"
      ? idOrIndex
      : slides.findIndex(([id]) => id === idOrIndex);
    const targetIndex = Math.max(0, Math.min(slides.length - 1, requestedIndex));
    if (requestedIndex < 0 || !trackRef.current) return;

    const targetOffset = targetIndex * -100;
    const startOffset = offsetRef.current;
    const distance = targetOffset - startOffset;
    cancelAnimationFrame(animationRef.current);
    activeIndexRef.current = targetIndex;
    setActiveSlide(slides[targetIndex][0]);
    if (Math.abs(distance) < 0.01) return;

    const startedAt = performance.now();
    const duration = 560;
    const animate = (now) => {
      const progress = Math.min(1, (now - startedAt) / duration);
      const eased = 1 - ((1 - progress) ** 3);
      offsetRef.current = startOffset + distance * eased;
      trackRef.current.style.transform = `translate3d(0, ${offsetRef.current}%, 0)`;
      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      } else {
        animationRef.current = null;
      }
    };
    animationRef.current = requestAnimationFrame(animate);
  };

  const moveBy = (delta) => goToSlide(activeIndexRef.current + delta);

  useEffect(() => {
    if (trackRef.current) {
      trackRef.current.style.transform = `translate3d(0, ${offsetRef.current}%, 0)`;
    }

    const onWheel = (event) => {
      event.preventDefault();
      if (Math.abs(event.deltaY) < 12) return;
      moveBy(event.deltaY > 0 ? 1 : -1);
    };
    const onKeyDown = (event) => {
      const keys = {
        ArrowDown: 1,
        PageDown: 1,
        ArrowRight: 1,
        ArrowUp: -1,
        PageUp: -1,
        ArrowLeft: -1,
      };
      if (keys[event.key]) {
        event.preventDefault();
        moveBy(keys[event.key]);
      } else if (event.key === "Home") {
        event.preventDefault();
        goToSlide(0);
      } else if (event.key === "End") {
        event.preventDefault();
        goToSlide(slides.length - 1);
      }
    };
    const onTouchStart = (event) => {
      touchStartRef.current = event.touches[0]?.clientY ?? null;
    };
    const onTouchEnd = (event) => {
      if (touchStartRef.current == null) return;
      const endY = event.changedTouches[0]?.clientY ?? touchStartRef.current;
      const distance = touchStartRef.current - endY;
      touchStartRef.current = null;
      if (Math.abs(distance) >= 40) moveBy(distance > 0 ? 1 : -1);
    };

    window.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchend", onTouchEnd, { passive: true });
    return () => {
      cancelAnimationFrame(animationRef.current);
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchend", onTouchEnd);
    };
  }, []);

  const handleStoryClick = (event) => {
    const link = event.target.closest("a[href^='#']");
    if (!link || !event.currentTarget.contains(link)) return;
    const id = link.getAttribute("href").slice(1);
    if (!slides.some(([slideId]) => slideId === id)) return;
    event.preventDefault();
    goToSlide(id);
  };

  const respond = () => {
    setRsvp(true);
    if (!rsvpFormUrl) return;
    const url = rsvpFormUrl
      .replace("{id}", encodeURIComponent(guest.id || "unknown"))
      .replace("{guest}", encodeURIComponent(guest.name));
    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <main className="story" onClick={handleStoryClick}>
      <SilkBackground />
      <SlideNav active={activeSlide} onNavigate={goToSlide} />
      <div className="slides" ref={trackRef}>
        <WelcomeSlide />

        <DreamSlide isActive={activeSlide === "grow"} />

        <section className="slide together" id="together" data-slide>
          <h2 className="together__question script">А кем ты хотел стать в детстве?</h2>
          <img className="together__child" src={childPinkA} alt="Дарина в детстве" />
          <img className="together__child-echo" src={childPinkB} alt="" />
          <img className="together__hand" src={clickHand} alt="" />
          <img className="together__wedding" src={childhoodWeddingA} alt="Илья и Дарина играют свадьбу" />
          <img className="together__wedding-echo" src={childhoodWeddingB} alt="" />
          <a className="figma-button" href="#invite">ВМЕСТЕ</a>
        </section>

        <section className="slide invite" id="invite" data-slide>
          <img className="invite__friends" src={friendsA} alt="Илья и Дарина" />
          <img className="invite__friends-echo" src={friendsB} alt="" />
          <img className="invite__polaroid" src={weddingPolaroidA} alt="Детская фотография жениха и невесты" />
          <img className="invite__polaroid-echo" src={weddingPolaroidB} alt="" />
          <div className="invite__copy">
            <p>{guest.salutation}, мы рады сообщить вам, что скоро станем семьёй</p>
            <p>и хотим разделить с вами этот день</p>
          </div>
          <NextArrow href="#registry" label="К росписи" />
        </section>

        <section className="slide registry" id="registry" data-slide>
          <div className="registry__copy">
            <p>Приглашаем вас на роспись<br />по адресу:</p>
            <strong>г. Чебоксары, Московский просп., 38, корп. 5</strong>
            <em>в 13:40</em>
          </div>
          <img className="registry__wedding" src={childhoodWeddingB} alt="" />
          <img className="registry__polaroid" src={weddingPolaroidB} alt="" />
          <img className="registry__line" src={heartLineB} alt="" />
          <NextArrow href="#celebration" label="К празднованию" />
        </section>

        <section className="slide celebration" id="celebration" data-slide>
          <img className="celebration__friends" src={friendsB} alt="" />
          <img className="celebration__heart" src={heartB} alt="" />
          <div className="celebration__copy">
            <p>и на празднование в домик<br />по адресу:</p>
            <strong>Адрес дома</strong>
            <em>в 17:00</em>
          </div>
          <NextArrow href="#date" label="К дате" />
        </section>

        <section className="slide date" id="date" data-slide>
          <p className="date__month"><span>Сентябрь</span> 2026</p>
          <img className="date__calendar" src={calendarInviteA} alt="Календарь сентября 2026" />
          <img className="date__calendar-shadow" src={calendarInviteB} alt="" />
          <p className="date__caption">НА НАГРАЖДЕНИЕ В ДОМИК<br />ПО АДРЕСУ:<br />АДРЕС ДОМА</p>
          <div className="date__days" aria-label="Дни недели">П Н В Т С Р Ч Т П Т С Б В С</div>
          <NextArrow href="#details" label="К деталям" />
        </section>

        <section className="slide details" id="details" data-slide>
          <img className="details__heart" src={heartB} alt="" />
          <img className="details__child" src={childPinkB} alt="" />
          <p>Для нас очень важен этот день и мы решили провести его не совсем привычно — не в ресторане, а на природе.</p>
          <p>Мы хотим провести с вами искренний активный вечер, который мы сами будем писать словно сценаристы сериала.</p>
          <NextArrow href="#rsvp" label="К ответу" />
        </section>

        <section className="slide rsvp" id="rsvp" data-slide>
          <img className="rsvp__line" src={heartLineA} alt="" />
          <p>Для нас очень важен этот день, и мы решили провести его не совсем привычно — не в ресторане, а на природе.</p>
          <p>Мы хотим провести с вами искренний активный вечер, который мы сами будем писать словно сценаристы сериала.</p>
          {!rsvp ? (
            <button className="figma-button figma-button--button" onClick={respond}>
              ACCEPT
            </button>
          ) : (
            <p className="rsvp__thanks">Спасибо, {guest.name}!<br />Очень ждём вас.</p>
          )}
        </section>
      </div>
    </main>
  );
}
