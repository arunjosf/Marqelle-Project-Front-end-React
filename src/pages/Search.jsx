import { useEffect, useState, useContext, useRef } from "react";
import axios from "axios";
import { context } from "../App";
import { Link } from "react-router-dom";
import { Bookmark } from "lucide-react";
import toast from "react-hot-toast";

const BASE = "https://localhost:7177/api/userproducts";
const WISHLIST_URL = "https://localhost:7177/api/userwishlist";
const TOAST_STYLE = {
  style: { borderRadius: "10px", background: "#fff", color: "#111", border: "1px solid #ddd", fontWeight: "normal" },
};

export default function Search() {
  const { products, setProducts, user, wishlist, setWishlist } = useContext(context);
  const [searchTerm, setSearchTerm] = useState("");
  const [filledHearts, setFilledHearts] = useState({});
  const [filter, setFilter] = useState("all");
  const inputRef = useRef();

  useEffect(() => { inputRef.current?.focus(); }, []);

  useEffect(() => {
    if (products.length === 0) {
      axios.get(`${BASE}/all`)
        .then((res) => setProducts(res.data.data || []))
        .catch((err) => console.log(err));
    }
  }, []);

  useEffect(() => {
    if (!user) return;
    axios.get(`${WISHLIST_URL}/Get`, { withCredentials: true })
      .then((res) => {
        const items = res.data.data || [];
        setWishlist(items);
        const hearts = {};
        items.forEach((item) => { hearts[item.productId] = true; });
        setFilledHearts(hearts);
      })
      .catch((err) => console.log(err));
  }, [user]);

  useEffect(() => {
    const params = new URLSearchParams();
    if (searchTerm.trim()) params.append("name", searchTerm.trim());
    if (filter === "low-high") params.append("priceSort", "PriceAsc");
    if (filter === "high-low") params.append("priceSort", "PriceDesc");
    axios.get(`${BASE}/Search?${params}`)
      .then((res) => setProducts(res.data.data || []))
      .catch((err) => console.log(err));
  }, [searchTerm, filter]);

  async function toggleHeart(prod) {
    if (!user) {
      toast.error("Please login to add to wishlist", TOAST_STYLE);
      return;
    }
    const isWishlisted = !!filledHearts[prod.id];
    setFilledHearts((prev) => ({ ...prev, [prod.id]: !isWishlisted }));
    try {
      if (isWishlisted) {
        await axios.delete(`${WISHLIST_URL}/Delete?productId=${prod.id}`, { withCredentials: true });
        setWishlist((prev) => prev.filter((w) => w.productId !== prod.id));
        toast.success("Removed from wishlist", { ...TOAST_STYLE, iconTheme: { primary: "#111", secondary: "#fff" } });
      } else {
        await axios.post(`${WISHLIST_URL}/add?productId=${prod.id}`, {}, { withCredentials: true });
        setWishlist((prev) => [...prev, { productId: prod.id }]);
        toast.success("Added to wishlist", { ...TOAST_STYLE, iconTheme: { primary: "#111", secondary: "#fff" } });
      }
    } catch {
      setFilledHearts((prev) => ({ ...prev, [prod.id]: isWishlisted }));
      toast.error("Something went wrong", TOAST_STYLE);
    }
  }

  return (
    <>
      {/* Nav links — left side, one per line */}
      <div className="fixed left-10 mt-14 -translate-y-1/2 flex flex-col gap-5 text-sm tracking-widest text-gray-700 z-20">
        <Link to="/home" className="hover:text-black transition">Home</Link>
        <Link to="/cart" className="hover:text-black transition">Cart</Link>
        <Link to="/profile" className="hover:text-black transition">Profile</Link>
      </div>

      {/* Search input */}
      <div className="max-w-2xl mx-auto mt-40 mb-12 px-4 flex flex-col items-center gap-6">
        <div className="w-full text-center">
          <p className="text-xs tracking-[0.3em] text-gray-400 uppercase mb-3">What are you looking for?</p>
          <input
            ref={inputRef}
            type="text"
            placeholder=""
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-120 border-b border-gray-300 bg-transparent text-center text-sm text-gray-700 tracking-wide py-2 focus:outline-none transition-colors placeholder-transparent"
          />
        </div>

        {/* Price sort */}
        <div className="flex gap-4 text-xs text-gray-400 uppercase tracking-widest">
          <button onClick={() => setFilter("all")} className={`transition ${filter === "all" ? "text-black font-medium" : "hover:text-black"}`}>All</button>
          <span className="text-gray-200">|</span>
          <button onClick={() => setFilter("low-high")} className={`transition ${filter === "low-high" ? "text-black font-medium" : "hover:text-black"}`}>Price ↑</button>
          <span className="text-gray-200">|</span>
          <button onClick={() => setFilter("high-low")} className={`transition ${filter === "high-low" ? "text-black font-medium" : "hover:text-black"}`}>Price ↓</button>
        </div>
      </div>

      {/* Product grid */}
      <div className="w-full flex justify-center mt-15 md:mt-20 mb-30 px-4 md:px-0">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {products.map((prod) => (
            <div key={prod.id} className="text-center">
              <Link to={`/productdetails/${prod.id}`}>
                <img src={prod.images?.[0]} alt={prod.name} className="h-[350px] w-[250px] object-cover rounded-lg mx-auto" />
              </Link>
              <div className="flex items-center justify-center gap-2 mt-2">
                <h1 className="font-light font-serif text-gray-900">{prod.name}</h1>
                <button onClick={() => toggleHeart(prod)} className="hover:scale-110 transition">
                  <Bookmark size={15} className={`cursor-pointer transition ${filledHearts[prod.id] ? "fill-black" : "text-gray-500"}`} />
                </button>
              </div>
              <h1 className="mt-1 text-gray-900 text-sm">₹{prod.price}</h1>
            </div>
          ))}
        </div>
      </div>

      {products.length === 0 && <p className="text-center text-gray-500 mt-10">No products found.</p>}
    </>
  );
}