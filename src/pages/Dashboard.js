import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line
} from "recharts";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

// ── HISTORICAL TIMELINE DATA ──
const HISTORICAL_EVENTS = [
  // Ancient & Classical
  { year: -3100, era: "Ancient", country: "Egypt", flag: "eg", event: "Unification of Upper and Lower Egypt under Pharaoh Narmer, forming one of the world's first nation-states.", icon: "🏛️" },
  { year: -221,  era: "Ancient", country: "China", flag: "cn", event: "Qin Shi Huang unifies the Warring States, establishing the first Chinese empire and the origin of the name 'China'.", icon: "🐉" },
  { year: -509,  era: "Ancient", country: "Rome (Republic)", flag: "it", event: "Roman Republic founded after expulsion of King Tarquinius Superbus, establishing a Senate-led governance model.", icon: "🏺" },
  // Medieval
  { year: 843,  era: "Medieval", country: "France", flag: "fr", event: "Treaty of Verdun divides the Carolingian Empire, creating a distinct West Frankish Kingdom — the foundation of modern France.", icon: "⚜️" },
  { year: 1066, era: "Medieval", country: "England", flag: "gb", event: "Norman Conquest: William the Conqueror defeats Harold II at the Battle of Hastings, reshaping English culture and governance.", icon: "⚔️" },
  { year: 1206, era: "Medieval", country: "Mongolia", flag: "mn", event: "Genghis Khan unifies the Mongol tribes and is declared ruler of all, founding the greatest contiguous empire in history.", icon: "🏹" },
  { year: 1291, era: "Medieval", country: "Switzerland", flag: "ch", event: "Swiss Confederation founded with the Federal Charter of 1291, making it one of the oldest surviving federal democracies.", icon: "🏔️" },
  // Early Modern
  { year: 1492, era: "Early Modern", country: "Spain", flag: "es", event: "Columbus reaches the Americas under Spanish crown; the Reconquista concludes — Spain emerges as a unified global power.", icon: "🧭" },
  { year: 1648, era: "Early Modern", country: "Netherlands", flag: "nl", event: "Peace of Westphalia ends the Thirty Years' War, recognizing Dutch independence and establishing the modern concept of state sovereignty.", icon: "🌷" },
  { year: 1707, era: "Early Modern", country: "United Kingdom", flag: "gb", event: "Acts of Union unite the Kingdom of England and Kingdom of Scotland, forming the Kingdom of Great Britain.", icon: "👑" },
  // Revolutionary Era
  { year: 1776, era: "Revolutionary", country: "United States", flag: "us", event: "Declaration of Independence signed on July 4th, declaring thirteen colonies free from British rule — a turning point in world history.", icon: "🗽" },
  { year: 1789, era: "Revolutionary", country: "France", flag: "fr", event: "French Revolution begins; Declaration of the Rights of Man proclaimed, inspiring democratic movements worldwide.", icon: "🥐" },
  { year: 1804, era: "Revolutionary", country: "Haiti", flag: "ht", event: "Haiti declares independence from France after the only successful slave revolt in history, becoming the first Black republic.", icon: "✊" },
  { year: 1810, era: "Revolutionary", country: "Mexico", flag: "mx", event: "Miguel Hidalgo's Grito de Dolores launches Mexico's war of independence, achieved fully by 1821.", icon: "🌮" },
  { year: 1822, era: "Revolutionary", country: "Brazil", flag: "br", event: "Prince Pedro I declares Brazilian independence from Portugal on September 7th, making Brazil the largest nation in South America.", icon: "🌿" },
  // 19th Century
  { year: 1830, era: "19th Century", country: "Belgium", flag: "be", event: "Belgian Revolution separates Belgium from the Netherlands, establishing a constitutional monarchy and a neutral European state.", icon: "🍫" },
  { year: 1861, era: "19th Century", country: "Italy", flag: "it", event: "Italian unification (Risorgimento) is achieved as King Victor Emmanuel II is proclaimed ruler of the Kingdom of Italy.", icon: "🍕" },
  { year: 1871, era: "19th Century", country: "Germany", flag: "de", event: "German Unification: Otto von Bismarck proclaims the German Empire at Versailles following the Franco-Prussian War.", icon: "🦅" },
  { year: 1898, era: "19th Century", country: "Philippines", flag: "ph", event: "Philippine Declaration of Independence from Spain on June 12th — the first declaration of independence in Asia.", icon: "🌺" },
  // Early 20th Century
  { year: 1901, era: "20th Century", country: "Australia", flag: "au", event: "The Commonwealth of Australia is inaugurated on January 1st, federating six former British colonies into one dominion.", icon: "🦘" },
  { year: 1918, era: "20th Century", country: "Poland", flag: "pl", event: "Poland regains independence after 123 years of partition between Russia, Prussia, and Austria at the end of WWI.", icon: "🦅" },
  { year: 1923, era: "20th Century", country: "Turkey", flag: "tr", event: "Proclamation of the Turkish Republic by Mustafa Kemal Atatürk, replacing the Ottoman Empire after WWI.", icon: "🌙" },
  { year: 1947, era: "20th Century", country: "India", flag: "in", event: "India gains independence from Britain on August 15th after decades of non-violent resistance led by Mahatma Gandhi.", icon: "🕊️" },
  { year: 1947, era: "20th Century", country: "Pakistan", flag: "pk", event: "Pakistan created as a separate Muslim-majority dominion on August 14th, 1947, through the partition of British India.", icon: "☪️" },
  { year: 1948, era: "20th Century", country: "Israel", flag: "il", event: "State of Israel proclaimed on May 14th 1948 by David Ben-Gurion, the first Jewish state in 2,000 years.", icon: "✡️" },
  // Decolonization Era
  { year: 1957, era: "Decolonization", country: "Ghana", flag: "gh", event: "Ghana becomes the first sub-Saharan African country to gain independence from colonial rule, led by Kwame Nkrumah.", icon: "⭐" },
  { year: 1960, era: "Decolonization", country: "Nigeria", flag: "ng", event: "Nigeria gains independence from Britain on October 1st, 1960 — Africa's most populous nation begins self-governance.", icon: "🦅" },
  { year: 1962, era: "Decolonization", country: "Algeria", flag: "dz", event: "Algeria wins independence from France after a brutal 8-year war, one of the most significant decolonization struggles.", icon: "☀️" },
  // Late 20th Century
  { year: 1990, era: "Post Cold War", country: "Germany", flag: "de", event: "Reunification of Germany on October 3rd, 1990, following the fall of the Berlin Wall and end of the Cold War.", icon: "🧱" },
  { year: 1991, era: "Post Cold War", country: "Russia", flag: "ru", event: "Dissolution of the Soviet Union on December 25th, 1991 — 15 new independent republics emerge, reshaping global geopolitics.", icon: "❄️" },
  { year: 1993, era: "Post Cold War", country: "Czech Republic", flag: "cz", event: "Velvet Divorce: Czechoslovakia peacefully splits into the Czech Republic and Slovakia on January 1st, 1993.", icon: "🌹" },
  { year: 2011, era: "Modern", country: "South Sudan", flag: "ss", event: "South Sudan becomes the world's newest recognized country on July 9th, 2011, seceding from Sudan after decades of civil war.", icon: "🌅" },
];

