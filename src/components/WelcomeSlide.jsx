import heart from "../assets/figma/heart-cropped.png";
import childhoodHug from "../assets/figma/raw-06.png";
import "./WelcomeSlide.scss";

export default function WelcomeSlide() {
  return (
    <section className="slide welcome-slide" id="welcome" data-slide>
      <header className="welcome-slide__header">
        <p>WELCOME to our Story</p>
      </header>

      <div className="welcome-slide__visual">
        <img className="welcome-slide__heart" src={heart} alt="" />
        <div className="welcome-slide__memories">
          <img
            className="welcome-slide__photo"
            src={childhoodHug}
            alt="Илья и Дарина в детстве"
          />
        </div>
      </div>

      <footer className="welcome-slide__footer">
        <a className="figma-button" href="#grow">НАЧАТЬ</a>
      </footer>
    </section>
  );
}
