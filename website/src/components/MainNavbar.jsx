import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import './MainNavbar.css';

const MainNavbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  
  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 20;
      if (isScrolled !== scrolled) {
        setScrolled(isScrolled);
      }
    };

    window.addEventListener('scroll', handleScroll);
    
    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('scroll', handleScroll);
      }
    };
  }, [scrolled]);

  return (
    <header className="main-header">
      <div className="main-navbar-container">
        <Link to="/" className="main-navbar-logo">
          <span className="main-logo-text">MC</span>
        </Link>
        
        <div className="main-navbar-links">
          <Link to="/" className={location.pathname === '/' ? 'active' : ''}>
            Home
          </Link>
          <Link to="/nextsteps" className={location.pathname === '/nextsteps' ? 'active' : ''}>
            Next Steps
          </Link>
        </div>
      </div>
    </header>
  );
};

export default MainNavbar; 