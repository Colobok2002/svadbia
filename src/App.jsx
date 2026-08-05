import { useEffect, useMemo, useRef, useState } from 'react';
import { defaultGuest, guests } from './data/guests';

const getGuest = () => {
  const hashId = decodeURIComponent(window.location.hash.slice(1)).trim().toLowerCase();
  const queryId = new URLSearchParams(window.location.search).get('guest')?.trim().toLowerCase();
  return guests[hashId || queryId] || defaultGuest;
};

function Accordion({ number, title, children }) {
  const [open, setOpen] = useState(false);
  return (
    <article className={`detail ${open ? 'detail--open' : ''}`}>
      <button className="detail__button" onClick={() => setOpen(!open)} aria-expanded={open}>
        <span className="detail__number">{number}</span>
        <span>{title}</span>
        <span className="detail__plus">{open ? '−' : '+'}</span>
      </button>
      <div className="detail__body"><div>{children}</div></div>
    </article>
  );
}

function Intro({ onComplete, opening }) {
  const video = useRef(null);
  const [ready, setReady] = useState(false);
  const [muted, setMuted] = useState(true);

  useEffect(() => {
    const el = video.current;
    if (!el) return undefined;
    const blockSeeking = () => { if (el.currentTime > 0 && !el.ended) el.currentTime = el.currentTime; };
    el.addEventListener('seeking', blockSeeking);
    el.play().catch(() => setReady(true));
    return () => el.removeEventListener('seeking', blockSeeking);
  }, []);

  return (
    <section className={`intro ${opening ? 'intro--opening' : ''}`} aria-label="Видеоприглашение">
      <video ref={video} className="intro__video" autoPlay playsInline muted={muted}
        disablePictureInPicture controlsList="nodownload noplaybackrate nofullscreen"
        onEnded={() => setReady(true)} onError={() => setReady(true)} onContextMenu={(e) => e.preventDefault()}>
        <source src="https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4" type="video/mp4" />
      </video>
      <div className="intro__shade" />
      <p className="intro__caption">история, которая начинается<br />с одного «да»</p>
      <button className="sound" onClick={() => setMuted(!muted)} aria-label={muted ? 'Включить звук' : 'Выключить звук'}>
        {muted ? 'звук выкл.' : 'звук вкл.'}
      </button>
      <div className={`intro__continue ${ready ? 'intro__continue--ready' : ''}`}>
        <span>{ready ? 'всё самое важное впереди' : 'смотрите до конца'}</span>
        {ready && <button onClick={onComplete} disabled={opening}>открыть приглашение <b>↓</b></button>}
      </div>
    </section>
  );
}

function SideNav({ active }) {
  const items = [
    ['hero', 'Начало'], ['date', 'Дата'], ['program', 'Программа'], ['details', 'Детали'], ['rsvp', 'Ответ'],
  ];
  return <nav className="side-nav" aria-label="Навигация по приглашению">
    {items.map(([id, label]) => <a className={active === id ? 'is-active' : ''} href={`#${id}`} key={id} aria-label={label}><span>{label}</span><i /></a>)}
  </nav>;
}

