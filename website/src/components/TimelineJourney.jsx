import React, { useRef, useState, useEffect } from "react";
import Wave from "react-wavify";
import "./TimelineJourney.css";
import { FaLightbulb, FaGraduationCap, FaBriefcase, FaCode, FaChartLine, FaAward } from 'react-icons/fa';

// Milestone data
const milestones = [
  {
    id: 1,
    year: 2018,
    title: "Started Computer Science Degree",
    description: "Began my journey in computer science at the University of Cambridge, focusing on algorithms and data structures.",
    icon: FaGraduationCap
  },
  {
    id: 2,
    year: 2019,
    title: "First Tech Internship",
    description: "Worked as a software engineering intern at Google, where I contributed to the development of their cloud infrastructure.",
    icon: FaBriefcase
  },
  {
    id: 3,
    year: 2020,
    title: "Launched First Web App",
    description: "Created and deployed my first full-stack web application using React and Node.js, gaining practical experience in modern web development.",
    icon: FaCode
  },
  {
    id: 4,
    year: 2021,
    title: "Research Publication",
    description: "Published research on machine learning algorithms for natural language processing in a peer-reviewed conference.",
    icon: FaLightbulb
  },
  {
    id: 5,
    year: 2022,
    title: "Graduated with First Class Honours",
    description: "Completed my degree with high academic distinction and received recognition for my final year project on AI-driven analytics.",
    icon: FaAward
  },
  {
    id: 6,
    year: 2023,
    title: "Started Tech Startup",
    description: "Founded a technology startup focused on developing AI solutions for small businesses, securing initial seed funding.",
    icon: FaChartLine
  }
];

const TimelineNode = ({ year, Icon, isActive, onClick, position }) => {
  return (
    <div 
      className={`timeline-node ${isActive ? 'active' : ''}`} 
      style={{ left: position }}
      onClick={onClick}
    >
      <div className="node-year">{year}</div>
      <div className="node-dot">
        <Icon className="node-icon" />
      </div>
    </div>
  );
};

const MilestoneDetail = ({ milestone, isVisible }) => {
  return (
    <div className={`milestone-detail ${isVisible ? 'visible' : ''}`}>
      <div className="milestone-title-wrapper">
        <div className="milestone-icon-wrapper">
          <milestone.icon className="milestone-icon" />
        </div>
        <div className="milestone-text">
          <div className="milestone-year">{milestone.year}</div>
          <h3 className="milestone-title">{milestone.title}</h3>
        </div>
      </div>
      <p className="milestone-description">{milestone.description}</p>
    </div>
  );
};

const InteractiveTimeline = () => {
  const [activeMilestone, setActiveMilestone] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const timelineRef = useRef(null);
  const autoAdvanceIntervalRef = useRef(null);
  
  // Handle timeline node click
  const handleNodeClick = (index) => {
    setActiveMilestone(index);
    clearInterval(autoAdvanceIntervalRef.current);
    startAutoAdvance(); // Restart auto-advance
  };
  
  // Start auto-advancing through milestones
  const startAutoAdvance = () => {
    clearInterval(autoAdvanceIntervalRef.current);
    autoAdvanceIntervalRef.current = setInterval(() => {
      setActiveMilestone(prev => {
        const next = prev + 1;
        if (next >= milestones.length) {
          return 0; // Loop back to the beginning
        }
        return next;
      });
    }, 5000);
  };
  
  // Check if timeline is visible in viewport
  useEffect(() => {
    const handleScroll = () => {
      if (timelineRef.current) {
        const rect = timelineRef.current.getBoundingClientRect();
        const isInView = rect.top <= window.innerHeight - 150;
        setIsVisible(isInView);
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Check immediately
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  // Start auto-advancing once visible
  useEffect(() => {
    if (isVisible) {
      startAutoAdvance();
    } else {
      clearInterval(autoAdvanceIntervalRef.current);
    }
    
    return () => clearInterval(autoAdvanceIntervalRef.current);
  }, [isVisible]);
  
  return (
    <div ref={timelineRef} className={`interactive-timeline-container ${isVisible ? 'visible' : ''}`}>
      <div className="wave-connector">
        <Wave
          fill="#ffffff"
          paused={false}
          options={{
            height: 15,
            amplitude: 15,
            speed: 0.15,
            points: 4
          }}
        />
      </div>
      
      <div className="timeline-wrapper">
        <div className="timeline-track">
          <div 
            className="timeline-progress" 
            style={{ width: `${(activeMilestone / (milestones.length - 1)) * 100}%` }}
          />
          
          {milestones.map((milestone, index) => (
            <TimelineNode
              key={index}
              year={milestone.year}
              Icon={milestone.icon}
              isActive={index === activeMilestone}
              onClick={() => handleNodeClick(index)}
              position={`${(index / (milestones.length - 1)) * 100}%`}
            />
          ))}
        </div>
        
        <div className="timeline-controls">
          <div className="control-indicators">
            {milestones.map((_, index) => (
              <span 
                key={index} 
                className={`control-dot ${index === activeMilestone ? 'active' : ''}`}
                onClick={() => handleNodeClick(index)}
              />
            ))}
          </div>
        </div>
      </div>
      
      <MilestoneDetail 
        milestone={milestones[activeMilestone]} 
        isVisible={isVisible}
      />
    </div>
  );
};

export default InteractiveTimeline; 