import { useEffect } from 'react';

export const useSmoothScroll = () => {
  useEffect(() => {
    // We no longer intercept clicks for routing. React Router handles navigation.

    // Add scroll effect to header
    const handleHeaderScroll = () => {
      const header = document.querySelector('.header') as HTMLElement;
      if (header) {
        if (window.scrollY > 100) {
          header.style.background = 'rgba(255, 255, 255, 0.95)';
          header.style.backdropFilter = 'blur(10px)';
        } else {
          header.style.background = '#fff';
          header.style.backdropFilter = 'none';
        }
      }
    };

    window.addEventListener('scroll', handleHeaderScroll);

    // Cleanup
    return () => {
      window.removeEventListener('scroll', handleHeaderScroll);
    };
  }, []);
};