const ERA_FILTERS = ["All", "Ancient", "Medieval", "Early Modern", "Revolutionary", "19th Century", "20th Century", "Decolonization", "Post Cold War", "Modern"];

const geographicFacts = [
  "The world's longest international border is between Canada and the United States, spanning 8,891 kilometers (5,525 miles).",
  "Lesotho, San Marino, and Vatican City are the only three sovereign states in the world completely surrounded by a single other country.",
  "Russia has the largest land forest cover in the world, containing over 8 million square kilometers of boreal forests (taiga).",
  "Despite its massive size (almost 3,000 miles across), the entire country of China operates on a single official time zone (Beijing Time).",
  "Suriname in South America is the most heavily forested sovereign state in the world, with over 90% of its land covered by pristine rainforests.",
  "The country of Mongolia has the lowest population density of any independent nation, with only 2 people per square kilometer.",
  "Mount Everest's peak is the highest point above sea level, but Ecuador's Mount Chimborazo is the closest place on Earth to the Moon due to the Earth's bulge.",
  "With over 18,800 active glaciers, Iceland is the only nation on Earth where glaciers cover more than 11% of the total land mass.",
  "The continent of Africa is the only landmass that spans all four geographic hemispheres (Northern, Southern, Eastern, and Western).",
  "The Maldives is the flattest country in the world, with an average ground level of only 1.5 meters (4 feet 11 inches) above sea level."
];

