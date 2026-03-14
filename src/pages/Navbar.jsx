

import { useState, useEffect } from "react";
import { NavLink, useNavigate, Link } from "react-router-dom";
import { Menu, X, ShoppingCart, Search, Bookmark } from "lucide-react";
import { useContext } from "react";
import { context } from "../App";

export default function Navbar() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState(null);
  const {wishlist, cart} = useContext(context)
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const loggedUser = JSON.parse(localStorage.getItem("user"));
    if (loggedUser) setUser(loggedUser);

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
 <nav className="pt-5 fixed w-full top-0 left-0 z-50 transition-all duration-300 bg-transparent">
  <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 rounded-2xl transition-all duration-300 ${isScrolled ? "backdrop-blur-lg bg-white/30 shadow-md" : ""}`}>
    <div className="flex justify-between items-center h-16">

          
          <div className="flex-shrink-0 font-bold text-3xl">
            <NavLink to="/">Marqelle. </NavLink>
          </div>

          <div className="hidden md:flex gap-8 text-gray-800 font-medium md:ml-15">
            <NavLink to="/home" className="hover:text-gray-600">Home</NavLink>
            <NavLink to="/about" className="hover:text-gray-600">About</NavLink>
            <NavLink to="/allproducts?category=Formal" className="hover:text-gray-600">Formal</NavLink>
            <NavLink to="/allproducts?category=Casual" className="hover:text-gray-600">Casual</NavLink>
          </div>

          <div className="flex items-center">
          <button
         className="px-3 py-2 rounded-[15px] text-gray-900 text-sm flex items-center gap-1"
         onClick={() => navigate(user ? "/profile" : "/login")}>
        {user ? (
       <span className="text-sm font-semibold">
       <Link>Profile</Link>
       </span>
       ) : (
       <span className="text-sm font-medium">
       <Link>Login</Link>
      </span>
      )}
     </button>

              <button
              className="px-3 py-2 rounded-[15px] text-gray-900 text-sm"
              onClick={() => navigate("/search")}>
              <Link><Search size={17} /></Link>
            </button>

             <button className="px-3 text-gray-900 text-sm">
  <Link to={"/wishlist"} className="flex items-center"><Bookmark size={17} />
  <span className="text-xs">{wishlist.length}</span></Link>
</button>

                    <button className="px-3 text-gray-800 text-sm">
  <Link to="/cart" className="flex items-center">
    <ShoppingCart size={17} />
    <span className="text-xs">{cart.length}</span>
  </Link>
</button>


            <div className="md:hidden flex items-center justify-center">
              <button onClick={() => setOpen(!open)}>
                {open ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {open && (
        <div className="md:hidden bg-gray-200 px-4 pb-4 space-y-3 text-gray-800 font-medium">
          <NavLink to="/home" className="block" onClick={() => setOpen(false)}>Home</NavLink>
          <NavLink to="/about" className="block" onClick={() => setOpen(false)}>About</NavLink>
          <NavLink to="/men" className="block" onClick={() => setOpen(false)}>Men</NavLink>
          <NavLink to="/vintage" className="block" onClick={() => setOpen(false)}>Vintage</NavLink>
        </div>
      )}
    </nav>
  );
}
