import React, { useRef, useState, useEffect } from "react";
import Wave from "react-wavify";
import "./TimelineJourney.css";
import { FaLightbulb, FaGraduationCap, FaBriefcase, FaCode, FaChartLine, FaAward } from 'react-icons/fa';

// Milestone data
const milestones = [
  {
    id: 1,
    year: 2021,
    title: "First Venture",
    description: " This was the year that I completed my GCSE's, went to college but also embarked on my first real entrepreneurial venture. I worked with a group of other students to develop CookBook which was an at home kitchen assistant that would help users keep track of their ingredients at home and automatically order new stock. This eventually failed but it was my first real introduction to the world of business.",
    icon: FaGraduationCap
  },
  {
    id: 2,
    year: 2023,
    title: "A-Levels and Startups",
    description: "Completed my A-Levels achieving A*A*A*A* in Maths, Further Maths, Physics and Computer Science. Also at this time I worked on 2 other startups: Brandssy which was a fashion based social media application and Demogroove which was my first main solo venture. Demogroove is an Ai assistant for small businesses that acts as a social media manager and can organise content. This was my first real experience interacting with potential customers.",
    icon: FaBriefcase
  },
  {
    id: 3,
    year: 2024,
    title: "Iremia",
    description: "Joined the University of Warwick and started Iremia with my Co-Founder Dan. Iremia is a stress identification software that aims to reduce burnout in the workplace. We went through the Xelerate program and pitched at the Shard in London to VC investors!",
    icon: FaCode
  },
  {
    id: 4,
    year: 2024,
    title: "R3 Internship",
    description: "This summer, I joined R3 for an internship in Sales Engineering. Over the 11 weeks I learnt so much about the tech industry and how my interest was more in the intersection of business and technology than just in computer science.",
    icon: FaLightbulb
  },
  {
    id: 5,
    year: 2025,
    title: "UBS Summer Internship",
    description: " I am set to join UBS as a summer intern working in software. I am very excited to see where this opportunity takes me and my next steps!",
    icon: FaAward
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