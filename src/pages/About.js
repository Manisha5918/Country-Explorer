import { Link } from "react-router-dom";

function About() {
  return (
    <div className="about-page">
      <div className="about-container">
        
        {/* Hero Section */}
        <div className="about-hero">
          <div className="about-badge">🏛️ Atlas Chronicles</div>
          <h1>About Country Explorer</h1>
          <p className="about-subtitle">
            A premium cartographic and educational geographic suite for modern explorers.
          </p>
          <div className="about-divider"></div>
        </div>

        {/* Story Section */}
        <div className="about-story">
          <p>
            <strong>Country Explorer</strong> is an interactive Web Atlas crafted for students, educators, and geography enthusiasts alike. Powered by React, it consolidates comprehensive continental statistics, language maps, currency metrics, and real-time weather forecasts into a highly responsive visual encyclopedia.
          </p>
          <p>
            Whether you are organizing a travel bucket list, analyzing comparative population structures, or testing your flag-identification speeds under timed quiz rounds, Country Explorer is built to guide your geographic exploration.
          </p>
        </div>

        {/* Feature Grid */}
        <div className="about-features-grid">
          
          <div className="about-feature-item">
            <div className="feat-icon-badge">🌍</div>
            <h3>Worldwide Atlas</h3>
            <p>
              Detailed profiles, capital information, currencies, languages, and live weather conditions of 250+ nations.
            </p>
          </div>

          <div className="about-feature-item">
            <div className="feat-icon-badge">⚖️</div>
            <h3>Compare Engine</h3>
            <p>
              Interactive side-by-side matrices comparing population distributions, land areas, and regional variables.
            </p>
          </div>

          <div className="about-feature-item">
            <div className="feat-icon-badge">🏆</div>
            <h3>Geography Trivia</h3>
            <p>
              An educational quiz game with 4 question categories, countdown timers, animated feedback, and round history logs.
            </p>
          </div>

          <div className="about-feature-item">
            <div className="feat-icon-badge">📍</div>
            <h3>Leaflet Maps</h3>
            <p>
              Visual capital city coordinates and bucket list tracking powered by dynamic geocoded OpenStreetMap tiles.
            </p>
          </div>

        </div>

        {/* Dashboard Shortcut button */}
        <div className="about-footer-action">
          <Link to="/dashboard" className="about-cta-btn">
            Enter Dashboard →
          </Link>
        </div>

      </div>
    </div>
  );
}

export default About;