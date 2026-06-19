import { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import { jsPDF } from "jspdf";

function RoutePlanner() {
  const [allCountries, setAllCountries] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [selectedCountries, setSelectedCountries] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const plannerMapRef = useRef(null);

  // Load countries from main database
  useEffect(() => {
    fetch("https://raw.githubusercontent.com/iamspruce/search-filter-painate-reactjs/main/data/countries.json")
      .then(res => res.json())
      .then(data => {
        const fixedData = Object.values(data).map(c => ({
          name: {
            common: c.name || "Unknown"
          },
          capital: [c.capital || "N/A"],
          region: c.region || "World",
          population: c.population || 0,
          flags: {
            png: c.alpha2Code
              ? (c.alpha2Code.toLowerCase() === "ee" ? "https://raw.githubusercontent.com/hampusborgos/country-flags/main/png250px/ee.png" : `https://flagcdn.com/w320/${c.alpha2Code.toLowerCase()}.png`)
              : ""
          },
          cca2: c.alpha2Code,
          cca3: c.alpha3Code
        }));
        setAllCountries(fixedData);
      })
      .catch(err => console.error("Error loading route planner countries:", err));

    // Load initial route if saved in localStorage
    const savedRoute = localStorage.getItem("travel_route");
    if (savedRoute) {
      try {
        setSelectedCountries(JSON.parse(savedRoute));
      } catch (e) {
        console.error("Error parsing saved route", e);
      }
    }
  }, []);

  // Save route when selectedCountries changes
  useEffect(() => {
    localStorage.setItem("travel_route", JSON.stringify(selectedCountries));
  }, [selectedCountries]);

  // Handle autocomplete search suggestions
  useEffect(() => {
    if (!searchQuery.trim() || allCountries.length === 0) {
      setSuggestions([]);
      return;
    }
    const filtered = allCountries
      .filter(c => c.name.common.toLowerCase().includes(searchQuery.toLowerCase()) && 
                  !selectedCountries.some(sel => sel.cca3 === c.cca3))
      .slice(0, 5);
    setSuggestions(filtered);
  }, [searchQuery, allCountries, selectedCountries]);

  // Generate realistic weather statistics based on coordinates and region
  const generateMockWeather = (lat, region) => {
    const absLat = Math.abs(lat);
    let temp = 20;
    let condition = "Sunny & Warm";
    let humidity = 60;
    let windSpeed = 12;

    if (absLat < 15) {
      temp = Math.floor(Math.random() * 6) + 29; // 29 to 34
      condition = Math.random() > 0.4 ? "Humid & Tropical" : "Passing Rain Showers";
      humidity = 80;
      windSpeed = 8;
    } else if (absLat < 35) {
      temp = Math.floor(Math.random() * 8) + 22; // 22 to 29
      condition = Math.random() > 0.3 ? "Sunny & Dry" : "Scattered Clouds";
      humidity = 50;
      windSpeed = 10;
    } else if (absLat < 55) {
      temp = Math.floor(Math.random() * 10) + 12; // 12 to 21
      condition = Math.random() > 0.4 ? "Mild & Breezy" : "Overcast Rain";
      humidity = 65;
      windSpeed = 15;
    } else {
      temp = Math.floor(Math.random() * 12) - 5; // -5 to 6
      condition = Math.random() > 0.5 ? "Chilly Winds" : "Light Snowfall";
      humidity = 70;
      windSpeed = 22;
    }

    return { temp, condition, humidity, windSpeed };
  };

  // Add stop to route
  const addStop = async (country) => {
    setIsLoading(true);
    setSearchQuery("");
    setSuggestions([]);

    const countryName = country.name.common;
    const capitalText = Array.isArray(country.capital) ? country.capital[0] : country.capital;
    const query = capitalText && capitalText !== "No Capital" && capitalText !== "N/A"
      ? `${capitalText}, ${countryName}`
      : countryName;

    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1`);
      const data = await res.json();
      let lat = 20;
      let lon = 0;

      if (data && data.length > 0) {
        lat = parseFloat(data[0].lat);
        lon = parseFloat(data[0].lon);
      }

      const weather = generateMockWeather(lat, country.region);
      const newStop = {
        ...country,
        lat,
        lon,
        weather
      };

      setSelectedCountries(prev => [...prev, newStop]);
    } catch (e) {
      console.error("Geocoding failed, using fallbacks:", e);
      const newStop = {
        ...country,
        lat: 20,
        lon: 0,
        weather: generateMockWeather(20, country.region)
      };
      setSelectedCountries(prev => [...prev, newStop]);
    } finally {
      setIsLoading(false);
    }
  };

  // Reordering and deletion controls
  const moveStop = (index, direction) => {
    if (direction === "up" && index === 0) return;
    if (direction === "down" && index === selectedCountries.length - 1) return;

    const targetIndex = direction === "up" ? index - 1 : index + 1;
    const updated = [...selectedCountries];
    const temp = updated[index];
    updated[index] = updated[targetIndex];
    updated[targetIndex] = temp;
    setSelectedCountries(updated);
  };

  const removeStop = (index) => {
    setSelectedCountries(prev => prev.filter((_, idx) => idx !== index));
  };

  const clearRoute = () => {
    if (window.confirm("Are you sure you want to clear your travel route?")) {
      setSelectedCountries([]);
    }
  };

  // Haversine Distance Calculation
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Earth radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const d = R * c;
    return Math.round(d);
  };

  // Calculate cumulative distance and leg breakdowns
  const getRouteBreakdown = () => {
    let total = 0;
    const legs = [];
    for (let i = 0; i < selectedCountries.length - 1; i++) {
      const from = selectedCountries[i];
      const to = selectedCountries[i + 1];
      const dist = calculateDistance(from.lat, from.lon, to.lat, to.lon);
      total += dist;
      legs.push({
        from: from.name.common,
        to: to.name.common,
        distance: dist
      });
    }
    return { total, legs };
  };

  const { total: totalDistance, legs: routeLegs } = getRouteBreakdown();

  // Leaflet Map Integration
  useEffect(() => {
    if (!window.L) return;

    const mapContainer = document.getElementById("planner-map");
    if (!mapContainer) return;

    if (plannerMapRef.current) {
      plannerMapRef.current.remove();
      plannerMapRef.current = null;
    }

    const L = window.L;
    const map = L.map("planner-map").setView([20, 0], 2);

    const isDark = document.body.classList.contains("dark");
    const tileUrl = isDark 
      ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
      : "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";

    L.tileLayer(tileUrl, {
      attribution: isDark 
        ? '&copy; <a href="https://carto.com/attributions">CARTO</a>'
        : '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    const latlngs = [];
    const markerColor = isDark ? "#00B4D8" : "#006D5B";

    selectedCountries.forEach((stop, index) => {
      const capitalText = Array.isArray(stop.capital) ? stop.capital[0] : stop.capital;
      latlngs.push([stop.lat, stop.lon]);

      // Custom circle marker
      L.circleMarker([stop.lat, stop.lon], {
        radius: 8,
        fillColor: markerColor,
        color: "#ffffff",
        weight: 2.5,
        opacity: 1,
        fillOpacity: 0.95
      })
      .addTo(map)
      .bindPopup(`
        <div style="font-family: 'DM Sans', sans-serif; min-width: 150px; color: ${isDark ? '#f8fafc' : '#1e293b'};">
          <h4 style="margin: 0 0 4px 0; color: ${isDark ? '#00B4D8' : '#006D5B'}; font-size: 14px;">Stop ${index + 1}: ${stop.name.common}</h4>
          <p style="margin: 0 0 6px 0; font-size: 11px; opacity: 0.85;">Capital: ${capitalText}</p>
          <p style="margin: 0 0 4px 0; font-size: 11px; font-weight: 600;">Weather: ${stop.weather.temp}°C, ${stop.weather.condition}</p>
        </div>
      `);
    });

    // Draw route polyline
    if (latlngs.length > 1) {
      L.polyline(latlngs, {
        color: markerColor,
        weight: 3,
        dashArray: "8, 8",
        opacity: 0.8,
        lineJoin: "round"
      }).addTo(map);

      // Fit map boundary to include all stops
      map.fitBounds(L.latLngBounds(latlngs), { padding: [50, 50] });
    }

    plannerMapRef.current = map;

    return () => {
      if (plannerMapRef.current) {
        plannerMapRef.current.remove();
        plannerMapRef.current = null;
      }
    };
  }, [selectedCountries]);

  // Dynamic travel recommendations based on regions
  const getTravelTips = () => {
    if (selectedCountries.length === 0) return [];
    const regions = [...new Set(selectedCountries.map(c => c.region))];
    const tips = [];

    if (regions.includes("Europe")) {
      tips.push("Schengen Visa: Check if any European stops require a Schengen visa beforehand.");
    }
    if (regions.includes("Africa") || regions.includes("Asia")) {
      tips.push("Health Advisory: Vaccinations (such as Yellow Fever or Typhoid) might be recommended for these regions.");
    }
    if (selectedCountries.some(c => Math.abs(c.lat) > 50)) {
      tips.push("Cold Weather Prep: Pack insulated layers and thermal wear for high-latitude stops.");
    }
    if (selectedCountries.some(c => Math.abs(c.lat) < 15)) {
      tips.push("Tropical Protection: Carry high-SPF sunscreen, bug repellent, and lightweight linen wear.");
    }
    if (selectedCountries.length > 3) {
      tips.push("Long Itinerary: Consider travel insurance for trips with multiple connections and flight legs.");
    }

    return tips;
  };

  // Export Travel Itinerary PDF
  const exportPDF = () => {
    if (selectedCountries.length === 0) return;

    const doc = new jsPDF();
    const isDark = document.body.classList.contains("dark");
    
    // Theme Colors
    const primaryColor = [0, 109, 91]; // Deep Forest Green
    const secondaryColor = [179, 128, 0]; // Gold

    // Title Block
    doc.setFillColor(...primaryColor);
    doc.rect(0, 0, 210, 40, "F");
    
    doc.setTextColor(255, 255, 255);
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(22);
    doc.text("COUNTRY EXPLORER", 15, 18);
    
    doc.setFont("Helvetica", "normal");
    doc.setFontSize(14);
    doc.text("Official Travel Itinerary Report", 15, 28);
    
    // Summary
    doc.setTextColor(30, 41, 59);
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(15);
    doc.text("Route Summary", 15, 55);
    
    doc.setFont("Helvetica", "normal");
    doc.setFontSize(11);
    doc.text(`Total Stops: ${selectedCountries.length}`, 15, 63);
    doc.text(`Total Route Distance: ${totalDistance.toLocaleString()} km`, 15, 69);
    
    // Draw Divider Line
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.5);
    doc.line(15, 75, 195, 75);

    // Itinerary List
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(15);
    doc.text("Route Stops & Legs", 15, 87);

    let yPosition = 97;
    selectedCountries.forEach((stop, index) => {
      // Check if page boundary exceeded
      if (yPosition > 260) {
        doc.addPage();
        yPosition = 25;
      }

      const capitalText = Array.isArray(stop.capital) ? stop.capital[0] : stop.capital;
      
      doc.setFont("Helvetica", "bold");
      doc.setFontSize(12);
      doc.setTextColor(...primaryColor);
      doc.text(`Stop ${index + 1}: ${stop.name.common}`, 15, yPosition);
      
      doc.setFont("Helvetica", "normal");
      doc.setFontSize(10);
      doc.setTextColor(71, 85, 105);
      doc.text(`Capital: ${capitalText} | Region: ${stop.region} | Population: ${Number(stop.population).toLocaleString()}`, 15, yPosition + 6);
      doc.text(`Weather Condition: ${stop.weather.temp}°C, ${stop.weather.condition} (Wind: ${stop.weather.windSpeed} km/h, Humidity: ${stop.weather.humidity}%)`, 15, yPosition + 12);
      
      yPosition += 22;

      // Leg Distance details
      if (index < selectedCountries.length - 1) {
        const leg = routeLegs[index];
        doc.setDrawColor(...secondaryColor);
        doc.setLineWidth(0.5);
        doc.line(20, yPosition - 3, 20, yPosition + 1);
        
        doc.setFont("Helvetica", "oblique");
        doc.setFontSize(9);
        doc.setTextColor(...secondaryColor);
        doc.text(`Flight leg distance to next stop: ${leg.distance.toLocaleString()} km`, 25, yPosition - 1);
        yPosition += 8;
      }
    });

    // Travel Tips Section
    const tips = getTravelTips();
    if (tips.length > 0) {
      if (yPosition > 230) {
        doc.addPage();
        yPosition = 25;
      }
      
      doc.setDrawColor(226, 232, 240);
      doc.setLineWidth(0.5);
      doc.line(15, yPosition, 195, yPosition);
      
      yPosition += 12;
      doc.setFont("Helvetica", "bold");
      doc.setFontSize(14);
      doc.setTextColor(30, 41, 59);
      doc.text("Important Travel Recommendations", 15, yPosition);
      
      yPosition += 8;
      doc.setFont("Helvetica", "normal");
      doc.setFontSize(10);
      doc.setTextColor(71, 85, 105);
      
      tips.forEach(tip => {
        const splitText = doc.splitTextToSize(`* ${tip}`, 180);
        doc.text(splitText, 15, yPosition);
        yPosition += splitText.length * 6;
      });
    }

    // Save document
    doc.save("travel_itinerary_report.pdf");
  };

  return (
    <div className="planner-page">
      <div className="planner-header">
        <h1>Travel Route Planner</h1>
        <p className="planner-subtitle">Design your multi-stop global journey & discover distance and local conditions</p>
      </div>

      <div className="planner-layout">
        {/* Left Control Column */}
        <div className="planner-controls-column">
          
          {/* Autocomplete Input */}
          <div className="planner-card search-card">
            <h2>Add Travel Destinations</h2>
            <p className="card-hint-text">Search and add countries to configure your itinerary in order.</p>
            <div className="autocomplete-wrapper">
              <input
                type="text"
                className="planner-input"
                placeholder="Search country to add... (e.g. India, Japan, Egypt)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                disabled={isLoading}
              />
              {isLoading && <span className="planner-spinner"></span>}
              {suggestions.length > 0 && (
                <ul className="suggestions-list">
                  {suggestions.map((country, idx) => (
                    <li key={idx} onClick={() => addStop(country)}>
                      <img src={country.flags.png} alt="" className="mini-flag" />
                      <div>
                        <strong>{country.name.common}</strong>
                        <span className="mini-subtext"> - Capital: {country.capital[0]}</span>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {/* Selected Itinerary List */}
          <div className="planner-card itinerary-card">
            <div className="card-header-flex">
              <h2>My Travel Itinerary</h2>
              {selectedCountries.length > 0 && (
                <button className="clear-btn" onClick={clearRoute}>Clear All</button>
              )}
            </div>

            {selectedCountries.length === 0 ? (
              <div className="empty-itinerary">
                <span className="globe-icon">🌍</span>
                <p>No stops added yet.</p>
                <p className="sub-hint">Use the search box above to choose countries and build your custom route.</p>
              </div>
            ) : (
              <div className="itinerary-list">
                {selectedCountries.map((stop, index) => {
                  const capitalText = Array.isArray(stop.capital) ? stop.capital[0] : stop.capital;
                  return (
                    <div key={index} className="itinerary-item">
                      <div className="item-order">{index + 1}</div>
                      <img src={stop.flags.png} alt="" className="itinerary-flag" />
                      
                      <div className="itinerary-info">
                        <h3>{stop.name.common}</h3>
                        <p className="itinerary-subtext">Capital: {capitalText}</p>
                        <div className="itinerary-weather-tag">
                          <span>🌡️ {stop.weather.temp}°C</span>
                          <span> | {stop.weather.condition}</span>
                        </div>
                      </div>

                      <div className="item-actions">
                        <button 
                          className="move-btn" 
                          onClick={() => moveStop(index, "up")}
                          disabled={index === 0}
                          title="Move Up"
                        >
                          ▲
                        </button>
                        <button 
                          className="move-btn" 
                          onClick={() => moveStop(index, "down")}
                          disabled={index === selectedCountries.length - 1}
                          title="Move Down"
                        >
                          ▼
                        </button>
                        <button 
                          className="remove-btn" 
                          onClick={() => removeStop(index)}
                          title="Remove Stop"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right Map & Summary Column */}
        <div className="planner-results-column">
          
          {/* Interactive Map */}
          <div className="planner-card map-card">
            <div id="planner-map" className="planner-map-container"></div>
          </div>

          {/* Route Summary */}
          {selectedCountries.length > 0 && (
            <div className="planner-card summary-card">
              <h2>Itinerary Analytics</h2>
              
              <div className="summary-metrics">
                <div className="metric-box">
                  <span className="metric-title">Total Distance</span>
                  <span className="metric-value">{totalDistance.toLocaleString()} km</span>
                </div>
                <div className="metric-box">
                  <span className="metric-title">Route Stops</span>
                  <span className="metric-value">{selectedCountries.length} countries</span>
                </div>
              </div>

              {routeLegs.length > 0 && (
                <div className="route-breakdown">
                  <h3>Route Leg Breakdowns</h3>
                  <div className="breakdown-list">
                    {routeLegs.map((leg, idx) => (
                      <div key={idx} className="breakdown-item">
                        <span>Stop {idx + 1} to {idx + 2}: <strong>{leg.from}</strong> ➔ <strong>{leg.to}</strong></span>
                        <span className="leg-dist">{leg.distance.toLocaleString()} km</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Travel Advisory Panel */}
              <div className="advisory-panel">
                <h3>🌍 Explorer Travel Recommendations</h3>
                <ul>
                  {getTravelTips().map((tip, idx) => (
                    <li key={idx}>{tip}</li>
                  ))}
                  {getTravelTips().length === 0 && (
                    <li>Select stops across different regions to view travel advisories.</li>
                  )}
                </ul>
              </div>

              {/* Action Buttons */}
              <div className="summary-actions">
                <button className="export-pdf-btn" onClick={exportPDF}>
                  📥 Download PDF Itinerary Report
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default RoutePlanner;
