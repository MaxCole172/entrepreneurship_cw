import React from "react";
import "./JourneyCard.css";

const RightJourneyCard = ({ milestone, description, image, date }) => (
  <div className="journey-card right">
    <div className="card-content">
      <div className="card-text">
        <h3 className="card-title">{milestone}</h3>
        <p className="card-description">{description}</p>
      </div>
      <img src={image} alt={milestone} className="card-image" />
    </div>
    <div className="card-date">{date}</div>
  </div>
);

export default RightJourneyCard;