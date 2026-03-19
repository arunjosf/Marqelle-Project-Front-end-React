import { useContext, useEffect, useState } from "react";
import { context } from "../App";
import { Link } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";

const WISHLIST_URL = "https://localhost:7177/api/userwishlist";
const CART_URL = "https://localhost:7177/api/usercart";
const PRODUCT_URL = "https://localhost:7177/api/userproducts";
const TOAST_STYLE = {
  style: { borderRadius: "10px", background: "#fff", color: "#111", border: "1px solid #ddd", fontWeight: "normal" },
  iconTheme: { primary: "#111", secondary: "#fff" },
};

// ── Size Selector Popup ───────────────────────────────────────────────────────
function SizePopup({ product, onClose, onAdded }) {
  const [selectedSize, setSelectedSize] = useState(null);
  const [adding, setAdding] = useState(false);

  async function handleAddToCart() {
    if (!selectedSize) {
      toast.error("Please select a size", { style: TOAST_STYLE.style });
      return;
    }
    setAdding(true);
    try {
      await axios.post(
        `${CART_URL}/add?productId=${product.productId}&size=${selectedSize}`,
        {},
        { withCredentials: true }
      );
      toast.success("Added to cart!", TOAST_STYLE);
      onAdded(product.productId);
    } catch (err) {
      const msg = err?.response?.data?.message || "Failed to add to cart.";
      toast.error(msg, { style: TOAST_STYLE.style });
    } finally {
      setAdding(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
        {/* Product info */}
        <div className="flex items-center gap-4 mb-5">
          <img
            src={Array.isArray(product.productImage) ? product.productImage[0] : product.productImage}
            alt={product.productName}
            className="w-16 h-16 object-cover rounded-xl border border-gray-100"
          />
          <div>
            <p className="text-sm font-medium text-gray-900">{product.productName}</p>
            <p className="text-sm text-gray-500 mt-0.5">₹{product.productPrice}</p>
          </div>
        </div>

        {/* Size selector */}
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Select Size</p>
        {product.sizes && product.sizes.length > 0 ? (
          <div className="flex flex-wrap gap-2 mb-6">
            {product.sizes.map((size) => (
              <button
                key={size}
                onClick={() => setSelectedSize(size)}
                className={`px-4 py-1.5 rounded-lg text-sm font-medium border transition-colors
                  ${selectedSize === size
                    ? "bg-black text-white border-black"
                    : "bg-white text-gray-700 border-gray-300 hover:border-black"}`}
              >
                {size}
              </button>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-400 mb-6">No sizes available</p>
        )}

        {/* Buttons */}
        <div className="flex gap-2">
          <button
            onClick={handleAddToCart}
            disabled={adding}
            className="flex-1 py-2.5 bg-black text-white text-sm font-medium rounded-xl hover:bg-gray-800 transition-colors disabled:opacity-50"
          >
            {adding ? "Adding..." : "Add to Cart"}
          </button>
          <button
            onClick={onClose}
            className="flex-1 py-2.5 bg-white text-gray-700 text-sm font-medium rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Wishlist Page ─────────────────────────────────────────────────────────────
export default function Wishlist() {
  const { user, setCart, wishlist, setWishlist } = useContext(context);
  const [popupProduct, setPopupProduct] = useState(null); // product shown in size popup

  useEffect(() => {
    if (!user) return;
    axios
      .get(`${WISHLIST_URL}/Get`, { withCredentials: true })
      .then((res) => setWishlist(res.data.data || []))
      .catch((err) => console.error("Wishlist fetch error:", err));
  }, [user]);

  // Fetch product sizes then open popup
  async function handleAddToCartClick(prod) {
    try {
      const res = await axios.get(`${PRODUCT_URL}/id?productId=${prod.productId}`);
      const productData = res.data.data;
      // Merge wishlist info with sizes from product details
      setPopupProduct({
        productId: prod.productId,
        productName: prod.productName,
        productImage: prod.productImage,
        productPrice: prod.productPrice,
        sizes: productData.sizes ?? productData.Sizes ?? [],
      });
    } catch {
      toast.error("Failed to load product details.", { style: TOAST_STYLE.style });
    }
  }

  // Called after cart add succeeds — remove from wishlist
  async function handleAddedToCart(productId) {
    try {
      await axios.delete(`${WISHLIST_URL}/Delete?productId=${productId}`, { withCredentials: true });
      setWishlist((prev) => prev.filter((w) => w.productId !== productId));
    } catch {
      // Non-critical — wishlist remove failed but cart add succeeded
    }
    setPopupProduct(null);
  }

  const handleRemoveWishlist = async (productId) => {
    try {
      await axios.delete(`${WISHLIST_URL}/Delete?productId=${productId}`, { withCredentials: true });
      setWishlist((prev) => prev.filter((w) => w.productId !== productId));
      toast.success("Removed from wishlist", TOAST_STYLE);
    } catch {
      toast.error("Failed to remove from wishlist", { style: TOAST_STYLE.style });
    }
  };

  return (
    <>
      {/* Size popup */}
      {popupProduct && (
        <SizePopup
          product={popupProduct}
          onClose={() => setPopupProduct(null)}
          onAdded={handleAddedToCart}
        />
      )}

      <h2 className="text-4xl md:text-5xl font-semibold text-black text-left md:ml-62 mt-8 ml-9">
        Marqelle.
      </h2>
      <hr className="border-t border-gray-900 w-[81%] mx-5 md:w-[67%] mx-auto mt-5 md:mt-7" />

      <div className="max-w-7xl mx-auto mt-10 mb-16">
        <h1 className="text-2xl font-semibold text-left mb-10 ml-32">Your Wishlist</h1>

        {wishlist.length === 0 ? (
          <p className="text-center text-gray-600 mt-20">Your wishlist is empty.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 px-6 mx-25">
            {wishlist.map((prod, index) => (
              <div key={prod.productId || index} className="text-left rounded-2xl">
                <Link to={`/productdetails/${prod.productId}`}>
                  <img
                    src={Array.isArray(prod.productImage) ? prod.productImage[0] : prod.productImage}
                    alt={prod.productName}
                    className="h-[300px] w-[230px] object-cover rounded-lg mx-auto"
                  />
                </Link>

                <h1 className="mt-3 font-serif text-gray-900 ml-2">{prod.productName}</h1>
                <h1 className="mt-1 ml-2 text-gray-800 text-sm font-medium">₹{prod.productPrice}</h1>

                <div className="flex justify-center gap-3 mt-4">
                  <button
                    onClick={() => handleAddToCartClick(prod)}
                    className="bg-gray-900 text-white text-sm px-3 py-2 rounded hover:bg-gray-800 w-28"
                  >
                    Add to Cart
                  </button>
                  <button
                    onClick={() => handleRemoveWishlist(prod.productId)}
                    className="text-gray-700 text-sm font-medium hover:underline w-28 border rounded px-3"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}