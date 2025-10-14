import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer id="contact">
      <div className="container">
        <div className="footer-content">
          <div className="footer-section">
            <h3>Proyak</h3>
            <p>Coming soon: The free job board with verified credentials for faster, better job matching.</p>
          </div>
          <div className="footer-section">
            <h3>Get Involved</h3>
            <ul>
              <li><a href="#validate">Help Validate Our Concept</a></li>
              <li><a href="#updates">Stay Updated</a></li>
              <li><a href="#features">Learn About Our Vision</a></li>
              <li><a href="#how-it-works">How You Can Help</a></li>
            </ul>
          </div>
          <div className="footer-section">
            <h3>Development Status</h3>
            <ul>
              <li><a href="#">🚧 In Development</a></li>
              <li><a href="#">📋 Validation Phase</a></li>
              <li><a href="#">🎯 Beta Coming Soon</a></li>
              <li><a href="#">📧 Updates Available</a></li>
            </ul>
          </div>
          <div className="footer-section">
            <h3>Contact</h3>
            <ul>
              <li><a href="#updates">Join Our Updates</a></li>
              <li><a href="#validate">Send Feedback</a></li>
              <li><a href="#">Class Project - Fall 2025</a></li>
              <li><a href="#">Validation Study</a></li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; 2025 Proyak - Coming Soon | Class Project Validation Study</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
