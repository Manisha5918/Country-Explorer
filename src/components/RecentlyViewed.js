function RecentlyViewed(){


const countries = JSON.parse(
localStorage.getItem("recentCountries")
) || [];



return(

<div className="recent-section">


<h2>🌍 Recently Viewed</h2>


<div className="recent-list">


{
countries.map((item,index)=>(

<div 
className="recent-item"
key={index}
>

<img 
src={item.flag}
alt=""
/>

<span>{item.name}</span>


</div>

))

}


</div>


</div>

)

}


export default RecentlyViewed;