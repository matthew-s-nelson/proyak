import React from 'react';
import logoImage from '/logo.png';

const Header: React.FC = () => {
  return (
    <header className="header">
      <nav className="container">
        <a href="#" className="logo">
          <img src={logoImage} alt="Proyak Logo" />
        </a>
        <ul className="nav-links">
          <li><a href="#features">Features</a></li>
          <li><a href="#how-it-works">How It Works</a></li>
          <li><a href="#contact">Contact</a></li>
        </ul>
        <a href="#validate" className="cta-button">Help Validate</a>
      </nav>
    </header>
  );
};

export default Header;
