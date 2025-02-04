import React, { useEffect } from "react";
import Wavify from "react-wavify";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import JourneyCard from "./element/JourneyCard"; // Import the new component
import WalkingScene from "./three-js-components/WalkingScene";
import "./Home.css";

const Home = () => {
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    gsap.utils.toArray(".journey-card").forEach((card, i) => {
    // Create a timeline for each card
    const timeline = gsap.timeline({
      scrollTrigger: {
        trigger: card,
        start: "top 80%",
        toggleActions: "play none none reverse",
      },
    });

    // Animate card-content (milestone)
    timeline.fromTo(
      card.querySelector(".card-content"),
      {
        x: i % 2 === 0 ? -200 : 200, // Odd cards move in from the left, even from the right
        opacity: 0,
      },
      {
        x: 0,
        opacity: 1,
        duration: 1,
        ease: "power2.out",
      }
    );

    // Animate card-date (date) from the opposite direction
    timeline.fromTo(
      card.querySelector(".card-date"),
      {
        x: i % 2 === 0 ? 200 : -200, // Opposite of card-content animation
        opacity: 0,
      },
      {
        x: 0,
        opacity: 1,
        duration: 1,
        ease: "power2.out",
      },
      "-=0.7" // Overlap the animations slightly for a smoother effect
    );
  });
}, []);
  return (
    <div>
      {/* Top Section */}
      <div className="animated-bg home-container">
        <div className="home-left">
          <h1 className="name">Max Cole</h1>
          <p className="description">
            Studying Computer Science with Business Studies at the University of Warwick
          </p>
        </div>
        <div className="home-right">
          <img
            src="https://via.placeholder.com/300"
            alt="Placeholder for Max Cole"
            className="profile-image"
          />
        </div>
      </div>

      {/* Wave Transition */}
      <div className="curve-container">
        <Wavify
          fill="#ffffff"
          paused={false}
          options={{
            height: 40,
            amplitude: 30,
            speed: 0.15,
            points: 3,
          }}
        />
      </div>

      {/* Content Section Below */}
      <div className="content-section">
        <h2>Welcome</h2>
        <p>
          This section can be filled with additional content, such as text,
          images, or any other components you’d like to showcase.
        </p>
      </div>

      {/* My Journey So Far Section */}
      <div className="journey-section">
        <h2 className="journey-title">My Journey So Far</h2>
        <div className="journey-path">
          <JourneyCard
            milestone="Milestone 1"
            description="Description of the first milestone goes here. Achievements, challenges, and experiences can be summarised."
            image="https://via.placeholder.com/100"
            date="2020"
            isLeft={true}
          />
          <JourneyCard
            milestone="Milestone 2"
            description="Description of the second milestone goes here. Share the journey!"
            image="https://via.placeholder.com/100"
            date="2021"
            isLeft={false}
          />
        </div>
      </div>
      <div id="scroll-container" style={{ height: "200vh" }}>
      {/* The 3D Canvas (man walking) */}
      <WalkingScene />

      {/* Your wave background, cards, etc. could go beneath or above.
          Keep in mind that the Canvas sits in a stacking context. */}
      <div className="animated-bg home-container">
        {/* ...existing code... */}
      </div>

      {/* Make sure the area is tall enough to allow scrolling.
          The camera movement depends on the user's scroll, so you need
          enough height. */}
      <div style={{ marginTop: "120vh" }}>
        {/* Your journey cards and other sections */}
        <div className="journey-section">
          {/* ...existing code... */}
        </div>
      </div>
    </div>
    </div>
  );
};

export default Home;