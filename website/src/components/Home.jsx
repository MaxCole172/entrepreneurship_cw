import React from "react";
import "./Home.css";

const Home = () => {
  return (
    <div>
      {/* Top Section with Gradient Background */}
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

      {/* Custom Intersection Section */}
      <div className="curve-container">
        <svg
          className="curve"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 1440 320"
        >
          <path
            fill="#fff"
            d="M0,192L60,213.3C120,235,240,277,360,266.7C480,256,600,192,720,186.7C840,181,960,235,1080,256C1200,277,1320,267,1380,261.3L1440,256L1440,320L1380,320C1320,320,1200,320,1080,320C960,320,840,320,720,320C600,320,480,320,360,320C240,320,120,320,60,320L0,320Z"
          ></path>
        </svg>
      </div>

      {/* Content Section Below the Curve */}
      <div className="content-section">
        <h2>Welcome to My Portfolio</h2>
        <p>
          This section can be filled with additional content, such as text,
          images, or any other components you’d like to showcase.
        </p>
      </div>
    </div>
  );
};

export default Home;