export default function App() {
  const guest = useMemo(getGuest, []);
  const [introComplete, setIntroComplete] = useState(false);
  const [opening, setOpening] = useState(false);
  const [rsvp, setRsvp] = useState(false);
  const [activeSlide, setActiveSlide] = useState('hero');

  const openInvitation = () => {
    setOpening(true);
    window.setTimeout(() => setIntroComplete(true), 700);
  };

  useEffect(() => {
    if (!introComplete) return undefined;
    const sections = document.querySelectorAll('[data-reveal]');
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
        } else {
          entry.target.classList.remove('is-visible');
        }
      });
    }, { threshold: 0.14 });
    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, [introComplete]);

  useEffect(() => {
    if (!introComplete) return undefined;
    const slides = [...document.querySelectorAll('[data-slide]')];
    let locked = false;
    let touchStartY = 0;
    const revealActive = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) setActiveSlide(entry.target.id);
      });
    }, { threshold: 0.6 });
    slides.forEach((slide) => revealActive.observe(slide));

    const go = (direction) => {
      const current = slides.findIndex((slide) => slide.id === activeSlide);
      const next = Math.max(0, Math.min(slides.length - 1, current + direction));
      if (next === current || locked) return;
      locked = true;
      slides[next].scrollIntoView({ behavior: 'smooth', block: 'start' });
      window.setTimeout(() => { locked = false; }, 700);
    };
    const onWheel = (event) => {
      event.preventDefault();
      if (Math.abs(event.deltaY) > 6) go(event.deltaY > 0 ? 1 : -1);
    };
    const onTouchStart = (event) => { touchStartY = event.touches[0].clientY; };
    const onTouchEnd = (event) => {
      const distance = touchStartY - event.changedTouches[0].clientY;
      if (Math.abs(distance) > 42) go(distance > 0 ? 1 : -1);
    };
    window.addEventListener('wheel', onWheel, { passive: false });
    window.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchend', onTouchEnd, { passive: true });
    return () => {
      revealActive.disconnect();
      window.removeEventListener('wheel', onWheel);
      window.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchend', onTouchEnd);
    };
  }, [introComplete, activeSlide]);

  return (
    <main>
      {!introComplete && <Intro onComplete={openInvitation} opening={opening} />}
      {introComplete && <>
        <SideNav active={activeSlide} />
        <div className="invitation">
        <section className="hero section" id="hero" data-reveal data-slide>
          <p className="eyebrow">приглашение на свадьбу</p>
          <div className="hero__names"><span>Илья</span><i>&</i><span>Дарина</span></div>
          <p className="hero__date">25 · 09 · 2026</p>
          <div className="floral floral--top">✦</div>
          <p className="scroll-note">листайте медленно <b>↓</b></p>
        </section>

        <section className="letter section" id="letter" data-reveal data-slide>
          <p className="letter__pre">{guest.salutation},</p>
          <h1>мы очень ждём<br />этот день.</h1>
          <p>И будем бесконечно счастливы разделить его с вами. Сохраните эту дату — начинается наша новая семейная история.</p>
          <div className="letter__signature">Илья <i>и</i> Дарина</div>
        </section>

        <section className="date-card section" id="date" data-reveal data-slide>
          <p className="eyebrow">пятница · сентябрь</p>
          <div className="calendar"><span>24</span><strong>25<small>сентября</small></strong><span>26</span></div>
          <p>2026</p>
        </section>

        <section className="program section" id="program" data-reveal data-slide>
          <p className="eyebrow">как пройдёт день</p>
          <div className="timeline">
            <div><time>15:30</time><p><b>Собираемся</b><br />встречаемся, обнимаемся</p></div>
            <div><time>16:00</time><p><b>Церемония</b><br />говорим самое главное</p></div>
            <div><time>17:00</time><p><b>Ужин и праздник</b><br />танцуем до счастливого конца</p></div>
          </div>
        </section>

        <section className="details section" id="details" data-reveal data-slide>
          <p className="eyebrow">немного деталей</p>
          <Accordion number="01" title="Локация"><p>Усадьба «Белый берег»<br />Московская область, с. Ильинское</p><a href="https://maps.google.com/?q=55.7558,37.6173" target="_blank" rel="noreferrer">открыть карту ↗</a></Accordion>
          <Accordion number="02" title="Дресс-код"><p>Будем рады видеть вас в мягких природных оттенках: кремовом, шалфейном, пыльно-голубом и терракотовом.</p><div className="swatches"><i /><i /><i /><i /></div></Accordion>
          <Accordion number="03" title="Пожелания"><p>Ваше присутствие — лучший подарок. Если захотите нас поздравить, будем благодарны за вклад в нашу мечту о путешествии.</p></Accordion>
        </section>

        <section className="rsvp section" id="rsvp" data-reveal data-slide>
          <p className="eyebrow">до встречи</p>
          <h2>Вы будете<br />с нами?</h2>
          {!rsvp ? <button className="rsvp__button" onClick={() => setRsvp(true)}>Я приду <span>→</span></button> : <p className="rsvp__thanks">Ура, {guest.name}!<br />Мы вас очень ждём ♡</p>}
          <small>Пожалуйста, дайте знать до 25 мая</small>
          <footer>И & Д <span>·</span> 2026</footer>
        </section>
        </div>
      </>}
    </main>
  );
}
