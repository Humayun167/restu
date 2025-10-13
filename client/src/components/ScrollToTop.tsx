import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    // Scroll immediately to top without any animation
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'instant' as ScrollBehavior
    });
  }, [pathname]);

  return null;
};

export default ScrollToTop;
