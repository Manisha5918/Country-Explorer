import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";


function Compare() {
const apiKey = process.env.REACT_APP_WEATHER_API_KEY;

    const [searchParams] = useSearchParams();
    const [countries, setCountries] = useState([]);

    const [first, setFirst] = useState(searchParams.get("first") || "");

    const [second, setSecond] = useState(searchParams.get("second") || "");


    const [weather1, setWeather1] = useState(null);

    const [weather2, setWeather2] = useState(null);
    useEffect(() => {


        fetch(
            "https://raw.githubusercontent.com/iamspruce/search-filter-painate-reactjs/main/data/countries.json"
        )


            .then(res => res.json())


            .then(data => {


                let fixedData = Object.values(data).map(c => ({


                    name: {

                        common: c.name || "Unknown"

                    },


                    capital: [

                        c.capital || "N/A"

                    ],


                    region:

                        c.region || "World",



                    population:

                        c.population || 0,



                    flags: {


                        png:

                            c.alpha2Code

                                ?

                                (c.alpha2Code.toLowerCase() === "ee" ? "https://raw.githubusercontent.com/hampusborgos/country-flags/main/png250px/ee.png" : `https://flagcdn.com/w320/${c.alpha2Code.toLowerCase()}.png`)

                                :

                                ""

                    },



                    cca2: c.alpha2Code,


                    cca3: c.alpha3Code,


                    currencies: c.currencies || {},


                    languages: c.languages || {}


                }));



                fixedData.sort(

                    (a, b) => a.name.common.localeCompare(b.name.common)

                );



                setCountries(fixedData);



            })


            .catch(err => console.log(err));


    }, []);

    let c1 = countries.find(

        c => c.name.common === first

    );


    let c2 = countries.find(

        c => c.name.common === second

    );

    useEffect(() => {


        if (c1) {


            fetch(
`https://api.openweathermap.org/data/2.5/weather?q=${c1}&appid=${apiKey}`
)

                .then(res => res.json())

                .then(data => setWeather1(data));


        }



        if (c2) {

fetch(
`https://api.openweathermap.org/data/2.5/weather?q=${c2}&appid=${apiKey}`
)

                .then(res => res.json())

                .then(data => setWeather2(data));


        }


    }, [first, second]);

    return (


        <div className="compare-page">


            <h1>Compare Countries</h1>


            <div className="compare-select">


                <select

                    value={first}

                    onChange={(e) => setFirst(e.target.value)}

                >


                    <option value="">Select Country 1</option>


                    {


                        countries.map(c => (


                            <option

                                key={c.cca3}

                                value={c.name.common}

                            >

                                {c.name.common}

                            </option>


                        ))


                    }


                </select>






                <select

                    value={second}

                    onChange={(e) => setSecond(e.target.value)}

                >


                    <option value="">Select Country 2</option>


                    {


                        countries.map(c => (


                            <option

                                key={c.cca2}

                                value={c.name.common}

                            >

                                {c.name.common}

                            </option>


                        ))


                    }


                </select>


            </div>


            {


                c1 && c2 &&


                <div className="compare-box">


                    <div className="compare-card">


                        <img src={c1.flags.png} />


                        <h2>{c1.name.common}</h2>



                        <span>Population</span>

                        <b>{c1.population.toLocaleString()}</b>



                        <span>Capital</span>

                        <b>{c1.capital[0]}</b>



                        <span>Region</span>

                        <b>{c1.region}</b>




                        <span>Currency</span>

                        <b>

                            {
                                Object.values(c1.currencies || {})[0]?.name
                                ||
                                "N/A"

                            }

                        </b>



                        <span>Language</span>

                        <b>

                            {

                                Object.values(c1.languages || {})
                                    .join(", ")

                            }

                        </b>



                        <span>Weather</span>


                        <b>


                            {

                                weather1?.main

                                    ?

                                    `${weather1.main.temp}°C ${weather1.weather[0].main}`

                                    :

                                    "Loading..."

                            }


                        </b>



                    </div>


                    <div className="vs">

                        VS

                    </div>




                    <div className="compare-card">


                        <img src={c2.flags.png} />


                        <h2>{c2.name.common}</h2>



                        <span>Population</span>

                        <b>{c2.population.toLocaleString()}</b>




                        <span>Capital</span>

                        <b>{c2.capital[0]}</b>



                        <span>Region</span>

                        <b>{c2.region}</b>



                        <span>Currency</span>

                        <b>

                            {

                                Object.values(c2.currencies || {})[0]?.name

                                ||

                                "N/A"

                            }

                        </b>



                        <span>Language</span>


                        <b>

                            {

                                Object.values(c2.languages || {})
                                    .join(", ")

                            }

                        </b>
                        <span>Weather</span>

                        <b>

                            {

                                weather2?.main

                                    ?

                                    `${weather2.main.temp}°C ${weather2.weather[0].main}`

                                    :

                                    "Loading..."

                            }

                        </b>



                    </div>


                </div>


            }



        </div>


    )


}


export default Compare;