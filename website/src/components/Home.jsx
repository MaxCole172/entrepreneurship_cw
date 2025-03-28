import React, { useEffect, useRef } from "react";
import Wavify from "react-wavify";
import InteractiveTimeline from "./TimelineJourney";
import "./Home.css";

const Home = () => {
  const headerTextRef = useRef(null);
  
  useEffect(() => {
    // Add animation class after component mounts
    if (headerTextRef.current) {
      setTimeout(() => {
        headerTextRef.current.classList.add('animate-in');
      }, 100);
    }
    
    // Setup scroll reveal for other elements
    const revealElements = document.querySelectorAll('.reveal');
    
    const revealOnScroll = () => {
      revealElements.forEach((element) => {
        const elementTop = element.getBoundingClientRect().top;
        const windowHeight = window.innerHeight;
        
        if (elementTop < windowHeight - 100) {
          element.classList.add('active');
        }
      });
    };
    
    window.addEventListener('scroll', revealOnScroll);
    
    // Initial check
    revealOnScroll();
    
    return () => {
      window.removeEventListener('scroll', revealOnScroll);
    };
  }, []);

  return (
    <div className="home-wrapper">
      {/* Modern Header Section */}
      <div className="modern-header">
        <div className="header-content">
          <div className="header-text" ref={headerTextRef}>
            <h1 className="header-name">Max Cole</h1>
            <div className="header-titles">
              <span className="title-label">Developer</span>
              <span className="title-label">Entrepreneur</span>
              <span className="title-label">Innovator</span>
            </div>
            <p className="header-description">
              Crafting digital experiences at the intersection of technology and business.
              Computer Science with Business Studies at the University of Warwick.
            </p>
            <div className="header-buttons">
              <a href="#journey" className="primary-button">View My Journey</a>
              <a href="/nextsteps" className="secondary-button">Next Steps</a>
            </div>
          </div>
          <div className="header-image">
            <div className="image-container">
              <img
                src="https://via.placeholder.com/500"
                alt="Max Cole"
                className="profile-image"
              />
              <div className="image-decoration"></div>
            </div>
          </div>
        </div>
        
        <div className="header-shapes">
          <div className="shape shape-1"></div>
          <div className="shape shape-2"></div>
          <div className="shape shape-3"></div>
        </div>
      </div>

      {/* Wave Transition */}
      <div className="curve-container">
        <Wavify
          fill="#ffffff"
          paused={false}
          options={{
            height: 30,
            amplitude: 20,
            speed: 0.15,
            points: 4,
          }}
        />
      </div>

      {/* Journey Section with Interactive Timeline */}
      <section id="journey" className="journey-section">
        <h2 className="journey-title">My Professional Journey</h2>
        <p className="journey-subtitle">Milestones in my academic and professional career</p>
        <InteractiveTimeline />
      </section>
    </div>
  );
};

export default Home;