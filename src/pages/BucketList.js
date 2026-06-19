import { useEffect, useState, useRef } from "react";


function BucketList(){


const [bucket,setBucket] = useState([]);



useEffect(()=>{


let data =

JSON.parse(localStorage.getItem("favorites"))

||

[];


setBucket(data);



},[]);

const [markers, setMarkers] = useState([]);
const bucketMapRef = useRef(null);

useEffect(() => {
  if (bucket.length === 0) {
    setMarkers([]);
    return;
  }
  
  const promises = bucket.map(country => {
    const countryName = country.name?.common || country.name;
    const capitalText = Array.isArray(country.capital) ? country.capital[0] : country.capital;
    const query = capitalText && capitalText !== "No Capital" && capitalText !== "N/A"
      ? `${capitalText}, ${countryName}`
      : countryName;
      
    return fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1`)
      .then(res => res.json())
      .then(data => {
        if (data && data.length > 0) {
          return {
            name: countryName,
            capital: capitalText || "N/A",
            lat: parseFloat(data[0].lat),
            lon: parseFloat(data[0].lon),
            cca3: country.cca3 || country.alpha3Code || countryName
          };
        }
        return null;
      })
      .catch(err => {
        console.log(`Failed to geocode ${countryName}:`, err);
        return null;
      });
  });
  
  Promise.all(promises).then(results => {
    setMarkers(results.filter(r => r !== null));
  });
}, [bucket]);

useEffect(() => {
  if (!window.L) return;
  
  const mapContainer = document.getElementById("bucket-map");
  if (!mapContainer) return;
  
  if (bucketMapRef.current) {
    bucketMapRef.current.remove();
    bucketMapRef.current = null;
  }
  
  const L = window.L;
  const map = L.map("bucket-map").setView([20, 0], 2);
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  }).addTo(map);
  
  markers.forEach(marker => {
    L.marker([marker.lat, marker.lon])
      .addTo(map)
      .bindPopup(`
        <div style="font-family: 'DM Sans', sans-serif; min-width: 140px;">
          <h4 style="margin: 0 0 5px 0; color: #004D40; font-size: 14px;">${marker.name}</h4>
          <p style="margin: 0 0 8px 0; font-size: 11px; color: #666;">Capital: ${marker.capital}</p>
          <a href="/country/${marker.cca3}" style="display: inline-block; font-size: 11px; font-weight: bold; color: #C9A227; text-decoration: none;">Explore Details &rarr;</a>
        </div>
      `);
  });
  
  bucketMapRef.current = map;
  
  return () => {
    if (bucketMapRef.current) {
      bucketMapRef.current.remove();
      bucketMapRef.current = null;
    }
  };
}, [markers]);



function removeFromBucket(nameStr){


const updated =

bucket.filter(item=>(item.name?.common || item.name) !== nameStr);


setBucket(updated);


localStorage.setItem(

"favorites",

JSON.stringify(updated)

);


}




return(


<div className="bucket-page">


<h1>My Travel Bucket List</h1>

{bucket.length > 0 && (
  <div className="bucket-map-section">
    <div id="bucket-map" className="bucket-map-container"></div>
  </div>
)}

<div className="bucket-container">



{


bucket.length===0


?


<h2>No Countries Added</h2>


:


bucket.map((item,index)=>{
const countryName = item.name?.common || item.name;
const flagUrl = item.flags?.png || item.flag;
const capitalText = Array.isArray(item.capital) ? item.capital[0] : item.capital;
const currencyText = item.currency || (item.currencies && Object.keys(item.currencies)[0]) || "N/A";

return (

<div

className="bucket-card"

key={index}

>


<img

src={flagUrl}

alt={countryName}

/>




<div className="bucket-content">


<div className="bucket-title">

<h2>

{countryName}

</h2>


<button

className="bucket-heart"

onClick={()=>removeFromBucket(countryName)}

aria-label={`Remove ${countryName} from bucket list`}

title="Remove from bucket list"

>

♥

</button>

</div>



<p>

Capital : {capitalText}

</p>



<p>

Region : {item.region}

</p>



<p>

Population : {Number(item.population).toLocaleString()}

</p>



<p>

Currency : {currencyText}

</p>




</div>



</div>

);
})


}



</div>


</div>


)


}


export default BucketList;
