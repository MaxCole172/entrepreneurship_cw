import React from "react";
import Wavify from "react-wavify";
import JourneyCard from "./element/JourneyCard"; // Existing component (if still needed)
import SimulationScene from "./three-js-components/SimulationScene"; // Our new three.js scene
import "./Home.css";

const Home = () => {
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

      {/* Three.js Simulation Scene */}
      <div className="simulation-container">
        <SimulationScene />
      </div>
    </div>
  );
};

export default Home;