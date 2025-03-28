import React, { useEffect, useRef, useState } from 'react';
import './ParallaxJourney.css';

const milestones = [
  {
    id: 1,
    year: '2018',
    title: 'Started My Journey',
    description: 'Began studying Computer Science with Business Studies at the University of Warwick.',
    side: 'left'
  },
  {
    id: 2,
    year: '2019',
    title: 'First Project',
    description: 'Developed my first significant project, exploring the intersection of technology and business.',
    side: 'right'
  },
  {
    id: 3,
    year: '2020',
    title: 'Internship',
    description: 'Secured an internship at a leading tech company, gaining practical industry experience.',
    side: 'left'
  },
  {
    id: 4,
    year: '2021',
    title: 'Research Publication',
    description: 'Published my first research paper on emerging technologies and their business applications.',
    side: 'right'
  },
  {
    id: 5,
    year: '2022',
    title: 'Entrepreneurial Venture',
    description: 'Launched my first startup focusing on innovative software solutions for businesses.',
    side: 'left'
  },
  {
    id: 6,
    year: '2023',
    title: 'Industry Recognition',
    description: 'Received recognition for contributions to the field of technology and business.',
    side: 'right'
  }
];

const ParallaxJourney = () => {
  const [scrollPosition, setScrollPosition] = useState(0);
  const journeyRef = useRef(null);
  const carRef = useRef(null);
  const milestonesRef = useRef([]);
  
  // Set up Intersection Observer for milestone animations
  useEffect(() => {
    const options = {
      root: null,
      rootMargin: '0px',
      threshold: 0.2,
    };
    
    const handleIntersect = (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        }
      });
    };
    
    const observer = new IntersectionObserver(handleIntersect, options);
    
    milestonesRef.current.forEach(milestone => {
      if (milestone) {
        observer.observe(milestone);
      }
    });
    
    return () => {
      milestonesRef.current.forEach(milestone => {
        if (milestone) {
          observer.unobserve(milestone);
        }
      });
    };
  }, []);
  
  useEffect(() => {
    const handleScroll = () => {
      if (journeyRef.current) {
        const position = window.pageYOffset;
        const element = journeyRef.current;
        const rect = element.getBoundingClientRect();
        const elementTop = rect.top + position;
        const relativeScroll = Math.max(0, position - elementTop);
        
        setScrollPosition(relativeScroll);
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);
  
  useEffect(() => {
    if (carRef.current && journeyRef.current) {
      // Calculate car position along the sine wave
      const journeyHeight = journeyRef.current.offsetHeight;
      const progress = Math.min(1, scrollPosition / (journeyHeight * 0.7));
      
      // Calculate position along the sine wave
      const amplitude = 150; // Wave amplitude (horizontal distance)
      const frequency = 0.8; // Wave frequency
      const yPos = progress * journeyHeight;
      const xPos = Math.sin(progress * Math.PI * 2 * frequency) * amplitude + amplitude;
      
      // Calculate rotation based on the derivative of the sine function
      const angleRad = Math.cos(progress * Math.PI * 2 * frequency) * Math.PI * 2 * frequency;
      const angleDeg = (angleRad * 180) / Math.PI;
      
      // Apply transformations to the car
      carRef.current.style.transform = `translate(${xPos}px, ${yPos}px) rotate(${angleDeg}deg)`;
    }
  }, [scrollPosition]);
  
  // Reset milestone refs
  milestonesRef.current = [];
  
  return (
    <div className="parallax-journey" ref={journeyRef}>
      <h2 className="journey-title">My Journey</h2>
      
      {/* Road Path */}
      <div className="road-container">
        <div className="sine-road">
          {/* Car element */}
          <div className="car" ref={carRef}>
            <svg width="50" height="30" viewBox="0 0 50 30">
              <rect x="10" y="10" width="30" height="15" rx="5" fill="#3498db" />
              <rect x="5" y="20" width="40" height="8" rx="2" fill="#2c3e50" />
              <circle cx="15" cy="28" r="5" fill="#34495e" />
              <circle cx="35" cy="28" r="5" fill="#34495e" />
              <rect x="20" y="5" width="10" height="10" rx="2" fill="#3498db" />
            </svg>
          </div>
        </div>
        
        {/* Milestone markers */}
        {milestones.map((milestone, index) => {
          const position = (index / (milestones.length - 1)) * 100;
          return (
            <div 
              key={milestone.id} 
              className={`milestone milestone-${milestone.side}`}
              style={{ top: `${position}%` }}
              ref={el => milestonesRef.current[index] = el}
            >
              <div className="milestone-marker"></div>
              <div className="milestone-content">
                <div className="milestone-year">{milestone.year}</div>
                <h3 className="milestone-title">{milestone.title}</h3>
                <p className="milestone-description">{milestone.description}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ParallaxJourney; 