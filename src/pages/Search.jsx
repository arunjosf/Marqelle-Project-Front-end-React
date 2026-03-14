
import { useEffect, useState, useContext, useRef } from "react";
import axios from "axios";
import { context } from "../App";
import { Link } from "react-router-dom";
import { Bookmark, ChevronDown } from "lucide-react";

export default function Search() {
  const { products, setProducts } = useContext(context);
  const [searchTerm, setSearchTerm] = useState("");
  const [filledHearts, setFilledHearts] = useState({});
  const [filter, setFilter] = useState("all");
  const [colorFilter, setColorFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const inputRef = useRef();

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    if (products.length === 0) {
      axios
        .get("http://localhost:5000/products")
        .then((res) => setProducts(res.data))
        .catch((err) => console.log(err));
    }
  }, []);

  const toggleHeart = (prod) => {
    setFilledHearts((prev) => ({
      ...prev,
      [prod.id]: !prev[prod.id],
    }));
  };

  const filteredProducts = products
    .filter((item) => {
      const search = searchTerm.toLowerCase();
      return (
        item.name.toLowerCase().includes(search) ||
        item.category.toLowerCase().includes(search) ||
        item.color?.toLowerCase().includes(search) ||
        item.price.toString().includes(search)
      );
    })
    .filter((item) => {
      if (colorFilter !== "all" && item.color?.toLowerCase() !== colorFilter.toLowerCase()) return false;
      if (categoryFilter !== "all" && item.category.toLowerCase() !== categoryFilter.toLowerCase()) return false;
      return true;
    });

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (filter === "low-high") return a.price - b.price;
    if (filter === "high-low") return b.price - a.price;
    return 0;
  });

  const uniqueColors = [...new Set(products.map((p) => p.color?.toLowerCase()).filter(Boolean))];
  const uniqueCategories = [...new Set(products.map((p) => p.category?.toLowerCase()).filter(Boolean))];

  return (
    <>
   
      <Link to={"/home"}><h2 className="text-4xl md:text-5xl font-semibold text-black text-left md:ml-56 mt-8 ml-9">
        Marqelle.
      </h2></Link>
      <hr className="border-t border-gray-900 w-[81%] mx-5 md:w-[70%] mx-auto mt-5 md:mt-7" />
      <div className="max-w-5xl mx-auto mt-20 mb-12 flex flex-col md:flex-row items-center justify-center gap-3 md:gap-4 px-4">
        <div className="relative w-full md:w-[45%]">
          <input
            ref={inputRef}
            type="text"
            placeholder="Search for blazers, color, rate..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full border border-gray-400 rounded-full px-5 py-2 focus:outline-none focus:ring-1 focus:ring-black"
          />
         
        </div>
        <div className="flex flex-wrap md:flex-nowrap justify-center gap-3 w-full md:w-auto">
          <div className="relative">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="appearance-none border border-gray-400 rounded-2xl px-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-black bg-white text-gray-800 shadow-sm cursor-pointer 
                         [&>option:checked]:bg-black [&>option:checked]:text-white md:w-40 transition">
              <option value="all">Sort</option>
              <option value="low-high">Price: Low → High</option>
              <option value="high-low">Price: High → Low</option>
            </select>
            <ChevronDown
              size={16}
              className="absolute right-3 top-3 pointer-events-none text-gray-800"
            />
          </div>

          <div className="relative">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="appearance-none border border-gray-400 rounded-2xl px-7 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-black bg-white text-gray-800 shadow-sm cursor-pointer 
                         [&>option:checked]:bg-black [&>option:checked]:text-white hover:bg-white hover:text-black transition md:w-35">
              <option value="all">Category</option>
              {uniqueCategories.map((cat, i) => (
                <option key={i} value={cat}>
                  {cat.charAt(0).toUpperCase() + cat.slice(1)}
                </option>
              ))}
            </select>
            <ChevronDown
              size={16}
              className="absolute right-3 top-3 pointer-events-none text-gray-800"
            />
          </div>

          <div className="relative">
            <select
              value={colorFilter}
              onChange={(e) => setColorFilter(e.target.value)}
              className="appearance-none border border-gray-400 rounded-2xl px-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-black bg-white text-gray-800 shadow-sm cursor-pointer 
                         [&>option:checked]:bg-black [&>option:checked]:text-white hover:bg-black hover:text-white transition">
              <option value="all">Color</option>
              {uniqueColors.map((col, i) => (
                <option key={i} value={col}>
                  {col.charAt(0).toUpperCase() + col.slice(1)}
                </option>
              ))}
            </select>
            <ChevronDown
              size={16}
              className="absolute right-3 top-3 pointer-events-none text-gray-800"
            />
          </div>
        </div>
      </div>

      <div className="w-full flex justify-center mt-15 md:mt-20 mb-30 px-4 md:px-0">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {sortedProducts.map((prod) => (
            <div key={prod.id} className="text-center">
              <Link to={`/productdetails/${prod.id}`}>
                <img
                  src={prod.image[0]}
                  alt={prod.name}
                  className="h-[350px] w-[250px] object-cover rounded-lg mx-auto"
                />
              </Link>

              <div className="flex items-center justify-center gap-2 mt-2">
                <h1 className="font-light font-serif text-gray-900">{prod.name}</h1>
                <button onClick={() => toggleHeart(prod)} className="hover:scale-110 transition">
                  <Bookmark
                    size={15}
                    className={`cursor-pointer transition ${
                      filledHearts[prod.id] ? "fill-black" : "text-gray-500"
                    }`}
                  />
                </button>
              </div>
              <h1 className="mt-1 text-gray-900 text-sm">₹{prod.price}</h1>
            </div>
          ))}
        </div>
      </div>
      {sortedProducts.length === 0 && (
        <p className="text-center text-gray-500 mt-10">No products found.</p>
      )}
    </>
  );
}
