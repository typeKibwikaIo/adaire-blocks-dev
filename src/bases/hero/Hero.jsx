import "./sass/components/Hero.scss";
import HeroImage from "./assets/adimage.png"
const Hero = () => {
  return (
    <div className="ad-hero-container">
        {/* Add a breadcrumb */}
      <div className="ad-hero__breadcrumbs"> 
        <p>Home / Hero</p>
      </div>
      <div className="ad-hero__cta-container">
        <h2 className="ad-hero__heading">
          A radically engaged technology team
        </h2>
        <p className="ad-hero__text">
          At Lumenalta, we build AI-first software solutions that deliver big
          business impact.
        </p>

        <div className="ad-hero__button-container">
          <button className="ad-hero__button ad-hero__button-1">
            Meet Leadership
          </button>
          {/* can toggle presence of a second button */}
          <button className="ad-hero__button ad-hero__button-2">
            Our Culture
          </button>
        </div>
      </div>
      <div className="ad-hero__icon">
        <img src={HeroImage} alt="" className="ad-hero__icon"/>
      </div>
    </div>
  );
};

export default Hero;
