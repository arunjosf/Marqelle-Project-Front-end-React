import { useContext, useEffect, useState } from "react";
import { context } from "../App";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";

export default function Wishlist() {
  const { user, setCart, wishlist, setWishlist } = useContext(context);
   const navigate = useNavigate();
  const WISHLIST_URL = "https://localhost:7177/api/userwishlist";


  useEffect(() => {
    if (!user) return;
    axios
      .get(`${WISHLIST_URL}/Get`, { withCredentials: true })
      .then((res) => setWishlist(res.data.data || []))
      .catch((err) => console.error("Wishlist fetch error:", err));
  }, [user]);
 
  const handleAddToCart = (productId) => {
    navigate(`/productdetails/${productId}`);
  };
 
  const handleRemoveWishlist = async (productId) => {
    try {
      await axios.delete(`${WISHLIST_URL}/Delete?productId=${productId}`, {withCredentials: true,});
      setWishlist((prev) => prev.filter((w) => w.productId !== productId));
 
      toast.success("Removed from wishlist", {
        style: { borderRadius: "10px", background: "#fff", color: "#111", border: "1px solid #ddd", fontWeight: "normal" },
        iconTheme: { primary: "#111", secondary: "#fff" },
      });
    } catch (err) {
      toast.error("Failed to remove from wishlist", {
        style: { borderRadius: "10px", background: "#fff", color: "#111", border: "1px solid #ddd", fontWeight: "normal" },
      });
    }
  };

  return (
    <>
      <h2 className="text-4xl md:text-5xl font-semibold text-black text-left md:ml-62 mt-8 ml-9">
        Marqelle.
      </h2>
      <hr className="border-t border-gray-900 w-[81%] mx-5 md:w-[67%] mx-auto mt-5 md:mt-7" />

      <div className="max-w-7xl mx-auto mt-10 mb-16">
        <h1 className="text-2xl font-semibold text-left mb-10 ml-32">
          Your Wishlist
        </h1>

        {wishlist.length === 0 ? (
          <p className="text-center text-gray-600 mt-20">
            Your wishlist is empty.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 px-6 mx-25">
            {wishlist.map((prod, index) => (
              <div key={prod.productId || index} className="text-left rounded-2xl">
            <Link to={`/productdetails/${prod.productId}`}>
              <img
                src={
                 Array.isArray(prod.productImage)? prod.productImage[0]: prod.productImage
                    }
                    alt={prod.productName}
                    className="h-[300px] w-[230px] object-cover rounded-lg mx-auto"
                  />
                </Link>

                <h1 className="mt-3 font-serif text-gray-900 ml-2">
                  {prod.productName}
                </h1>
                <h1 className="mt-1 ml-2 text-gray-800 text-sm font-medium">
                  ₹{prod.productPrice}
                </h1>

                <div className="flex justify-center gap-3 mt-4">
                  <button
                    onClick={() => handleAddToCart(prod)}
                    className="bg-gray-900 text-white text-sm px-3 py-2 rounded hover:bg-gray-800 w-28">
                    Add to Cart
                  </button>
                  <button
                    onClick={() => handleRemoveWishlist(prod.productId)}
                    className="text-gray-700 text-sm font-medium hover:underline w-28 border rounded px-3">
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
