import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer id="contact" className="bg-gray-900 text-white py-10">
      <div className="container mx-auto px-6">
        <div className="footer-content grid grid-cols-1 md:grid-cols-4 gap-6 text-center md:text-left">
          <div className="footer-section">
            <h3 className="text-xl font-semibold mb-2 text-center">Proyak</h3>
            <p className="text-sm text-gray-300">
              Coming soon: The free job board with verified credentials for faster, better job matching.
            </p>
          </div>
        </div>

        <div className="footer-bottom mt-8 border-t border-gray-700 pt-4 text-center text-gray-400 text-sm">
          <p>&copy; 2025 Proyak — Davis Wollesen, Matthew Nelson, Jack Sorensen</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
