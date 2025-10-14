import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="header">
      <nav className="container">
        <a href="#" className="logo">
          <img src="/logo.png" alt="Proyak Logo" />
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
