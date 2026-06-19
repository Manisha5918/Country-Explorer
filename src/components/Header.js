import { NavLink } from "react-router-dom";


function Header({ dark, setDark }) {


return(

<header className="header">


<div className="logo">

Country Explorer

</div>




<nav>

<NavLink to="/">

Home

</NavLink>




<NavLink to="/countries">

Countries

</NavLink>




<NavLink to="/bucket">
Bucket List

</NavLink>




<NavLink to="/compare">

Compare

</NavLink>




<NavLink to="/planner">

Route Planner

</NavLink>




<NavLink to="/dashboard">

Dashboard

</NavLink>




<NavLink to="/quiz">

Quiz

</NavLink>


<NavLink to="/about">

About

</NavLink>






<button

className="theme-btn"

onClick={()=>setDark(!dark)}

>


{

dark ? "☀️" : "🌙"

}


</button>




</nav>



</header>


)


}



export default Header;