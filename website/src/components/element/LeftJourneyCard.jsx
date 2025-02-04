import React from "react";
import "./JourneyCard.css";

const LeftJourneyCard = ({ milestone, description, image, date }) => (
  <div className="journey-card left">
    <div className="card-content">
      <img src={image} alt={milestone} className="card-image" />
      <div className="card-text">
        <h3 className="card-title">{milestone}</h3>
        <p className="card-description">{description}</p>
      </div>
    </div>
    <div className="card-date">{date}</div>
  </div>
);

export default LeftJourneyCard;