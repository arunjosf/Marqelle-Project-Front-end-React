import { useContext, useEffect, useState } from "react";
import { context } from "../App";
import { Link } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";

export default function Wishlist() {
  const { user, setCart, wishlist, setWishlist } = useContext(context);

  useEffect(() => {
    if (!user) return;
    const uid = String(user.id);

    axios
      .get("http://localhost:5000/wishlist")
      .then((res) => {
        const filtered = res.data.filter(
          (item) => String(item.userId) === uid
        );
        setWishlist(filtered);
      })
      .catch((err) => console.error("Wishlist fetch error:", err));
  }, [user]);

  const handleAddToCart = async (item) => {
    if (!user) {
      toast.error("Please login to add items to cart.", {
        style: {borderRadius: "10px",background: "#fff", color: "#111", border: "1px solid #ddd", fontWeight: "normal",
        },
      });
      return;
    }

    try {
      const { data: allCart } = await axios.get("http://localhost:5000/cart");
      const userCart = allCart.filter((c) => c.userId === user.id);
      const exists = userCart.find((c) => c.productId === item.productId);

      if (exists) {
        toast("Already in cart.", {
          style: {
            borderRadius: "10px",
            background: "#fff",
            color: "#111",
            border: "1px solid #ddd",
            fontWeight: "normal",
          },
        });
        return;
      }

      const newCartItem = {
        userId: user.id,
        productId: item.productId,
        name: item.name,
        image: item.image,
        price: item.price,
        quantity: 1,
      };

      await axios.post("http://localhost:5000/cart", newCartItem);

      const refreshed = await axios.get("http://localhost:5000/cart");
      setCart(refreshed.data.filter((c) => c.userId === user.id));

      await axios.delete(`http://localhost:5000/wishlist/${item.id}`);
      setWishlist((prev) => prev.filter((w) => w.id !== item.id));

      toast.success("Added to cart & removed from wishlist", {
        style: {
          borderRadius: "10px",background: "#fff",color: "#111",border: "1px solid #ddd",fontWeight: "normal",
        },
        iconTheme: {
          primary: "#111", secondary: "#fff",
        },
      });
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong.", {
        style: {
          borderRadius: "10px",background: "#fff",color: "#111",border: "1px solid #ddd",fontWeight: "normal",
        },
      });
    }
  };

  const handleRemoveWishlist = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/wishlist/${id}`);
      setWishlist((prev) => prev.filter((item) => item.id !== id));

      toast.success("Removed from wishlist", {
        style: {
          borderRadius: "10px",background: "#fff",color: "#111",border: "1px solid #ddd",fontWeight: "normal",
        },
        iconTheme: {
          primary: "#111", 
          secondary: "#fff",
        },
      });
    } catch (err) {
      console.error("Error removing from wishlist:", err);
      toast.error("Failed to remove from wishlist", {
        style: {
          borderRadius: "10px",
          background: "#fff",
          color: "#111",
          border: "1px solid #ddd",
          fontWeight: "normal",
        },
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
            {wishlist.map((prod) => (
              <div key={prod.id} className="text-left rounded-2xl">
            <Link to={`/productdetails/${prod.productId}`}>
              <img
                src={
                 Array.isArray(prod.image)? prod.image[0]: prod.image
                    }
                    alt={prod.name}
                    className="h-[300px] w-[230px] object-cover rounded-lg mx-auto"
                  />
                </Link>

                <h1 className="mt-3 font-serif text-gray-900 ml-2">
                  {prod.name}
                </h1>
                <h1 className="mt-1 ml-2 text-gray-800 text-sm font-medium">
                  ₹{prod.price}
                </h1>

                <div className="flex justify-center gap-3 mt-4">
                  <button
                    onClick={() => handleAddToCart(prod)}
                    className="bg-gray-900 text-white text-sm px-3 py-2 rounded hover:bg-gray-800 w-28">
                    Add to Cart
                  </button>
                  <button
                    onClick={() => handleRemoveWishlist(prod.id)}
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
