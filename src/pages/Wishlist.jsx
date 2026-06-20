import { useContext, useEffect, useState } from "react";
import { context } from "../App";
import { Link } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import { ShoppingCart } from "lucide-react";

const WISHLIST_URL = "https://localhost:7177/api/userwishlist";
const CART_URL = "https://localhost:7177/api/usercart";
const PRODUCT_URL = "https://localhost:7177/api/userproducts";
const TOAST_STYLE = {
  style: { borderRadius: "10px", background: "#fff", color: "#111", border: "1px solid #ddd", fontWeight: "normal" },
  iconTheme: { primary: "#111", secondary: "#fff" },
};

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

export default function Wishlist() {
  const { user, setCart, wishlist, setWishlist,cart } = useContext(context);
  const [popupProduct, setPopupProduct] = useState(null); 

  useEffect(() => {
    if (!user) return;
    axios
      .get(`${WISHLIST_URL}/Get`, { withCredentials: true })
      .then((res) => setWishlist(res.data.data || []))
      .catch((err) => console.error("Wishlist fetch error:", err));
  }, [user]);

  async function handleAddToCartClick(prod) {
    try {
      const res = await axios.get(`${PRODUCT_URL}/id?productId=${prod.productId}`);
      const productData = res.data.data;
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

  async function handleAddedToCart(productId) {
    try {
      await axios.delete(`${WISHLIST_URL}/Delete?productId=${productId}`, { withCredentials: true });
      setWishlist((prev) => prev.filter((w) => w.productId !== productId));
    } catch {
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
      {popupProduct && (
        <SizePopup
          product={popupProduct}
          onClose={() => setPopupProduct(null)}
          onAdded={handleAddedToCart}
        />
      )}

      <div className="flex justify-between items-center px-4 md:px-0">
      <Link to={"/home"}> <h2 className="text-3xl md:text-5xl font-semibold text-black text-left md:ml-62 mt-6 md:mt-8">
        Marqelle.
      </h2></Link>
      <div className="flex items-center gap-5 md:pr-60 mt-6 md:mt-8">
          <Link className="text-sm font-semibold hover:text-gray-700" to={"/home"}>Home</Link>

          <button className="px-3 text-gray-900 text-sm mt-1">
            <Link to="/cart" className="flex items-center gap-1">
              <ShoppingCart size={17} />
              <span className="text-xs">{cart.length}</span>
            </Link>
          </button>
      </div>
      </div>
      <hr className="border-t border-gray-900 w-[81%] mx-5 md:w-[67%] mx-auto mt-5 md:mt-7" />
    
      <div className="max-w-7xl mx-auto mt-6 md:mt-10 mb-16 px-4 md:px-0">
        {wishlist.length > 0 ? (
        <h1 className="text-[16px] md:text-2xl font-semibold text-center md:text-left mb-6 md:mb-8 md:ml-32">Your Wishlist</h1>
        ): (<div></div>)}

        {wishlist.length === 0 ? (
          <div className="items-center">
          <p className="text-center text-gray-900 mt-32 md:mt-65 text-lg tracking-wide font-light">Your wishlist is empty.</p>
          <p className="text-xs  mt-3 text-gray-700 text-center">The items you add will be shown here</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 md:gap-5 px-0 md:px-6 md:mx-25">
            {wishlist.map((prod, index) => (
              <div key={prod.productId || index} className="text-left rounded-2xl w-[230px] mx-auto">
                <Link to={`/productdetails/${prod.productId}`}>
                  <img
                    src={Array.isArray(prod.productImage) ? prod.productImage[0] : prod.productImage}
                    alt={prod.productName}
                    className="h-[300px] w-[230px] object-cover rounded-lg"
                  />
                </Link>

                <h1 className="mt-3 font-serif text-gray-900 ml-1">{prod.productName}</h1>
                <h1 className="mt-1 ml-1 text-gray-800 text-sm font-medium">₹{prod.productPrice}</h1>

                <div className="flex justify-between gap-1 mt-4">
                  <button
                    onClick={() => handleAddToCartClick(prod)}
                    className="bg-gray-900 text-white text-sm px-3 py-2 rounded hover:bg-gray-800 w-[110px]"
                  >
                    Add to Cart
                  </button>
                  <button
                    onClick={() => handleRemoveWishlist(prod.productId)}
                    className="text-gray-700 text-sm font-medium hover:underline w-[110px] border border-gray-300 rounded px-3"
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