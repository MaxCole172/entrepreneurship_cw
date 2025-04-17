import React from 'react';
import PlanetSimulation from './PlanetSimulation';
import './NextSteps.css';

const NextSteps = () => {
  const [selectedPlanet, setSelectedPlanet] = React.useState(null);
  const [openPlanet, setOpenPlanet] = React.useState(null);

  const planetData = [
    { name: "Mercury", message: "These are my close goals which I believe to be achievable soon. I am aiming to get a first class grade average for my second year of university. Over the summer I would also like to launch a new venture, there are a couple of project in which I have been working on but I have not picked the one that will take up most of my attention yet. On a recreational side, I would like to beat the score of my best round of golf!" },
    { name: "Venus", message: "These are the goals in which I am currently the closest to! I am now the President of the Warwick Boxing Society, I would now like to do the best job that I can making the society grow and inclusive for all members. I am very close to solidifying a deal with a new boxing gym for the next academic year!" },
    { name: "Earth", message: " This is where I am at now, still pursuing my degree in Computer Science with Business Studies. My entrepreneurial experience at the moment is less focussed on one specific venture, but more exploring the possibilities and opportunities that arrise. Making sure that I don't take what I currently have for granted and always leaving room to learn more " },
    { name: "Mars", message: "These are my goals that I still believe to be very achievable but a little bit more aspirational. I would like to get a paying customer for one of my software projects and build something that is actively used by the market. Recreationally, I have been learning how to play guitar for around 3 months and the song I aspire to learn is Never Going Back Again by Fleetwood Mac." },
    { name: "Jupiter", message: "These are my more aspirational goals that are more long term. Whilst building up my experience in the software/tech industry, I would like to live and work in America, ideally having been transferred from London. I would love to be in the San Fransisco (Silicon Valley) environment as I believe that if I can get myself there, I will thrive in that type of environment." },
    { name: "Neptune", message: "These are my most aspirational life goals. Business wise, I will run my own large software company and build up a large and effective team of motivated individuals. However, I would also like to not lose sight of other important factors in my life such as my happiness, wellbeing and friendships. One of my goals is to not lose touch with important people in my life as I often think that this is overlooked in entrepreneurial environments." },
  ];

  const handlePlanetSelect = (planetName) => {
    setSelectedPlanet(planetName);
    setOpenPlanet(planetName);
  };

  return (
    <div className="next-steps-container">
      <header className="header">
        <h1 data-text="Max's Entrepreneurial Galaxy">
          Max's Entrepreneurial Galaxy
        </h1>
        <p className="subheading">
          The farther from Earth, the more aspirational the goal.
        </p>
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