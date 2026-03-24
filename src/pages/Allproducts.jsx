import { useEffect, useState, useContext } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import axios from "axios";
import { context } from "../App";
import { Bookmark, Search, ShoppingCart, Menu, X, SlidersHorizontal } from "lucide-react";
import toast from "react-hot-toast";

const PRODUCTS_URL = "https://localhost:7177/api/userproducts";
const WISHLIST_URL = "https://localhost:7177/api/userwishlist";

const TOAST_STYLE = {
  style: { borderRadius: "10px", background: "#fff", color: "#111", border: "1px solid #ddd", fontWeight: "normal" },
  iconTheme: { primary: "#111", secondary: "#fff" },
};

export default function Allproducts() {
  const { products, setProducts, user, wishlist, setWishlist, cart } = useContext(context);
  const [filledIcon, setFilledIcon] = useState({});
  const [open, setOpen] = useState(false);
  const [showFilter, setShowFilter] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const queryParams = new URLSearchParams(location.search);
  const category = queryParams.get("category");

  const [allCategories, setAllCategories] = useState([]);
  const [allColors, setAllColors] = useState([]);

  const [selectedSizes, setSelectedSizes] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState(category ? [category] : []);
  const [selectedColors, setSelectedColors] = useState([]);
  const [priceMin, setPriceMin] = useState(0);
  const [priceMax, setPriceMax] = useState(100000);
  const [priceSort, setPriceSort] = useState(""); 

  useEffect(() => {
    axios.get(`${PRODUCTS_URL}/all`)
      .then((res) => {
        const data = res.data.data || [];
        setAllCategories([...new Set(data.map((p) => p.categoryName).filter(Boolean))]);
        setAllColors([...new Set(data.map((p) => p.color).filter(Boolean))]);
      })
      .catch((err) => console.log(err));
  }, []);

  const fetchWithFilters = (overrides = {}) => {
    const sizes = overrides.sizes ?? selectedSizes;
    const categories = overrides.categories ?? selectedCategories;
    const colors = overrides.colors ?? selectedColors;
    const min = overrides.priceMin ?? priceMin;
    const max = overrides.priceMax ?? priceMax;
    const sort = overrides.priceSort ?? priceSort;

    const params = new URLSearchParams();
    if (categories.length === 1) params.append("category", categories[0]);
    if (colors.length === 1) params.append("color", colors[0]);
    if (max && max < 100000) params.append("price", max);
    if (sort) params.append("priceSort", sort);

    const url = params.toString()
      ? `${PRODUCTS_URL}/Search?${params}`
      : `${PRODUCTS_URL}/all`;

    axios.get(url)
      .then((res) => {
        let data = res.data.data || [];
        if (sizes.length > 0) data = data.filter((p) => sizes.some((s) => p.sizes?.includes(s)));
        if (colors.length > 1) data = data.filter((p) => colors.includes(p.color));
        if (categories.length > 1) data = data.filter((p) => categories.includes(p.categoryName));
        if (min > 0) data = data.filter((p) => p.price >= min);
        if (max < 100000) data = data.filter((p) => p.price <= max);
        setProducts(data);
      })
      .catch((err) => console.log(err));
  };

  useEffect(() => {
    const url = category ? `${PRODUCTS_URL}/Search?category=${category}` : `${PRODUCTS_URL}/all`;
    axios.get(url)
      .then((res) => setProducts(res.data.data || []))
      .catch((err) => console.log(err));
  }, [category]);

  useEffect(() => {
    if (!user) return;
    axios.get(`${WISHLIST_URL}/Get`, { withCredentials: true })
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
    if (!user) { toast.error("Please login to add wishlist items.", TOAST_STYLE); return; }
    const isFilled = filledIcon[prod.id];
    try {
      if (isFilled) {
        await axios.delete(`${WISHLIST_URL}/Delete?productId=${prod.id}`, { withCredentials: true });
        setWishlist((prev) => prev.filter((w) => w.productId !== prod.id));
      } else {
        const res = await axios.post(`${WISHLIST_URL}/add?productId=${prod.id}`, {}, { withCredentials: true });
        setWishlist(res.data.data || []);
      }
      setFilledIcon((prev) => ({ ...prev, [prod.id]: !isFilled }));
    } catch (err) { console.error("Wishlist toggle error:", err); }
  };

  const toggleSize = (s) => setSelectedSizes((prev) => prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]);
  const toggleCategory = (c) => setSelectedCategories((prev) => prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]);
  const toggleColor = (c) => setSelectedColors((prev) => prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]);

  const handleApply = () => { fetchWithFilters(); setShowFilter(false); };

  const handleReset = () => {
    setSelectedSizes([]); setSelectedCategories([]); setSelectedColors([]);
    setPriceMin(0); setPriceMax(100000); setPriceSort("");
    fetchWithFilters({ sizes: [], categories: [], colors: [], priceMin: 0, priceMax: 100000, priceSort: "" });
    setShowFilter(false);
  };

  const activeFilterCount = selectedSizes.length + selectedCategories.length + selectedColors.length + (priceMin > 0 || priceMax < 100000 ? 1 : 0) + (priceSort ? 1 : 0);

  const SIZES = ["S", "M", "L", "XL"];

  const colorMap = {
    black: "#111", white: "#f5f5f5", red: "#ef4444", blue: "#3b82f6",
    green: "#22c55e", yellow: "#eab308", pink: "#ec4899", gray: "#9ca3af",
    brown: "#a16207", navy: "#1e3a8a", beige: "#d4b896", orange: "#f97316",
  };

  return (
    <>
      <div className="flex items-center justify-between px-55 mt-9">
        <Link to={"/home"}><h2 id="logo-text" className="text-7xl font-semibold text-black">Marqelle.</h2></Link>
        <div className="flex items-center gap-3">
          <Link className="text-sm font-semibold hover:text-gray-700" to={"/home"}>Home</Link>
          <button className="px-3 py-2 rounded-[15px] text-gray-900 text-sm flex items-center gap-1"
            onClick={() => navigate(user ? "/profile" : "/login")}>
            {user ? (
              <span className="text-sm font-semibold hover:text-gray-700"><Link to={"/profile"}>Profile</Link></span>
            ) : (
              <span className="text-sm font-medium hover:text-gray-700"><Link to={"/login"}>Login</Link></span>
            )}
          </button>
          <button className="px-2 py-2 rounded-[15px] text-gray-900 text-sm">
            <Link to={"/search"}><Search size={17} /></Link>
          </button>
          <button onClick={() => navigate("/wishlist")} className="flex items-center px-3 text-gray-900 text-sm gap-1">
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
            <button onClick={() => setOpen(!open)}>{open ? <X size={24} /> : <Menu size={24} />}</button>
          </div>
        </div>
      </div>

      <hr className="border-t border-gray-900 w-267 mx-auto mt-7" />

      <div className="flex justify-end w-267 mx-auto mt-6 mb-2">
        <button onClick={() => setShowFilter(true)}
          className="flex items-center gap-2 text-sm text-gray-700 border border-gray-300 px-4 py-1.5 rounded-full hover:border-black transition-colors">
          <SlidersHorizontal size={14} />
          Filters
          {activeFilterCount > 0 && (
            <span className="bg-black text-white text-xs px-1.5 py-0.5 rounded-full">{activeFilterCount}</span>
          )}
        </button>
      </div>

      <div className="w-full flex justify-center mt-10 mb-30">
        <div className="grid grid-cols-4 gap-6">
          {products.map((prod) => (
            <div key={prod.id} className="text-center cursor-pointer"
              onClick={() => navigate(`/productdetails/${prod.id}`)}>
              <img
                src={prod.images && prod.images.length > 0 ? prod.images[0] : "/placeholder.png"}
                alt={prod.name}
                className="h-[350px] w-[250px] object-cover rounded-lg mx-auto" />
              <div className="flex items-center justify-center gap-2 mt-2">
                <h1 className="font-light font-serif text-gray-900">{prod.name}</h1>
                <button onClick={(e) => { e.stopPropagation(); toggleIcon(prod); }} className="hover:scale-110 transition">
                  <Bookmark size={15} className={`cursor-pointer transition ${filledIcon[prod.id] ? "fill-black" : "text-gray-500"}`} />
                </button>
              </div>
              <h1 className="mt-1 text-gray-900 text-sm">₹{prod.price}</h1>
            </div>
          ))}
          {products.length === 0 && (
            <p className="col-span-4 text-center text-gray-400 py-20">No products found.</p>
          )}
        </div>
      </div>

      {showFilter && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="flex-1 bg-black/30" onClick={() => setShowFilter(false)} />

          <div className="w-80 bg-white h-full overflow-y-auto shadow-2xl flex flex-col">
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
              <h2 className="text-base font-semibold text-gray-900">Filters</h2>
              <button onClick={() => setShowFilter(false)} className="text-gray-400 hover:text-black transition">
                <X size={18} />
              </button>
            </div>

            <div className="flex-1 px-6 py-5 flex flex-col gap-10">

              <div>
                <p className="text-xs font-light text-black uppercase tracking-widest mb-3">Size</p>
                <div className="flex gap-2 flex-wrap">
                  {SIZES.map((s) => (
                    <button key={s} onClick={() => toggleSize(s)}
                      className={`px-1 py-1 border rounded-md text-sm w-11 transition-all
                        ${selectedSizes.includes(s)
                          ? "bg-gray-900 text-white border-gray-900"
                          : "border-gray-300 text-gray-700 hover:border-gray-600"}`}>
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-xs font-light text-black uppercase tracking-widest mb-3">Category</p>
                <div className="flex flex-col gap-2">
                  {allCategories.map((c) => (
                    <label key={c} className="flex items-center gap-2 cursor-pointer group">
                      <div onClick={() => toggleCategory(c)}
                        className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-colors flex-shrink-0
                          ${selectedCategories.includes(c) ? "bg-black border-black" : "border-gray-300 group-hover:border-gray-500"}`}>
                        {selectedCategories.includes(c) && (
                          <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </div>
                      <span onClick={() => toggleCategory(c)} className="text-sm text-gray-700 capitalize">{c}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-xs font-light text-black uppercase tracking-widest mb-3">ColoUr</p>
                <div className="flex flex-wrap gap-2">
                  {allColors.map((c) => (
                    <button key={c} onClick={() => toggleColor(c)} title={c}
                      className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-medium transition-all
                        ${selectedColors.includes(c)
                          ? "border-1.5 border-black bg-gray-100 text-black"
                          : "border-gray-200 hover:border-gray-400"}`}>
                      <span className="w-3 h-3 rounded-full border border-gray-200 flex-shrink-0"
                        style={{ backgroundColor: colorMap[c?.toLowerCase()] || "#ccc" }} />
                      <span className="capitalize text-gray-700">{c}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-xs font-light text-black uppercase tracking-widest mb-4">Price Range</p>
                <div className="relative h-5 flex items-center mb-3">
                  <div className="absolute w-full h-0.5 bg-gray-200 rounded" />
                  <div className="absolute h-0.5 bg-black rounded"
                    style={{
                      left: `${(priceMin / 100000) * 100}%`,
                      right: `${100 - (priceMax / 100000) * 100}%`
                    }} />
                  <input type="range" min="0" max="100000" step="500"
                    value={priceMin}
                    onChange={(e) => { const v = Number(e.target.value); if (v < priceMax) setPriceMin(v); }}
                    className="absolute w-full appearance-none bg-transparent pointer-events-none
                      [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none
                      [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4
                      [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-black
                      [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white
                      [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:cursor-pointer" />
                  <input type="range" min="0" max="100000" step="500"
                    value={priceMax}
                    onChange={(e) => { const v = Number(e.target.value); if (v > priceMin) setPriceMax(v); }}
                    className="absolute w-full appearance-none bg-transparent pointer-events-none
                      [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none
                      [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4
                      [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-black
                      [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white
                      [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:cursor-pointer" />
                </div>
                <div className="flex justify-between text-xs font-medium text-gray-700 mt-1">
                  <span>₹ {priceMin.toLocaleString("en-IN")}.00</span>
                  <span>₹ {priceMax.toLocaleString("en-IN")}.00</span>
                </div>
              </div>

              <div>
                <p className="text-xs font-light text-black uppercase tracking-widest mb-3">Sort by Price</p>
                <div className="flex gap-2">
                  {[
                    { label: "Low → High", value: "PriceAsc" },
                    { label: "High → Low", value: "PriceDesc" },
                  ].map(({ label, value }) => (
                    <button key={value} onClick={() => setPriceSort(priceSort === value ? "" : value)}
                      className={`flex-1 py-2 text-xs font-medium border rounded-xl transition-all
                        ${priceSort === value
                          ? "bg-black text-white border-black"
                          : "border-gray-300 text-gray-700 hover:border-gray-500"}`}>
                      {label}
                    </button>
                  ))}
                </div>
              </div>

            </div>

            <div className="px-6 py-5 border-t border-gray-100 flex gap-3">
              <button onClick={handleReset}
                className="flex-1 py-2.5 text-sm font-medium border border-gray-300 rounded-xl text-gray-600 hover:bg-gray-50 transition-colors">
                Reset
              </button>
              <button onClick={handleApply}
                className="flex-1 py-2.5 text-sm font-medium bg-black text-white rounded-xl hover:bg-gray-800 transition-colors">
                View Results
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}