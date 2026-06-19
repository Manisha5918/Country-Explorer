import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

// High-resolution geographic/scenic background images list
const bgImages = [
  "https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=1600&q=80", // Travel vintage map, camera
  "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1600&q=80", // Space satellite planet globe
  "https://images.unsplash.com/photo-1524661135-423995f22d0b?w=1600&q=80", // Hot air balloons, wanderlust travel
  "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=1600&q=80", // Road trip adventure
  "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=1600&q=80"  // Yosemite river mountains scenery
];

const countryFunFacts = {
  "France": "It is the most visited country in the world, welcoming over 89 million tourists annually!",
  "India": "It is home to the wettest inhabited place on Earth and has the largest number of vegetarians globally!",
  "Japan": "It has over 5.5 million vending machines, selling everything from hot canned coffee to fresh fruit!",
  "Brazil": "It is the only country in South America that speaks Portuguese and covers three time zones!",
  "Egypt": "It is home to the only remaining ancient wonder of the world, the Great Pyramid of Giza.",
  "Canada": "It has more lakes than the rest of the world combined, and contains 10% of the world's forests!",
  "Australia": "It has over 10,000 beaches—you could visit a new one every day for over 27 years!",
  "Italy": "It has three active volcanoes: Etna, Stromboli, and Vesuvius, and hosts the most UNESCO sites in the world.",
  "Spain": "It produces over 40% of the world's olive oil, more than double the production of Italy!",
  "Germany": "Over 65% of the Autobahn highways have no federally mandated speed limit!",
  "United States": "It has the world's largest economy and is home to the oldest active written constitution.",
  "China": "All pandas in the world are on loan from China, and it uses 45 billion chopsticks a year!",
  "United Kingdom": "Nowhere in the UK is more than 75 miles (120 km) from the sea!",
  "South Africa": "It is the only country in the world to have three official capital cities: Pretoria, Cape Town, and Bloemfontein.",
  "Tajikistan": "Over 90% of its territory is mountainous, with the Pamir Highway offering some of the highest driving routes on Earth!",
  "Switzerland": "It is illegal to own just one social animal, like a guinea pig or parrot, because they get lonely!",
  "Iceland": "It has no mosquitoes at all, and electricity is generated almost entirely from geothermal and hydro power!",
  "New Zealand": "It was the first country to give women the right to vote (in 1893) and has no native land snakes!",
  "Mexico": "It introduced chocolate, chilies, and corn to the rest of the world, and has the world's largest pyramid.",
  "Greece": "It enjoys more than 250 days of pure sunshine a year, and 80% of its land is mountainous."
};

const getFunFact = (country) => {
  if (!country) return "";
  if (countryFunFacts[country.name]) {
    return countryFunFacts[country.name];
  }
  
  if (country.population > 100000000) {
    return `With over ${(country.population / 1000000).toFixed(0)} million citizens, it is one of the most populated nations on the globe!`;
  }
  if (country.population < 100000) {
    return `It is one of the world's most exclusive micro-states, with a population of just ${country.population.toLocaleString()}!`;
  }
  
  switch (country.region) {
    case "Europe":
      return `It sits in the heart of Europe, rich in historic heritage, diverse languages, and shared cultural borders.`;
    case "Africa":
      return `It is part of Africa, the cradle of humankind, featuring some of the world's most vibrant biodiversity.`;
    case "Americas":
      return `It is located in the Americas, boasting expansive landscapes ranging from tropical coastlines to mountain peaks.`;
    case "Asia":
      return `It is situated in Asia, the largest and most populous continent, home to ancient trade routes and modern metropolises.`;
    case "Oceania":
      return `It is an island nation in Oceania, surrounded by the vast Pacific Ocean, boasting unique ecosystems.`;
    default:
      return `It is a sovereign nation with unique geographic and cultural identity, welcoming global explorers to learn its history.`;
  }
};

// Lightweight counting animation component
function CountUp({ end, duration = 1200 }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    if (end === 0) return;
    const incrementTime = Math.max(Math.floor(duration / end), 15);
    const step = Math.ceil(end / (duration / incrementTime));
    
    const timer = setInterval(() => {
      start += step;
      if (start >= end) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(start);
      }
    }, incrementTime);

    return () => clearInterval(timer);
  }, [end, duration]);

  return <span>{count}</span>;
}

