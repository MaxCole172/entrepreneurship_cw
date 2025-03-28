import React from 'react';
import PlanetSimulation from './PlanetSimulation';
import './NextSteps.css';

const NextSteps = () => {
  const [selectedPlanet, setSelectedPlanet] = React.useState(null);
  const [openPlanet, setOpenPlanet] = React.useState(null);

  const planetData = [
    { name: "Mercury", message: "Next steps on orbital mechanics and planetary physics" },
    { name: "Venus", message: "Developing advanced atmospheric simulation systems" },
    { name: "Earth", message: "Implementing realistic weather patterns and seasonal changes" },
    { name: "Mars", message: "Creating terraforming visualization tools" },
    { name: "Jupiter", message: "Studying gas giant dynamics and storm systems" },
    { name: "Neptune", message: "Exploring deep space phenomena and interactions" },
  ];

  const handlePlanetSelect = (planetName) => {
    setSelectedPlanet(planetName);
    setOpenPlanet(planetName);
  };

  return (
    <div className="next-steps-container">
      <header className="header">
        <h1 data-text="Max's Entrepreneurial Galaxy">Max's Entrepreneurial Galaxy</h1>
      </header>

      <main className="main-content">
        <aside className="planet-menu">
          {planetData.map((planet) => (
            <div key={planet.name} className="menu-item">
              <details
                open={openPlanet === planet.name}
                onToggle={(e) => {
                  if (e.target.open) {
                    handlePlanetSelect(planet.name);
                  } else {
                    handlePlanetSelect(null);
                  }
                }}
              >
                <summary>{planet.name}</summary>
                <div className="menu-content">
                  <p>{planet.message}</p>
                </div>
              </details>
            </div>
          ))}
        </aside>

        <section className="simulation-container">
          <PlanetSimulation selectedPlanet={selectedPlanet} />
        </section>
      </main>
    </div>
  );
};

export default NextSteps;