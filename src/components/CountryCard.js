import {Link} from "react-router-dom";


function CountryCard({country}){


return(


<Link

className="country-card"

to={`/country/${country.cca3}`}

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


<p>

Capital

<strong>

{country.capital?.[0] || "N/A"}

</strong>

</p>



<p>

Code

<strong>

{country.cca2}

</strong>

</p>


</div>



<div className="explore-link">

Explore Details →

</div>


</div>


</Link>


)


}


export default CountryCard;