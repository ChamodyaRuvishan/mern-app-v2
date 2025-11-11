import React from 'react';
import './Hero.css';
import hero_banner from '../assets/finalban.jpg';

const Hero = () => {
  return (
    <div className="hero">
      <div className="hero-left">
        <h2 className="glimmer-text">Discover Pieces That Love You Back !</h2>
        <img className="hero-banner" src={hero_banner} alt="Hero Banner" />
      </div>
    </div>
  );
};

export default Hero;