function Home() {
  const navigate = useNavigate();
  const [allCountries, setAllCountries] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);

  // Spotlight States
  const [spotlightCountry, setSpotlightCountry] = useState(null);
  const [animateSpotlight, setAnimateSpotlight] = useState(true);
  const [isPaused, setIsPaused] = useState(false);

  // Live Dashboard Utilities States
  const [currentTime, setCurrentTime] = useState(new Date());
  const [calcAmount, setCalcAmount] = useState("100");
  const [calcFrom, setCalcFrom] = useState("USD");
  const [calcTo, setCalcTo] = useState("EUR");
  const [calcResult, setCalcResult] = useState(null);
  const [recentList, setRecentList] = useState([]);

  // Background Slideshow Index State
  const [currentBgIndex, setCurrentBgIndex] = useState(0);

  // Background slideshow cycle hook
  useEffect(() => {
    const bgTimer = setInterval(() => {
      setCurrentBgIndex((prev) => (prev + 1) % bgImages.length);
    }, 6000); // crossfade slides every 6 seconds
    return () => clearInterval(bgTimer);
  }, []);

  // Clock effect updates every second
  useEffect(() => {
    const clockTimer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(clockTimer);
  }, []);

  const getCityTime = (timezone) => {
    try {
      return currentTime.toLocaleTimeString("en-US", {
        timeZone: timezone,
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: true
      });
    } catch (e) {
      return currentTime.toLocaleTimeString();
    }
  };

  const isDaytime = (timezone) => {
    try {
      const hourStr = currentTime.toLocaleTimeString("en-US", {
        timeZone: timezone,
        hour12: false,
        hour: "numeric"
      });
      const hour = parseInt(hourStr, 10);
      return hour >= 6 && hour < 18;
    } catch (e) {
      return true;
    }
  };

  // Live Currency Converter effect
  const currencyRates = {
    USD: 1.0, EUR: 0.92, GBP: 0.79, INR: 83.5, JPY: 156.4,
    AUD: 1.51, CAD: 1.37, CNY: 7.25, BRL: 5.38, ZAR: 18.42
  };

  useEffect(() => {
    const amountNum = parseFloat(calcAmount);
    if (isNaN(amountNum) || amountNum <= 0) {
      setCalcResult("0.00");
      return;
    }
    const amountInUSD = amountNum / (currencyRates[calcFrom] || 1);
    const finalAmount = amountInUSD * (currencyRates[calcTo] || 1);
    setCalcResult(finalAmount.toFixed(2));
  }, [calcAmount, calcFrom, calcTo]);

  // Load recently viewed countries on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem("recentCountries");
      if (raw) {
        setRecentList(JSON.parse(raw));
      }
    } catch (e) {
      console.error("Error loading recent countries:", e);
    }
  }, []);

  const handleClearRecent = () => {
    localStorage.removeItem("recentCountries");
    setRecentList([]);
  };

  // Fetch verified REST Countries data on mount
  useEffect(() => {
    fetch("https://raw.githubusercontent.com/iamspruce/search-filter-painate-reactjs/main/data/countries.json")
      .then((res) => res.json())
      .then((data) => {
        const countryArray = Object.values(data);
        const mapped = countryArray.map((c) => ({
          name: c.name || "Unknown",
          code: c.alpha3Code || c.alpha2Code || "",
          region: c.region || "Unknown",
          capital: c.capital || "N/A",
          population: c.population || 0,
          flag: c.alpha2Code ? (c.alpha2Code.toLowerCase() === "ee" ? "https://raw.githubusercontent.com/hampusborgos/country-flags/main/png250px/ee.png" : `https://flagcdn.com/w320/${c.alpha2Code.toLowerCase()}.png`) : ""
        }));
        
        // Sort alphabetically
        const sorted = mapped.sort((a, b) => a.name.localeCompare(b.name));
        setAllCountries(sorted);

        // Pick a random country for initial Spotlight
        if (sorted.length > 0) {
          const randomIndex = Math.floor(Math.random() * sorted.length);
          setSpotlightCountry(sorted[randomIndex]);
        }
      })
      .catch((err) => console.error("Error loading home page countries data:", err));
  }, []);

  // Auto-rotation Spotlight Timer Hook
  useEffect(() => {
    if (allCountries.length === 0 || isPaused) return;

    const timer = setInterval(() => {
      rotateSpotlight();
    }, 6500); // Rotate every 6.5 seconds

    return () => clearInterval(timer);
  }, [allCountries, spotlightCountry, isPaused]);

  const rotateSpotlight = () => {
    if (allCountries.length > 0) {
      setAnimateSpotlight(false);
      setTimeout(() => {
        let randomIndex = Math.floor(Math.random() * allCountries.length);
        while (allCountries[randomIndex].name === spotlightCountry?.name && allCountries.length > 1) {
          randomIndex = Math.floor(Math.random() * allCountries.length);
        }
        setSpotlightCountry(allCountries[randomIndex]);
        setAnimateSpotlight(true);
      }, 220);
    }
  };

  const handleShuffleSpotlight = () => {
    rotateSpotlight();
  };

  // Handle Autocomplete Suggestions
  useEffect(() => {
    if (!searchQuery.trim() || allCountries.length === 0) {
      setSuggestions([]);
      return;
    }

    const filtered = allCountries
      .filter((c) => c.name.toLowerCase().includes(searchQuery.toLowerCase()))
      .slice(0, 5); // Max 5 suggestions
    setSuggestions(filtered);
  }, [searchQuery, allCountries]);

  const handleSuggestionClick = (countryCode) => {
    if (countryCode) {
      navigate(`/country/${countryCode}`);
    }
  };

  return (
    <section className="home-page">
      {/* Background Scenic Slideshow Container */}
      <div className="home-bg-slideshow">
        {bgImages.map((imgUrl, idx) => (
          <div
            key={idx}
            className={`bg-slide ${idx === currentBgIndex ? "slide-active" : ""}`}
            style={{ backgroundImage: `url(${imgUrl})` }}
          />
        ))}
      </div>

      <div className="home-bg-shimmer"></div>
      
      {/* Interactive Background Morphing Blobs */}
      <div className="morph-blob blob-one"></div>
      <div className="morph-blob blob-two"></div>
      <div className="morph-blob blob-three"></div>

      {/* Cartographic Scanning Radar Waves */}
      <div className="sonar-wave wave-one"></div>
      <div className="sonar-wave wave-two"></div>
      
      {/* ================= HERO AREA ================= */}
      <div className="home-hero-container">
        
        {/* Left Column: Heading, Autocomplete, Statistics */}
        <div className="home-hero-left">
          <div className="home-hero-badge">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '6px', verticalAlign: 'middle' }}>
              <circle cx="12" cy="12" r="10" />
              <line x1="2" y1="12" x2="22" y2="12" />
              <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
            </svg>
            Global Explorer Portal
          </div>
          <h1>Explore Countries <br /><span className="highlight-text">Without Boundaries</span></h1>
          <p className="home-hero-description">
            Consolidating geographical profiles, comparative data metrics, interactive OpenStreetMap maps, and educational trivia games into a singular visually stunning encyclopedia.
          </p>

          {/* Autocomplete Search input & CTA Button */}
          <div className="home-search-cta-group">
            <div className="home-search-container">
              <div className="home-search-wrap">
                <input
                  type="text"
                  placeholder="Search a country (e.g. India, France, Canada)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                {searchQuery && (
                  <button className="clear-search-btn" onClick={() => setSearchQuery("")}>
                    ×
                  </button>
                )}
              </div>
              
              {/* Live Autocomplete suggestions */}
              {suggestions.length > 0 && (
                <div className="home-suggestions-list">
                  {suggestions.map((c) => (
                    <div
                      key={c.code}
                      className="home-suggestion-item"
                      onClick={() => handleSuggestionClick(c.code)}
                    >
                      <img src={c.flag} alt={c.name} className="suggestion-flag" />
                      <div className="suggestion-info">
                        <span className="suggestion-name">{c.name}</span>
                        <span className="suggestion-region">{c.region}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <Link to="/countries" className="home-cta-btn">
              Start Exploring
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginLeft: '8px' }}>
                <line x1="5" y1="12" x2="19" y2="12"></line>
                <polyline points="12 5 19 12 12 19"></polyline>
              </svg>
            </Link>
          </div>

          {/* Interactive Statistics Counters */}
          <div className="home-stats-counter">
            <div className="counter-item">
              <div className="counter-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                  <path d="M2 12h20" />
                </svg>
              </div>
              <div className="counter-number">
                <CountUp end={250} />+
              </div>
              <div className="counter-label">Sovereign Nations</div>
            </div>
            <div className="counter-item">
              <div className="counter-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="12 2 2 7 12 12 22 7 12 2" />
                  <polyline points="2 17 12 22 22 17" />
                  <polyline points="2 12 12 17 22 12" />
                </svg>
              </div>
              <div className="counter-number">
                <CountUp end={7} />
              </div>
              <div className="counter-label">Continents</div>
            </div>
            <div className="counter-item">
              <div className="counter-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
              </div>
              <div className="counter-number">
                <CountUp end={120} />+
              </div>
              <div className="counter-label">Languages Map</div>
            </div>
            <div className="counter-item">
              <div className="counter-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="1" x2="12" y2="23" />
                  <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                </svg>
              </div>
              <div className="counter-number">
                <CountUp end={140} />+
              </div>
              <div className="counter-label">Currencies</div>
            </div>
          </div>
        </div>

        {/* Right Column: Dynamic Country Spotlight Widget */}
        <div className="home-hero-right">
          {spotlightCountry ? (
            <div 
              className={`home-spotlight-card ${animateSpotlight ? "swap-fade-in" : "swap-fade-out"}`}
              onMouseEnter={() => setIsPaused(true)}
              onMouseLeave={() => setIsPaused(false)}
            >
              <div className="spotlight-header-badge">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '6px', verticalAlign: 'middle', color: 'var(--gold)' }}>
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                  <path d="M2 12h20" />
                </svg>
                Country Spotlight {isPaused ? <span className="paused-indicator">Paused</span> : <span className="rotation-indicator">Auto-shuffling</span>}
              </div>
              
              <div className="spotlight-flag-frame">
                <img src={spotlightCountry.flag} alt={spotlightCountry.name} />
              </div>

              <div className="spotlight-details">
                <h2>{spotlightCountry.name}</h2>
                <div className="spotlight-meta">
                  <div className="meta-row">
                    <span>Capital</span>
                    <strong>{spotlightCountry.capital}</strong>
                  </div>
                  <div className="meta-row">
                    <span>Region</span>
                    <strong>{spotlightCountry.region}</strong>
                  </div>
                  <div className="meta-row">
                    <span>Population</span>
                    <strong>{spotlightCountry.population.toLocaleString()}</strong>
                  </div>
                </div>
              </div>

              {/* Scroll Fun Fact Box */}
              <div className="spotlight-fact-box">
                <div className="scroll-icon"></div>
                <p className="spotlight-fact-text">{getFunFact(spotlightCountry)}</p>
              </div>

              <div className="spotlight-actions">
                <Link to={`/country/${spotlightCountry.code}`} className="spotlight-explore-link">
                  Explore Profile →
                </Link>
                <button className="spotlight-shuffle-btn" onClick={handleShuffleSpotlight} title="Shuffle Spotlight">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ transition: 'transform 0.4s ease' }}>
                    <path d="M23 4v6h-6" />
                    <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
                  </svg>
                  Shuffle
                </button>
              </div>

              {/* Progress Bar Visualizer */}
              {!isPaused && (
                <div className="spotlight-timer-bar-wrap">
                  <div key={spotlightCountry.code} className="spotlight-timer-bar"></div>
                </div>
              )}
            </div>
          ) : (
            <div className="home-spotlight-loading">
              <div className="loading-spinner"></div>
              <p>Loading spotlight country...</p>
            </div>
          )}
      </div>
    </div>

      {/* ================= EXPLORER'S LIVE UTILITIES SECTION ================= */}
      <div className="home-utilities-section">
        <div className="section-header">
          <h2>Explorer's <span className="highlight-text">Live Dashboard</span></h2>
          <p>Real-time world clocks, dynamic currency converter, and your recent discoveries.</p>
          <div className="section-divider"></div>
        </div>

        <div className="utilities-grid">
          {/* World Clock Widget */}
          <div className="utility-card clock-card">
            <h3> World Clock</h3>
            <div className="clock-list">
              {[
                { name: "London", tz: "Europe/London" },
                { name: "New York", tz: "America/New_York" },
                { name: "Tokyo", tz: "Asia/Tokyo" },
                { name: "Sydney", tz: "Australia/Sydney" },
                { name: "Mumbai", tz: "Asia/Kolkata" }
              ].map((city) => {
                const daytime = isDaytime(city.tz);
                return (
                  <div key={city.name} className={`clock-row ${daytime ? "day-theme" : "night-theme"}`}>
                    <div className="clock-city-info">
                      <span className="city-name">{city.name}</span>
                      <span className="city-day-badge">{daytime ? "☀️ Day" : "🌙 Night"}</span>
                    </div>
                    <span className="city-time">{getCityTime(city.tz)}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Currency Converter Widget */}
          <div className="utility-card converter-card">
            <h3> Exchange Hub</h3>
            <div className="converter-body">
              <div className="input-group">
                <label>Amount</label>
                <input
                  type="number"
                  value={calcAmount}
                  onChange={(e) => setCalcAmount(e.target.value)}
                  placeholder="e.g. 100"
                />
              </div>

              <div className="select-row">
                <div className="select-group">
                  <label>From</label>
                  <select value={calcFrom} onChange={(e) => setCalcFrom(e.target.value)}>
                    {Object.keys(currencyRates).map((cur) => (
                      <option key={cur} value={cur}>{cur}</option>
                    ))}
                  </select>
                </div>

                <div className="select-swap-icon">⇄</div>

                <div className="select-group">
                  <label>To</label>
                  <select value={calcTo} onChange={(e) => setCalcTo(e.target.value)}>
                    {Object.keys(currencyRates).map((cur) => (
                      <option key={cur} value={cur}>{cur}</option>
                    ))}
                  </select>
                </div>
              </div>

              {calcResult !== null && (
                <div className="converter-output">
                  <span className="output-label">Estimated Value</span>
                  <div className="output-val">
                    {Number(calcAmount).toLocaleString()} {calcFrom} = <strong>{calcResult} {calcTo}</strong>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Recently Viewed Widget */}
          <div className="utility-card discoveries-card">
            <div className="discoveries-header">
              <h3> Recent Discoveries</h3>
              {recentList.length > 0 && (
                <button className="clear-recent-btn" onClick={handleClearRecent}>
                   Clear History
                </button>
              )}
            </div>
            
            <div className="discoveries-body">
              {recentList.length > 0 ? (
                <div className="recent-list">
                  {recentList.slice(0, 3).map((c) => (
                    <Link key={c.name.common || c.name} to={`/country/${c.cca3 || c.code}`} className="recent-item-link">
                      <div className="recent-item-row">
                        <img src={c.flags?.png || c.flag} alt={c.name.common || c.name} className="recent-item-flag" />
                        <div className="recent-item-info">
                          <span className="recent-item-name">{c.name.common || c.name}</span>
                          <span className="recent-item-cap">Capital: {c.capital?.[0] || c.capital || "N/A"}</span>
                        </div>
                        <span className="recent-arrow">→</span>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="discoveries-empty">
                  <div className="compass-icon"></div>
                  <p>No recent discoveries recorded.</p>
                  <span className="empty-subtext">Countries you explore in the Atlas will appear here for quick access.</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ================= FEATURES DIRECTORY SECTION ================= */}
      <div className="home-features-section">
        <div className="section-header">
          <h2>Advanced <span className="highlight-text">Geographical Toolkit</span></h2>
          <p>Utilize our specialized modules to analyze, inspect, and game geographic intelligence.</p>
          <div className="section-divider"></div>
        </div>

        <div className="home-features-grid">
          
          <Link to="/countries" className="feature-card-link">
            <div className="home-feature-card">
              <div className="card-icon icon-globe">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="2" y1="12" x2="22" y2="12" />
                  <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                </svg>
              </div>
              <h3>Worldwide Atlas</h3>
              <p>Search, filter, and inspect detailed profiles of 250+ countries. Consolidates capital records, languages, currency details, and live weather conditions.</p>
              <span className="card-action-arrow">Open Atlas →</span>
            </div>
          </Link>

          <Link to="/compare" className="feature-card-link">
            <div className="home-feature-card">
              <div className="card-icon icon-compare">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="18" cy="18" r="3" />
                  <circle cx="6" cy="6" r="3" />
                  <path d="M13 6h3a2 2 0 0 1 2 2v7" />
                  <path d="M11 18H8a2 2 0 0 1-2-2V9" />
                </svg>
              </div>
              <h3>Compare Engine</h3>
              <p>Contrast and compare geographic, economic, and demographic metrics of two nations side-by-side using fully aligned structural datasets.</p>
              <span className="card-action-arrow">Compare Now →</span>
            </div>
          </Link>

          <Link to="/quiz" className="feature-card-link">
            <div className="home-feature-card">
              <div className="card-icon icon-quiz">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
                  <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
                  <path d="M4 22h16" />
                  <path d="M10 14.66V17c0 .55-.45 1-1 1H4v2h16v-2h-5c-.55 0-1-.45-1-1v-2.34" />
                  <path d="M12 2a7 7 0 0 0-7 7v4.66a7 7 0 0 0 14 0V9a7 7 0 0 0-7-7z" />
                </svg>
              </div>
              <h3>Trivia Quiz</h3>
              <p>Test your knowledge of world geography. Interactive multiple choice games covering flags, capitals, regions, and population structures under pressure timers.</p>
              <span className="card-action-arrow">Play Quiz →</span>
            </div>
          </Link>

          <Link to="/bucket" className="feature-card-link">
            <div className="home-feature-card">
              <div className="card-icon icon-map">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
              </div>
              <h3>Bucket List Maps</h3>
              <p>Keep a personal track of countries you want to explore or have visited, mapped out in a global Leaflet OpenStreetMap dashboard.</p>
              <span className="card-action-arrow">View Map →</span>
            </div>
          </Link>

        </div>
      </div>
    </section>
  );
}

export default Home;
