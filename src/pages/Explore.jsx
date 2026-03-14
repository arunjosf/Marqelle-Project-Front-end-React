import { Link } from "react-router-dom"
import { useState, useEffect } from "react"
import axios from "axios";

export default function Explore(){
    const [explore, setExplore] = useState([])

     useEffect(() => {
    axios.get("http://localhost:5000/products")
      .then(res => setExplore(res.data.slice(0,4)))
      .catch(err => console.log(err));
  }, []);

return(
    <>
     <Link to={"/home"}><h2 className="text-8xl font-semibold text-black ml-55 mt-8">Marqelle.</h2></Link>
        <hr className="border-t border-gray-900  w-267 mx-auto mt-7"/>

        <h2 className="font-medium ml-56 text-xl mt-20">New Arrivals</h2>
        <div className="mb-30">
    {explore.map((v) => (
        <Link key={v.id} to={`/productdetails/${v.id}`}>
            <div className="mx-55">
                <img 
                src={v.image[5]}
                className="mx-auto mt-5 rounded h-400"
                />

            </div>
        </Link>
    ))}
  </div>
    </>
)
}