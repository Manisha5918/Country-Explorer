import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useState, useEffect } from "react";


import Header from "./components/Header";
import Footer from "./components/Footer";


import Home from "./pages/Home";
import Countries from "./pages/Countries";
import CountryDetails from "./pages/CountryDetails";
import Compare from "./pages/Compare";
import Dashboard from "./pages/Dashboard";
import About from "./pages/About";


// BUCKET LIST PAGE
import BucketList from "./pages/BucketList";

// QUIZ PAGE
import Quiz from "./pages/Quiz";

// TRAVEL ROUTE PLANNER PAGE
import RoutePlanner from "./pages/RoutePlanner";


import "./App.css";



function App(){


const [dark,setDark]=useState(
  localStorage.getItem("theme") === "dark"
);




useEffect(()=>{
  if (dark) {
    document.documentElement.classList.add("dark");
    document.body.classList.add("dark");
  } else {
    document.documentElement.classList.remove("dark");
    document.body.classList.remove("dark");
  }
  localStorage.setItem("theme", dark ? "dark":"light");
},[dark]);






return(


<div className={dark ? "dark" : ""}>


<BrowserRouter>


<Header

dark={dark}

setDark={setDark}

/>





<Routes>



<Route

path="/"

element={<Home />}

/>





<Route

path="/countries"

element={<Countries />}

/>





<Route

path="/country/:name"

element={<CountryDetails />}

/>






<Route

path="/compare"

element={<Compare />}

/>






<Route

path="/dashboard"

element={<Dashboard />}

/>





{/* BUCKET LIST ROUTE */}

<Route

path="/bucket"

element={<BucketList />}

/>

<Route

path="/quiz"

element={<Quiz />}

/>






<Route

path="/about"

element={<About />}

/>

<Route

path="/planner"

element={<RoutePlanner />}

/>




</Routes>






<Footer />



</BrowserRouter>


</div>


);


}



export default App;