function Dashboard() {
  const [countries, setCountries] = useState([]);
  const [stats, setStats] = useState({});
  const [region, setRegion] = useState("All");
  const [chart, setChart] = useState("bar");
  const [sort, setSort] = useState("high");

  const [regions, setRegions] = useState([]);
  const [population, setPopulation] = useState([]);
  const [languages, setLanguages] = useState([]);
  const [currencies, setCurrencies] = useState([]);
  const [spotlight, setSpotlight] = useState(null);
  const [records, setRecords] = useState({});
  const [bucket, setBucket] = useState([]);
  const [recent, setRecent] = useState([]);

  // Comparison selections
  const [compareFirst, setCompareFirst] = useState("");
  const [compareSecond, setCompareSecond] = useState("");

  const [factIndex, setFactIndex] = useState(0);

  // Timeline state
  const [activeEra, setActiveEra] = useState("All");
  const [timelineSearch, setTimelineSearch] = useState("");

  const shuffleFact = () => {
    let nextIndex = Math.floor(Math.random() * geographicFacts.length);
    while (nextIndex === factIndex && geographicFacts.length > 1) {
      nextIndex = Math.floor(Math.random() * geographicFacts.length);
    }
    setFactIndex(nextIndex);
  };

  useEffect(() => {
    fetch("https://raw.githubusercontent.com/iamspruce/search-filter-painate-reactjs/main/data/countries.json")
      .then(res => res.json())
      .then(data => {
        const countryArray = Object.values(data);
        const fixed = countryArray.map(c => {
          const nameStr = c.name || "Unknown";
          const flagUrl = c.alpha2Code ? (c.alpha2Code.toLowerCase() === "ee" ? "https://raw.githubusercontent.com/hampusborgos/country-flags/main/png250px/ee.png" : `https://flagcdn.com/w320/${c.alpha2Code.toLowerCase()}.png`) : "";
          const langs = Array.isArray(c.languages) ? c.languages : Object.values(c.languages || {});
          const curs = Object.keys(c.currencies || {});
          
          return {
            name: nameStr,
            cca2: c.alpha2Code || "",
            cca3: c.alpha3Code || "",
            region: c.region || "Unknown",
            population: c.population || 0,
            area: c.area || 0,
            capital: c.capital || "N/A",
            language: langs,
            currency: curs,
            flag: flagUrl
          };
        });

        // Sort alphabetically for dropdown selections
        const sorted = fixed.sort((a, b) => a.name.localeCompare(b.name));
        setCountries(sorted);
        calculate(sorted);
        
        setSpotlight(sorted[Math.floor(Math.random() * sorted.length)]);

        setRecords({
          population: [...sorted].sort((a, b) => b.population - a.population)[0],
          area: [...sorted].sort((a, b) => b.area - a.area)[0],
          small: [...sorted].filter(c => c.area).sort((a, b) => a.area - b.area)[0]
        });
      })
      .catch(err => console.error("API error:", err));

    let fav = JSON.parse(localStorage.getItem("favorites") || "[]");
    setBucket(fav);

    let rec = JSON.parse(localStorage.getItem("recentCountries") || "[]");
    setRecent(rec);
    setFactIndex(Math.floor(Math.random() * geographicFacts.length));
  }, []);

  function calculate(data) {
    let final = region === "All" ? data : data.filter(c => c.region === region);

    // subregions or regions breakdown
    if (region === "All") {
      let r = {};
      final.forEach(c => {
        r[c.region] = (r[c.region] || 0) + 1;
      });
      setRegions(
        Object.keys(r).map(x => ({
          name: x,
          value: r[x]
        })).sort((a, b) => b.value - a.value)
      );
    } else {
      // Show top 8 countries in this region by population as a breakdown
      let topInRegion = [...final]
        .sort((a, b) => b.population - a.population)
        .slice(0, 8)
        .map(c => ({
          name: c.name,
          value: c.population
        }));
      setRegions(topInRegion);
    }

    // top 5 populated countries in the filtered list
    let pop = [...final]
      .sort((a, b) => sort === "high" ? b.population - a.population : a.population - b.population)
      .slice(0, 5)
      .map(c => ({
        name: c.name,
        population: c.population
      }));
    setPopulation(pop);

    // languages count
    let l = {};
    final.forEach(c => {
      c.language.forEach(x => {
        l[x] = (l[x] || 0) + 1;
      });
    });

    setLanguages(
      Object.keys(l)
        .map(x => ({
          name: x,
          value: l[x]
        }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 5)
    );

    // currency count
    let cur = {};
    final.forEach(c => {
      c.currency.forEach(x => {
        cur[x] = (cur[x] || 0) + 1;
      });
    });

    setCurrencies(
      Object.keys(cur)
        .map(x => ({
          name: x,
          value: cur[x]
        }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 5)
    );

    setStats({
      countries: data.length,
      regions: new Set(data.map(c => c.region)).size,
      languages: Object.keys(l).length,
      currencies: Object.keys(cur).length
    });
  }

  useEffect(() => {
    if (countries.length > 0) {
      calculate(countries);
    }
  }, [region, sort, countries]);

  const rotateSpotlight = () => {
    if (countries.length > 0) {
      setSpotlight(countries[Math.floor(Math.random() * countries.length)]);
    }
  };

  const deleteRecent = (nameStr) => {
    let updated = recent.filter(item => (item.name?.common || item.name) !== nameStr);
    localStorage.setItem("recentCountries", JSON.stringify(updated));
    setRecent(updated);
  };

  const toggleFavorite = (country) => {
    let fav = JSON.parse(localStorage.getItem("favorites") || "[]");
    const isFav = fav.some(item => (item.name?.common || item.name) === country.name);
    let updated;
    if (isFav) {
      updated = fav.filter(item => (item.name?.common || item.name) !== country.name);
    } else {
      const countryToSave = {
        name: { common: country.name, official: country.name },
        capital: [country.capital],
        region: country.region,
        population: country.population,
        flags: { png: country.flag },
        cca2: country.cca2,
        cca3: country.cca3,
        currencies: country.currency ? { [country.currency[0]]: { name: country.currency[0] } } : {},
        languages: country.language.reduce((acc, l, idx) => { acc[idx] = l; return acc; }, {})
      };
      updated = [...fav, countryToSave];
    }
    localStorage.setItem("favorites", JSON.stringify(updated));
    setBucket(updated);
  };

  function downloadPDF() {
    const input = document.querySelector(".dashboard-report-area");
    html2canvas(input, { scale: 2, useCORS: true }).then(canvas => {
      const pdf = new jsPDF("p", "mm", "a4");
      const imgData = canvas.toDataURL("image/png");
      const imgWidth = 200;
      const pageHeight = 295;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 5;

      pdf.addImage(imgData, "PNG", 5, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, "PNG", 5, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }
      pdf.save("Country-Executive-Analytics.pdf");
    });
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header-strip">
        <h1>World Intelligence Analytics</h1>
        <p className="dashboard-subtitle">A high-fidelity cartographic data repository</p>
      </div>

      {/* Top Indicators Grid */}
      <div className="dashboard-grid">
        <div className="dash-card">
          <div className="card-icon">🗺️</div>
          <div className="card-content">
            <h2>{stats.countries || 0}</h2>
            <p>Countries</p>
          </div>
        </div>
        <div className="dash-card">
          <div className="card-icon">🗣️</div>
          <div className="card-content">
            <h2>{stats.languages || 0}</h2>
            <p>Languages</p>
          </div>
        </div>
        <div className="dash-card">
          <div className="card-icon">🌎</div>
          <div className="card-content">
            <h2>{stats.regions || 0}</h2>
            <p>Regions</p>
          </div>
        </div>
        <div className="dash-card">
          <div className="card-icon">💳</div>
          <div className="card-content">
            <h2>{stats.currencies || 0}</h2>
            <p>Currencies</p>
          </div>
        </div>
      </div>

      {/* Region filter controls */}
      <div className="controls">
        {["All", "Asia", "Europe", "Africa", "Americas", "Oceania"].map(r => (
          <button
            key={r}
            className={region === r ? "active-region" : ""}
            onClick={() => setRegion(r)}
          >
            {r}
          </button>
        ))}
      </div>

      {/* Main printable report container */}
      <div className="dashboard-report-area">
        <div className="report-only-header">
          <h2>World Country Explorer - Executive Report</h2>
          <p>Region Filter: {region} | Sort Mode: Population ({sort === "high" ? "High to Low" : "Low to High"})</p>
        </div>

        {/* Sort and Toggle options */}
        <div className="buttons">
          <button onClick={() => setSort(sort === "high" ? "low" : "high")}>
            Sort {sort === "high" ? "High to Low" : "Low to High"}
          </button>
          <button onClick={() => setChart(chart === "bar" ? "line" : "bar")}>
            Switch Chart ({chart === "bar" ? "Line" : "Bar"})
          </button>
          <button onClick={downloadPDF} className="export-pdf-btn">
            Export PDF Report
          </button>
        </div>

        {/* Analytics Grid */}
        <div className="analytics-section">
          {/* Chart 1: Subregions / Region count */}
          <div className="info-box">
            <h2>{region === "All" ? "Region Distribution" : `${region} Populations`}</h2>
            <ResponsiveContainer height={250}>
              {chart === "bar" ? (
                <BarChart data={regions}>
                  <XAxis dataKey="name" stroke="#6B7294" fontSize={11} />
                  <YAxis stroke="#6B7294" fontSize={11} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="value" fill="var(--forest)" radius={[4, 4, 0, 0]} />
                </BarChart>
              ) : (
                <LineChart data={regions}>
                  <XAxis dataKey="name" stroke="#6B7294" fontSize={11} />
                  <YAxis stroke="#6B7294" fontSize={11} />
                  <Tooltip content={<CustomTooltip />} />
                  <Line type="monotone" dataKey="value" stroke="var(--forest)" strokeWidth={3} activeDot={{ r: 6 }} />
                </LineChart>
              )}
            </ResponsiveContainer>
          </div>

          {/* Chart 2: Top Populated */}
          <div className="info-box">
            <h2>Top 5 Populated ({region})</h2>
            <ResponsiveContainer height={250}>
              <BarChart data={population} layout="vertical" margin={{ left: 15 }}>
                <XAxis type="number" stroke="#6B7294" fontSize={10} />
                <YAxis type="category" dataKey="name" stroke="#6B7294" fontSize={10} width={80} />
                <Tooltip content={<CustomTooltip format="pop" />} />
                <Bar dataKey="population" fill="var(--gold)" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Chart 3: Languages */}
          <div className="info-box">
            <h2>Top 5 Languages</h2>
            <ResponsiveContainer height={250}>
              <PieChart>
                <Pie
                  data={languages}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={3}
                  label
                >
                  {languages.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index % 2 === 0 ? "var(--forest)" : "var(--gold)"} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Chart 4: Currencies */}
          <div className="info-box">
            <h2>Top 5 Currencies</h2>
            <ResponsiveContainer height={250}>
              <BarChart data={currencies}>
                <XAxis dataKey="name" stroke="#6B7294" fontSize={11} />
                <YAxis stroke="#6B7294" fontSize={11} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="value" fill="var(--forest-l)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Spotlight and Records Section */}
        <div className="dashboard-extra">
          {/* Spotlight Card */}
          {spotlight && (
            <div className="extra-card spotlight-card">
              <div className="card-header-action">
                <h2>Spotlight Country</h2>
                <button className="action-btn-mini" onClick={rotateSpotlight}>
                  Next
                </button>
              </div>
              <div className="spotlight-content">
                <img className="spotlight-flag" src={spotlight.flag} alt="" />
                <div className="spotlight-text">
                  <h3>{spotlight.name}</h3>
                  <p>Capital: <strong>{spotlight.capital}</strong></p>
                  <p>Region: <strong>{spotlight.region}</strong></p>
                  <p>Population: <strong>{spotlight.population.toLocaleString()}</strong></p>
                  <Link to={`/country/${spotlight.cca3}`} className="details-link">
                    Explore Details
                  </Link>
                </div>
              </div>
            </div>
          )}

          {/* Records Card */}
          <div className="extra-card records-card">
            <h2>World Records</h2>
            <div className="records-list">
              {records.population && (
                <div className="record-row">
                  <div className="record-icon">👥</div>
                  <div className="record-details">
                    <span className="record-label">Most Populated</span>
                    <div className="record-country">
                      {records.population.flag && <img src={records.population.flag} className="record-flag" alt="" />}
                      <Link to={`/country/${records.population.cca3}`}>{records.population.name}</Link>
                      <span className="record-val">({records.population.population.toLocaleString()})</span>
                    </div>
                  </div>
                </div>
              )}
              {records.area && (
                <div className="record-row">
                  <div className="record-icon">🗺️</div>
                  <div className="record-details">
                    <span className="record-label">Largest Land Area</span>
                    <div className="record-country">
                      {records.area.flag && <img src={records.area.flag} className="record-flag" alt="" />}
                      <Link to={`/country/${records.area.cca3}`}>{records.area.name}</Link>
                      <span className="record-val">({records.area.area.toLocaleString()} km²)</span>
                    </div>
                  </div>
                </div>
              )}
              {records.small && (
                <div className="record-row">
                  <div className="record-icon">🏝️</div>
                  <div className="record-details">
                    <span className="record-label">Smallest Land Area</span>
                    <div className="record-country">
                      {records.small.flag && <img src={records.small.flag} className="record-flag" alt="" />}
                      <Link to={`/country/${records.small.cca3}`}>{records.small.name}</Link>
                      <span className="record-val">({records.small.area.toLocaleString()} km²)</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Bucket List & History Section */}
        <div className="dashboard-extra">
          {/* Bucket list */}
          <div className="extra-card list-card">
            <h2>Bucket List</h2>
            {bucket.length === 0 ? (
              <p className="empty-msg">No countries added yet.</p>
            ) : (
              <div className="dashboard-pills">
                {bucket.map(c => {
                  const countryName = c.name?.common || c.name;
                  const flagUrl = c.flags?.png || c.flag;
                  const targetCode = c.cca3 || c.cca2;
                  return (
                    <div key={countryName} className="dashboard-pill">
                      {flagUrl && <img className="pill-flag" src={flagUrl} alt="" />}
                      <Link to={`/country/${targetCode}`} className="pill-name">
                        {countryName}
                      </Link>
                      <button
                        className="pill-remove"
                        onClick={() => toggleFavorite({ name: countryName })}
                      >
                        ×
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Recently Viewed */}
          <div className="extra-card list-card">
            <h2>Recently Viewed</h2>
            {recent.length === 0 ? (
              <p className="empty-msg">No recently viewed countries.</p>
            ) : (
              <div className="dashboard-pills">
                {recent.map(c => {
                  const countryName = c.name?.common || c.name;
                  const flagUrl = c.flags?.png || c.flag;
                  const targetCode = c.cca3 || c.cca2;
                  return (
                    <div key={countryName} className="dashboard-pill">
                      {flagUrl && <img className="pill-flag" src={flagUrl} alt="" />}
                      <Link to={`/country/${targetCode}`} className="pill-name">
                        {countryName}
                      </Link>
                      <button
                        className="pill-remove"
                        onClick={() => deleteRecent(countryName)}
                      >
                        ×
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Quick Compare Card row */}
        <div className="dashboard-extra">
          <div className="extra-card compare-widget-card">
            <h2>Quick Compare</h2>
            <div className="compare-widget-body">
              <div className="compare-select-row">
                <label>First Country</label>
                <select
                  value={compareFirst}
                  onChange={(e) => setCompareFirst(e.target.value)}
                >
                  <option value="">Select first country...</option>
                  {countries.map(c => (
                    <option key={c.cca3 + "-first"} value={c.name}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div className="compare-select-row">
                <label>Second Country</label>
                <select
                  value={compareSecond}
                  onChange={(e) => setCompareSecond(e.target.value)}
                >
                  <option value="">Select second country...</option>
                  {countries.map(c => (
                    <option key={c.cca3 + "-second"} value={c.name}>{c.name}</option>
                  ))}
                </select>
              </div>
              <Link
                to={compareFirst && compareSecond ? `/compare?first=${encodeURIComponent(compareFirst)}&second=${encodeURIComponent(compareSecond)}` : "#"}
                className="compare-submit-btn"
                style={{
                  pointerEvents: compareFirst && compareSecond ? "auto" : "none",
                  opacity: compareFirst && compareSecond ? 1 : 0.5
                }}
              >
                Compare Selected Countries
              </Link>
            </div>
          </div>

          {/* Geographic Fact Explorer Card */}
          <div className="extra-card fact-card">
            <h2>Geographic Fact Explorer</h2>
            <div className="fact-body">
              <span className="fact-icon">Did You Know?</span>
              <p className="fact-text">"{geographicFacts[factIndex]}"</p>
              <button className="action-btn-mini fact-shuffle-btn" onClick={shuffleFact}>
                Next Fact
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* ── HISTORICAL TIMELINE ── */}
      <div className="timeline-section">
        <div className="timeline-section-header">
          <div className="timeline-title-group">
            <h2>World History Timeline</h2>
            <p className="timeline-subtitle">Key moments that shaped the nations of our world</p>
          </div>
          <div className="timeline-controls">
            <div className="timeline-search-wrap">
              <span className="timeline-search-icon">⌕</span>
              <input
                className="timeline-search"
                type="text"
                placeholder="Search country or event…"
                value={timelineSearch}
                onChange={e => setTimelineSearch(e.target.value)}
              />
              {timelineSearch && (
                <button className="timeline-search-clear" onClick={() => setTimelineSearch("")}>×</button>
              )}
            </div>
          </div>
        </div>

        {/* Era filter tabs */}
        <div className="era-filter-bar">
          {ERA_FILTERS.map(era => (
            <button
              key={era}
              className={`era-tab${activeEra === era ? " era-tab--active" : ""}`}
              onClick={() => setActiveEra(era)}
            >
              {era}
            </button>
          ))}
        </div>

        {/* Vertical Timeline */}
        <div className="timeline-track">
          {HISTORICAL_EVENTS
            .filter(e =>
              (activeEra === "All" || e.era === activeEra) &&
              (timelineSearch === "" ||
                e.country.toLowerCase().includes(timelineSearch.toLowerCase()) ||
                e.event.toLowerCase().includes(timelineSearch.toLowerCase()) ||
                String(Math.abs(e.year)).includes(timelineSearch)
              )
            )
            .sort((a, b) => a.year - b.year)
            .map((ev, idx) => (
              <div key={idx} className={`timeline-item ${idx % 2 === 0 ? "tl-left" : "tl-right"}`}>
                <div className="tl-connector">
                  <div className="tl-dot">{ev.icon}</div>
                  <div className="tl-line"></div>
                </div>
                <div className="tl-card">
                  <div className="tl-card-header">
                    <div className="tl-year-badge">
                      {ev.year < 0 ? `${Math.abs(ev.year)} BCE` : `${ev.year} CE`}
                    </div>
                    <span className={`tl-era-tag tl-era-${ev.era.replace(/ /g, "-").toLowerCase()}`}>{ev.era}</span>
                  </div>
                  <div className="tl-card-body">
                    <div className="tl-country-row">
                      <img
                        className="tl-flag"
                        src={`https://flagcdn.com/w40/${ev.flag}.png`}
                        alt={ev.country}
                        onError={e => { e.target.style.display = "none"; }}
                      />
                      <h3 className="tl-country-name">{ev.country}</h3>
                    </div>
                    <p className="tl-event-text">{ev.event}</p>
                  </div>
                </div>
              </div>
            ))
          }
          {HISTORICAL_EVENTS.filter(e =>
            (activeEra === "All" || e.era === activeEra) &&
            (timelineSearch === "" ||
              e.country.toLowerCase().includes(timelineSearch.toLowerCase()) ||
              e.event.toLowerCase().includes(timelineSearch.toLowerCase()) ||
              String(Math.abs(e.year)).includes(timelineSearch)
            )
          ).length === 0 && (
            <div className="timeline-empty">
              <span>🌐</span>
              <p>No events found for this filter. Try a different era or search term.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Custom Tooltip Component
function CustomTooltip({ active, payload, format }) {
  if (active && payload && payload.length) {
    let value = payload[0].value;
    if (format === "pop" || value > 100000) {
      value = Number(value).toLocaleString();
    }
    return (
      <div className="chart-custom-tooltip">
        <p className="tooltip-label">{payload[0].payload.name}</p>
        <p className="tooltip-val">Value: <strong>{value}</strong></p>
      </div>
    );
  }
  return null;
}

export default Dashboard;