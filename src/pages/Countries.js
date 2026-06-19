import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";


function Countries(){


const [countries,setCountries]=useState([]);

const [search,setSearch]=useState("");

const [region,setRegion]=useState("All");

const [sort,setSort]=useState("");

const [currency,setCurrency]=useState("All");

const [language,setLanguage]=useState("All");






useEffect(()=>{


fetch(
"https://raw.githubusercontent.com/iamspruce/search-filter-painate-reactjs/main/data/countries.json"
)


.then(res=>res.json())


.then(data=>{


console.log("API DATA:",data);



let countryArray = Object.values(data);



let fixedData = countryArray.map(c=>({


name:{

common:c.name || "Unknown",

official:c.official_name || c.name || "Unknown"

},



capital:[

c.capital || "N/A"

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




currencies:

c.currencies

?

c.currencies

:

{},


languages:

Array.isArray(c.languages)

?

c.languages.reduce((obj,lang,index)=>{

obj[index]=lang;

return obj;

},{})

:

c.languages || {},


area:

c.area || 0,







borders:

c.borders || []


}));


console.log("COUNTRIES:",fixedData);



setCountries(fixedData);



})


.catch(error=>{

console.log(error);

});



},[]);









const currencyOptions=useMemo(()=>{



let set=new Set();



countries.forEach(country=>{


Object.keys(country.currencies || {})

.forEach(c=>set.add(c));


});



return [...set].sort();



},[countries]);












const languageOptions=useMemo(()=>{



let set=new Set();



countries.forEach(country=>{


Object.values(country.languages || {})

.forEach(l=>set.add(l));


});



return [...set].sort();



},[countries]);









let filteredCountries = countries.filter(country=>{



let name =

country.name.common.toLowerCase();



let official =

country.name.official.toLowerCase();



let capital =

country.capital[0].toLowerCase();




let code =

`${country.cca2} ${country.cca3}`

.toLowerCase();





return(


(

name.includes(search.toLowerCase())

||

official.includes(search.toLowerCase())

||

capital.includes(search.toLowerCase())

||

code.includes(search.toLowerCase())


)


&&


(region==="All" || country.region===region)



&&


(

currency==="All"

||

Object.keys(country.currencies)

.includes(currency)

)



&&


(
language==="All"

||

Object.values(country.languages || {})

.some(

l => l === language

)

));



});









if(sort==="az"){


filteredCountries.sort((a,b)=>

a.name.common.localeCompare(b.name.common)

);


}





if(sort==="za"){


filteredCountries.sort((a,b)=>

b.name.common.localeCompare(a.name.common)

);


}






if(sort==="high"){


filteredCountries.sort((a,b)=>

b.population-a.population

);


}






if(sort==="low"){


filteredCountries.sort((a,b)=>

a.population-b.population

);


}







let totalPopulation =

filteredCountries.reduce(

(sum,c)=>sum+c.population

,0);





let largestCountry = filteredCountries[0];
return(

<div className="countries-page">



<h1>

Explore Countries

</h1>




<p className="countries-lead">

Search by name, capital, official name or country code.
Filter by region, currency, language and UN membership.

</p>









<div className="filter-box advanced-filter-box">






<input

placeholder="Search by name, capital, official name or code"

value={search}

onChange={(e)=>setSearch(e.target.value)}

/>










<select

value={region}

onChange={(e)=>setRegion(e.target.value)}

>



<option value="All">

All Regions

</option>



<option>Africa</option>

<option>Americas</option>

<option>Asia</option>

<option>Europe</option>

<option>Oceania</option>


</select>









<select

value={currency}

onChange={(e)=>setCurrency(e.target.value)}

>



<option value="All">

All Currencies

</option>




{

currencyOptions.map(c=>(


<option key={c}>

{c}

</option>


))

}



</select>










<select

value={language}

onChange={(e)=>setLanguage(e.target.value)}

>



<option value="All">

All Languages

</option>




{

languageOptions.map(l=>(


<option key={l}>

{l}

</option>


))

}



</select>











<select

value={sort}

onChange={(e)=>setSort(e.target.value)}

>



<option value="">

Sort Countries

</option>



<option value="az">

A - Z

</option>



<option value="za">

Z - A

</option>



<option value="high">

Highest Population

</option>



<option value="low">

Lowest Population

</option>



</select>








</div>














<div className="results-strip">





<span>


<strong>

{filteredCountries.length}

</strong>


 countries found


</span>







<span>


<strong>

{totalPopulation.toLocaleString()}

</strong>


 combined population


</span>








<span>


<strong>


{largestCountry?.name?.common || "No country"}


</strong>


 first in current sort


</span>





</div>













<div className="country-container">



{


filteredCountries.map(country=>(



<Link


to={`/country/${country.cca3}`}


className="country-card"


key={country.cca3}


>










<div className="flag-box">



<img

src={country.flags.png}

alt={country.name.common}

/>



</div>











<div className="country-info">





<span className="region">


{country.region}


</span>








<h2>


{country.name.common}


</h2>









<div className="details">






<div>



<p>

Capital

</p>



<strong>


{country.capital[0]}


</strong>




</div>








<div>



<p>

Population

</p>



<strong>


{country.population.toLocaleString()}


</strong>




</div>





</div>











<div className="card-meta-row">





<span>



{

Object.keys(country.currencies)[0]

||

"No Currency"

}



</span>

</div>


<p className="explore-link">


Explore Details →


</p>


</div>




</Link>




))


}




</div>






</div>


);


}



export default Countries;