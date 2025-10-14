import React from 'react';

const Hero: React.FC = () => {
  return (
    <section className="hero">
      <div className="container">
        <h1>Proyak is Coming Soon</h1>
        <p>
          We're building the first job board that's completely free for job seekers and uses verified credentials to create perfect matches. Help us validate our concept and stay updated on our progress.
        </p>
        <div className="hero-buttons">
          <a href="#validate" className="btn-primary">Help Us Validate</a>
          <a href="#updates" className="btn-secondary">Stay Updated</a>
        </div>
      </div>
    </section>
  );
};

export default Hero;
