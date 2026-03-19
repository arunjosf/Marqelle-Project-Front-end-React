import { useEffect, useState, useContext } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import axios from "axios";
import { context } from "../App";
import { Bookmark, Search, ShoppingCart, Menu, X } from "lucide-react";
import toast from "react-hot-toast";

export default function Allproducts() {
  const { products, setProducts, user, wishlist, setWishlist,cart } = useContext(context);
  const [filledIcon, setFilledIcon] = useState({});
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const queryParams = new URLSearchParams(location.search);
  const category = queryParams.get("category");

  const PRODUCTS_URL = "https://localhost:7177/api/userproducts";
  const WISHLIST_URL = "https://localhost:7177/api/userwishlist";

  useEffect(() => {
    const url = category
      ? `${PRODUCTS_URL}/Search?category=${category}`
      : `${PRODUCTS_URL}/all`;

    axios
      .get(url)
      .then((res) => setProducts(res.data.data || []))
      .catch((err) => console.log(err));
  }, [category]);

 useEffect(() => {
    if (!user) return;
    axios
      .get(`${WISHLIST_URL}/Get`, {withCredentials: true})
      .then((res) => {
        const wishlistData = res.data.data || [];
        setWishlist(wishlistData);
        const hearts = {};
        wishlistData.forEach((item) => (hearts[item.productId] = true));
        setFilledIcon(hearts);
      })
      .catch((err) => console.log(err));
  }, [user]);

  const toggleIcon = async (prod) => {
    if (!user) {
      toast.error("Please login to add wishlist items.", {
        style: {
          borderRadius: "10px",
          background: "#fff",
          color: "#111",
          border: "1px solid #ddd",
          fontWeight: "normal",
        },
        iconTheme: {
          primary: "#111", 
          secondary: "#fff",
        },
      });
      return;
    }
    const isFilled = filledIcon[prod.id];

    try {
  if (isFilled) {
    await axios.delete(`${WISHLIST_URL}/Delete?productId=${prod.id}`, {
      withCredentials: true,
    });
    setWishlist((prev) => prev.filter((w) => w.productId !== prod.id));
  } else {
    const res = await axios.post(`${WISHLIST_URL}/add?productId=${prod.id}`, {}, {
      withCredentials: true,
    });
    setWishlist(res.data.data || []);
  }

  setFilledIcon((prev) => ({
    ...prev,
    [prod.id]: !isFilled,
  }));
} catch (err) {
  console.error("Wishlist toggle error:", err);
}
  }
console.log("products:", products, Array.isArray(products));

  return (
    <>
      <div className="flex items-center justify-between px-55 mt-9">
        <Link to={"/home"}><h2 id="logo-text" className="text-7xl font-semibold text-black">Marqelle.</h2></Link>
        <div className="flex items-center gap-3">
  
                <Link className= "text-sm font-semibold hover:text-gray-700" to={"/home"}>Home</Link>
        
          <button
            className="px-3 py-2 rounded-[15px] text-gray-900 text-sm flex items-center gap-1"
            onClick={() => navigate(user ? "/profile" : "/login")}>
            {user ? (
              <span className="text-sm font-semibold hover:text-gray-700">
                <Link to={"/profile"}>Profile</Link>
              </span>
            ) : (
              <span className="text-sm font-medium hover:text-gray-700">
                <Link to={"/login"}>Login</Link>
              </span>
            )}
          </button>

          <button className="px-2 py-2 rounded-[15px] text-gray-900 text-sm">
            <Link to={"/search"}>
              <Search size={17} />
            </Link>
          </button>

<button onClick={() => navigate("/wishlist")}
  className="flex items-center px-3 text-gray-900 text-sm gap-1">
  <Bookmark size={17} />
  <span className="text-xs">{wishlist.length}</span>
</button>

          <button className="px-3 text-gray-900 text-sm">
  <Link to="/cart" className="flex items-center gap-1">
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

      <hr className="border-t border-gray-900 w-267 mx-auto mt-7" />

      <div className="w-full flex justify-center mt-15 mb-30">
        <div className="grid grid-cols-4 gap-6">
          {products.map((prod) => (
            <div
              key={prod.id}
              className="text-center cursor-pointer"
              onClick={() => navigate(`/productdetails/${prod.id}`)}>
              <img
                src={prod.images && prod.images.length > 0 ? prod.images[0] : "/placeholder.png"}
                alt={prod.name}
                className="h-[350px] w-[250px] object-cover rounded-lg mx-auto"/>

              <div className="flex items-center justify-center gap-2 mt-2">
                <h1 className="font-light font-serif text-gray-900">
                  {prod.name}
                </h1>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleIcon(prod);
                  }}
                  className="hover:scale-110 transition">
                  <Bookmark
                    size={15}
                    className={`cursor-pointer transition ${filledIcon[prod.id] ? "fill-black" : "text-gray-500"}`}
                  />
                </button>
              </div>
              <h1 className="mt-1 text-gray-900 text-sm">₹{prod.price}</h1>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
