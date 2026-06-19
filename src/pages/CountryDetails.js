import { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import html2canvas from "html2canvas";


function CountryDetails(){


const {name}=useParams();



const [country,setCountry]=useState(null);


const [weather,setWeather]=useState(null);



const [amount,setAmount]=useState("");

const [fromCurrency,setFromCurrency]=useState("USD");

const [converted,setConverted]=useState("");

const [rate,setRate]=useState("");



const [saved,setSaved]=useState(false);

const [recent,setRecent]=useState([]);
const [mapCoords, setMapCoords] = useState(null);
const mapRef = useRef(null);
const markerRef = useRef(null);

// Travel Notes state
const [notes, setNotes] = useState([]);
const [noteInput, setNoteInput] = useState("");
const [editingId, setEditingId] = useState(null);
const [editText, setEditText] = useState("");
const [shareLoading, setShareLoading] = useState(false);
const shareCardRef = useRef(null);



const apiKey = process.env.REACT_APP_WEATHER_API_KEY;





useEffect(()=>{


fetch(

"https://raw.githubusercontent.com/iamspruce/search-filter-painate-reactjs/main/data/countries.json"

)


.then(res=>res.json())


.then(data=>{



let countryArray = Object.values(data);



let fixedData = countryArray.map(c=>({



name:{


common:

c.name?.common || c.name || "Unknown",


official:

c.name?.official || "Unknown"


},




capital:[

c.capital || "No Capital"

],




region:

c.region || "World",





population:

c.population || 0,


flags:{

png:

c.alpha2Code
?
(c.alpha2Code.toLowerCase() === "ee" ? "https://raw.githubusercontent.com/hampusborgos/country-flags/main/png250px/ee.png" : `https://flagcdn.com/w320/${c.alpha2Code.toLowerCase()}.png`)
:
""

},


cca2:

c.alpha2Code || "",


cca3:

c.alpha3Code || "",




currencies: c.currencies || (c.currency ? { [c.currency]: { name: c.currency } } : {}),






languages:


c.languages || {},






maps:{


googleMaps:

`https://www.google.com/maps/search/${c.name?.common || c.name}`


},







}));




let result = fixedData.find(c=>


c.cca3?.toLowerCase() === name.toLowerCase()

||

c.cca2?.toLowerCase() === name.toLowerCase()

||

c.name.common.toLowerCase() === name.toLowerCase()


);





if(!result){


setCountry("NOT_FOUND");

return;


}






setCountry(result);
// ==============================
// RECENTLY VIEWED
// ==============================


let oldRecent =

JSON.parse(

localStorage.getItem("recentCountries")

)

||

[];





let removeDuplicate = oldRecent.filter(

item => item.name.common !== result.name.common

);





let updatedRecent = [

result,

...removeDuplicate

].slice(0,5);





localStorage.setItem(

"recentCountries",

JSON.stringify(updatedRecent)

);



setRecent(updatedRecent);









// ==============================
// WEATHER
// ==============================



if(result.capital){


fetch(
`https://api.openweathermap.org/data/2.5/weather?q=${result.capital[0]}&appid=${apiKey}`
)


.then(res=>res.json())



.then(weatherData=>{


setWeather(weatherData);


})


.catch(error=>console.log(error));



}










// ==============================
// CHECK FAVORITE
// ==============================


let fav =

JSON.parse(

localStorage.getItem("favorites")

)

||

[];





let exist = fav.find(

item =>

item.name.common === result.name.common

);




if(exist){


setSaved(true);


}

else{


setSaved(false);


}




})


.catch(error=>{


console.log(error);


});



},[name]);

// Load notes whenever country changes
useEffect(() => {
  if (country && country !== "NOT_FOUND") {
    loadNotes(country.name.common);
  }
}, [country]);


// ==============================
// MAP GEOGRAPHY RESOLVER & INITIALIZER
// ==============================
useEffect(() => {
  if (weather && weather.coord) {
    setMapCoords({ lat: weather.coord.lat, lon: weather.coord.lon });
  } else if (country && country.name && country.name.common !== "Unknown" && country !== "NOT_FOUND") {
    const capital = country.capital && country.capital[0] !== "No Capital" ? country.capital[0] : "";
    const query = capital ? `${capital}, ${country.name.common}` : country.name.common;
    fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1`)
      .then(res => res.json())
      .then(data => {
        if (data && data.length > 0) {
          setMapCoords({ lat: parseFloat(data[0].lat), lon: parseFloat(data[0].lon) });
        }
      })
      .catch(err => console.log("Geocoding fallback error:", err));
  }
}, [weather, country]);

useEffect(() => {
  if (!mapCoords || !window.L || !country || country === "NOT_FOUND") return;
  
  const L = window.L;
  const { lat, lon } = mapCoords;
  const mapContainer = document.getElementById("country-map");
  
  if (mapContainer) {
    if (!mapRef.current) {
      const map = L.map("country-map").setView([lat, lon], 6);
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(map);
      
      mapRef.current = map;
    } else {
      mapRef.current.setView([lat, lon], 6);
    }
    
    const capitalName = country.capital && country.capital[0] !== "No Capital" ? country.capital[0] : "";
    const popupContent = `<b>${capitalName || country.name.common}</b><br>${capitalName ? `Capital of ${country.name.common}` : country.name.common}`;
    
    if (!markerRef.current) {
      const marker = L.marker([lat, lon])
        .addTo(mapRef.current)
        .bindPopup(popupContent)
        .openPopup();
      markerRef.current = marker;
    } else {
      markerRef.current.setLatLng([lat, lon]);
      markerRef.current.setPopupContent(popupContent);
      markerRef.current.openPopup();
    }
  }
}, [mapCoords, country]);

useEffect(() => {
  return () => {
    if (mapRef.current) {
      try {
        mapRef.current.remove();
      } catch (e) {
        console.log("Error cleaning up map:", e);
      }
      mapRef.current = null;
    }
    markerRef.current = null;
  };
}, []);












// DELETE RECENTLY VIEWED



function deleteRecent(countryName){



let updated = recent.filter(

item => item.name.common !== countryName

);



localStorage.setItem(

"recentCountries",

JSON.stringify(updated)

);



setRecent(updated);



}
// ==============================
// BUCKET LIST
// ==============================


function addBucket(){



let old =

JSON.parse(

localStorage.getItem("favorites")

)

||

[];





if(!saved){



old.push(country);



localStorage.setItem(

"favorites",

JSON.stringify(old)

);



setSaved(true);



}





else{



let removed = old.filter(

item =>

item.name.common !== country.name.common

);



localStorage.setItem(

"favorites",

JSON.stringify(removed)

);



setSaved(false);



}



}












// ==============================
// CURRENCY CONVERTER
// User currency -> opened country currency
// ==============================


function convertCurrency(){



let targetCurrency =

Object.keys(country.currencies || {})[0];





if(!amount || !targetCurrency){


return;


}





fetch(

`https://api.exchangerate-api.com/v4/latest/${fromCurrency}`

)



.then(res=>res.json())



.then(data=>{





let value =

Number(amount)

*

data.rates[targetCurrency];






setConverted(value);






setRate(

`1 ${fromCurrency} = ${data.rates[targetCurrency]} ${targetCurrency}`

);





})



.catch(error=>console.log(error));



}



// ==============================
// PDF DOWNLOAD
// ==============================
function downloadReport(){
  window.print();
}

// ==============================
// TRAVEL NOTES
// ==============================
function loadNotes(countryName) {
  const stored = JSON.parse(localStorage.getItem(`notes_${countryName}`) || "[]");
  setNotes(stored);
}

function saveNote() {
  if (!noteInput.trim()) return;
  const newNote = {
    id: Date.now(),
    text: noteInput.trim(),
    date: new Date().toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })
  };
  const updated = [newNote, ...notes];
  setNotes(updated);
  localStorage.setItem(`notes_${country.name.common}`, JSON.stringify(updated));
  setNoteInput("");
}

function deleteNote(id) {
  const updated = notes.filter(n => n.id !== id);
  setNotes(updated);
  localStorage.setItem(`notes_${country.name.common}`, JSON.stringify(updated));
}

function startEdit(note) {
  setEditingId(note.id);
  setEditText(note.text);
}

function saveEdit(id) {
  if (!editText.trim()) return;
  const updated = notes.map(n => n.id === id ? { ...n, text: editText.trim() } : n);
  setNotes(updated);
  localStorage.setItem(`notes_${country.name.common}`, JSON.stringify(updated));
  setEditingId(null);
  setEditText("");
}

// ==============================
// SHARE COUNTRY CARD
// ==============================
async function shareCard() {
  if (!shareCardRef.current) return;
  setShareLoading(true);
  try {
    const canvas = await html2canvas(shareCardRef.current, {
      scale: 2,
      useCORS: true,
      backgroundColor: null
    });
    const dataUrl = canvas.toDataURL("image/png");
    if (navigator.share && navigator.canShare) {
      canvas.toBlob(async (blob) => {
        const file = new File([blob], `${country.name.common}-card.png`, { type: "image/png" });
        try {
          await navigator.share({ title: country.name.common, files: [file] });
        } catch {
          downloadCardImage(dataUrl);
        }
      });
    } else {
      downloadCardImage(dataUrl);
    }
  } catch (err) {
    console.error("Share error:", err);
  }
  setShareLoading(false);
}

function downloadCardImage(dataUrl) {
  const a = document.createElement("a");
  a.href = dataUrl;
  a.download = `${country?.name?.common || "country"}-card.png`;
  a.click();
}









if(!country){


return(


<h1 className="loading">


Loading...


</h1>


)


}








if(country==="NOT_FOUND"){


return(

<h1>

Country not found

</h1>

)


}










let currencyCode =

Object.keys(country.currencies || {})[0];



let currency =

country.currencies?.[currencyCode];
return(

<div className="details-page">


<div className="details-layout">





{/* ================= LEFT MAIN CARD ================= */}


<div className="details-card">






<div className="details-left">



<img

className="detail-flag"

src={country.flags?.png}

alt={country.name.common}

/>





<div className="button-area">
  <a className="map-btn" href={country.maps.googleMaps} target="_blank" rel="noreferrer">
  View location
  </a>
  <button className="pdf-btn" onClick={downloadReport}>
    Download report
  </button>
  <button
    className="share-card-btn"
    onClick={shareCard}
    disabled={shareLoading}
    title="Download a shareable country card image"
  >
    {shareLoading ? "Generating…" : "Share Card"}
  </button>
</div>

{/* Hidden share card template — rendered off-screen, captured by html2canvas */}
<div ref={shareCardRef} className="share-card-template">
  <div className="sc-header">
    <img className="sc-flag" src={country.flags?.png} alt={country.name.common} crossOrigin="anonymous" />
    <div className="sc-titles">
      <p className="sc-label"> Country Explorer</p>
      <h2 className="sc-name">{country.name.common}</h2>
      <p className="sc-official">{country.name.official}</p>
    </div>
  </div>
  <div className="sc-divider"></div>
  <div className="sc-facts">
    <div className="sc-fact"><span className="sc-fact-icon"></span><div><p className="sc-fact-label">Capital</p><p className="sc-fact-value">{country.capital?.[0] || "N/A"}</p></div></div>
    <div className="sc-fact"><span className="sc-fact-icon"></span><div><p className="sc-fact-label">Region</p><p className="sc-fact-value">{country.region}</p></div></div>
    <div className="sc-fact"><span className="sc-fact-icon"></span><div><p className="sc-fact-label">Population</p><p className="sc-fact-value">{country.population.toLocaleString()}</p></div></div>
    <div className="sc-fact"><span className="sc-fact-icon"></span><div><p className="sc-fact-label">Languages</p><p className="sc-fact-value">{Object.values(country.languages || {}).join(", ") || "N/A"}</p></div></div>
    <div className="sc-fact"><span className="sc-fact-icon"></span><div><p className="sc-fact-label">Currency</p><p className="sc-fact-value">{currency ? `${currency.name} (${currencyCode})` : "N/A"}</p></div></div>
  </div>
  <div className="sc-footer">countryexplorer.app</div>
</div>

          {/* ================= CURRENCY ================= */}
          <div className="currency-box">
            <h3> Currency converter</h3>
            <select
              value={fromCurrency}
              onChange={(e)=>setFromCurrency(e.target.value)}
            >
              <option value="USD">USD</option>
              <option value="INR">INR</option>
              <option value="EUR">EUR</option>
              <option value="GBP">GBP</option>
              <option value="JPY">JPY</option>
              <option value="AUD">AUD</option>
              <option value="CAD">CAD</option>
            </select>
            <input
              type="number"
              placeholder={`Enter amount in ${fromCurrency}`}
              value={amount}
              onChange={(e)=>setAmount(e.target.value)}
            />
            <button onClick={convertCurrency}>
              Convert to {currencyCode}
            </button>
            <div className="currency-result">
              {converted ? (
                <>
                  <h2>{Number(converted).toFixed(2)} {currencyCode}</h2>
                  <p>{rate}</p>
                </>
              ) : (
                <p className="currency-placeholder">Enter an amount and click Convert.</p>
              )}
            </div>
          </div>

          {/* ================= WEATHER ================= */}
          <div className="weather-box">
            <h3> Weather</h3>
            {weather && weather.main ? (
              <>
                <h2>{weather.main.temp}°C</h2>
                <p>Condition <b>{weather.weather[0].main}</b></p>
                <p>Location <b>{country.capital[0]}</b></p>
              </>
            ) : (
              <p>Loading weather...</p>
            )}
          </div>

</div>









{/* RIGHT DETAILS */}


<div className="details-right">






<div className="title-row">


<h1>

{country.name.common}

</h1>



<button

className="detail-heart"

onClick={addBucket}

>


{

saved ? "♥" : "♡"

}


</button>



</div>








<div className="info-grid">



<div className="info-box">

<p>OFFICIAL NAME</p>

<h3>

{country.name.official}

</h3>

</div>






<div className="info-box">

<p>CAPITAL</p>

<h3>

{country.capital[0]}

</h3>

</div>







<div className="info-box">

<p>REGION</p>

<h3>

{country.region}

</h3>

</div>






<div className="info-box">

<p>POPULATION</p>

<h3>

{country.population.toLocaleString()}

</h3>

</div>







<div className="info-box">

<p>LANGUAGES</p>

<h3>


{

Object.values(country.languages || {})

.join(", ")

|| "N/A"

}


</h3>

</div>






<div className="info-box">

<p>CURRENCY</p>

<h3>


{

currency

?

`${currency.name} (${currencyCode})`

:

"N/A"

}


</h3>

</div>





</div>

<div className="map-box">
  <h3>🗺 Capital City Map</h3>
  <div id="country-map" className="map-container"></div>
</div>

{/* ================= TRAVEL NOTES ================= */}
<div className="travel-notes-box">
  <div className="tn-header">
    <h3>✈️ My Travel Notes</h3>
    <span className="tn-count">{notes.length} note{notes.length !== 1 ? "s" : ""}</span>
  </div>
  <div className="tn-input-row">
    <textarea
      className="tn-textarea"
      placeholder={`Jot down your thoughts, memories, or plans about ${country.name.common}…`}
      value={noteInput}
      onChange={e => setNoteInput(e.target.value)}
      rows={3}
      onKeyDown={e => { if (e.key === "Enter" && e.ctrlKey) saveNote(); }}
    />
    <button className="tn-save-btn" onClick={saveNote} disabled={!noteInput.trim()}>
      + Add Note
    </button>
  </div>
  {notes.length === 0 ? (
    <div className="tn-empty">
      <span>📓</span>
      <p>No notes yet. Start writing your travel story!</p>
    </div>
  ) : (
    <div className="tn-list">
      {notes.map(note => (
        <div key={note.id} className="tn-item">
          {editingId === note.id ? (
            <div className="tn-edit-row">
              <textarea
                className="tn-textarea tn-edit-textarea"
                value={editText}
                onChange={e => setEditText(e.target.value)}
                rows={2}
                autoFocus
              />
              <div className="tn-edit-actions">
                <button className="tn-save-btn tn-confirm-btn" onClick={() => saveEdit(note.id)}>Save</button>
                <button className="tn-cancel-btn" onClick={() => setEditingId(null)}>Cancel</button>
              </div>
            </div>
          ) : (
            <>
              <p className="tn-text">{note.text}</p>
              <div className="tn-meta-row">
                <span className="tn-date">📅 {note.date}</span>
                <div className="tn-actions">
                  <button className="tn-edit-btn" onClick={() => startEdit(note)} title="Edit note">✏️</button>
                  <button className="tn-delete-btn" onClick={() => deleteNote(note.id)} title="Delete note">🗑</button>
                </div>
              </div>
            </>
          )}
        </div>
      ))}
    </div>
  )}
</div>

</div>



</div>











{/* ================= RIGHT SIDE RECENT ================= */}





{/* RECENT */}
<div className="recent-section">



<h2>

Recently Viewed

</h2>






{

recent.length===0

?

<p>

No recent countries

</p>


:



recent.map(item=>(



<div 

className="recent-item"

key={item.name.common}

>




<img

src={item.flags?.png}

alt={item.name.common}

/>





<div>


<h4>

{item.name.common}

</h4>



<p>

{item.region}

</p>


</div>






<button

onClick={()=>deleteRecent(item.name.common)}

>

×


</button>





</div>



))


}




</div>





</div>


</div>


)


}



export default CountryDetails;