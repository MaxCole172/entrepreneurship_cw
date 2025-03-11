import React from 'react';
import PlanetSimulation from './PlanetSimulation';
import './FutureWork.css';

const FutureWork = () => {
  const [selectedPlanet, setSelectedPlanet] = React.useState(null);
  const [openPlanet, setOpenPlanet] = React.useState(null);

  const planetData = [
    { name: "Mercury", message: "Future work on orbital mechanics and planetary physics" },
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
    <div className="future-work-container">
      <nav className="navbar">
        <div className="nav-content">
          <div className="nav-logo">MG</div>
          <div className="nav-links">
            <a href="#home">Home</a>
            <a href="#about">About</a>
            <a href="#contact">Contact</a>
          </div>
        </div>
      </nav>

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

export default FutureWork;