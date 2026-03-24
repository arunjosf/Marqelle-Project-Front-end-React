import { useEffect, useState, useContext } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { context } from "../App";

const CART_URL = "https://localhost:7177/api/usercart";

function OutOfStockPopup({ items, onContinue, onCancel }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 animate-fade-in">

        <div className="flex items-start gap-3 mb-5">
          <div className="mt-0.5 flex-shrink-0 w-9 h-9 rounded-full bg-red-50 flex items-center justify-center">
            <svg className="w-5 h-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
            </svg>
          </div>
          <div>
            <h2 className="text-base font-semibold text-gray-900">Some items are out of stock</h2>
            <p className="text-sm text-gray-500 mt-0.5">
              The following item{items.length > 1 ? "s are" : " is"} currently unavailable.
              You can continue without {items.length > 1 ? "them" : "it"} or cancel to update your cart.
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-3 mb-6 max-h-56 overflow-y-auto pr-1">
          {items.map((item) => (
            <div key={item.cartId} className="flex items-center gap-3 border border-red-100 bg-red-50/50 rounded-xl px-3 py-2.5">
              <img
                src={item.productImage}
                alt={item.productName}
                className="w-14 h-14 object-cover rounded-lg flex-shrink-0 border border-gray-100"
              />
              <div className="min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{item.productName}</p>
                <p className="text-xs text-gray-500">Size: {item.size}</p>
                <span className="inline-block mt-1 text-xs font-medium text-red-500 bg-red-100 px-2 py-0.5 rounded-full">
                  Out of stock
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className="flex flex-col gap-2">
          <button
            onClick={onContinue}
            className="w-full py-2.5 bg-black text-white text-sm font-medium rounded-xl hover:bg-gray-800 transition-colors"
          >
            Continue without {items.length > 1 ? "these items" : "this item"}
          </button>
          <button
            onClick={onCancel}
            className="w-full py-2.5 bg-white text-gray-700 text-sm font-medium rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
        </div>

      </div>
    </div>
  );
}

export default function Cart() {
  const { cart, setCart, user } = useContext(context);
  const [loading, setLoading] = useState(true);
  const [outOfStockPopup, setOutOfStockPopup] = useState(false);
  const [outOfStockItems, setOutOfStockItems] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) { setLoading(false); return; }
    axios
      .get(`${CART_URL}/Cartitems`, { withCredentials: true })
      .then((res) => setCart(res.data.data || []))
      .catch((err) => console.error("Error loading cart:", err))
      .finally(() => setLoading(false));
  }, [user]);

  async function handleRemove(cartId) {
    try {
      await axios.delete(`${CART_URL}/remove/${cartId}`, { withCredentials: true });
      setCart((prev) => prev.filter((item) => item.cartId !== cartId));
      toast.success("Removed from cart", {
        style: { borderRadius: "10px", background: "#fff", color: "#111", border: "1px solid #ddd", fontWeight: "normal" },
        iconTheme: { primary: "#111", secondary: "#fff" },
      });
    } catch (err) {
      console.error("Error removing item:", err);
      toast.error("Failed to remove item", {
        style: { borderRadius: "10px", background: "#fff", color: "#111", border: "1px solid #ddd", fontWeight: "normal" },
      });
    }
  }

  async function handleQuantityChange(cartId, newQty) {
    if (newQty < 1) return;

    const item = cart.find((i) => i.cartId === cartId);
    const maxStock = item?.availableStock ?? 99;

    if (newQty > maxStock) {
      toast.error(`Only ${maxStock} item${maxStock === 1 ? "" : "s"} available in stock`, {
        style: { borderRadius: "10px", background: "#fff", color: "#111", border: "1px solid #ddd", fontWeight: "normal" },
      });
      return;
    }

    setCart((prev) =>
      prev.map((i) => i.cartId === cartId ? { ...i, quantity: newQty } : i)
    );
    try {
      await axios.put(`${CART_URL}/updateQuantity/${cartId}?quantity=${newQty}`, {}, { withCredentials: true });
    } catch (err) {
      console.error("Error updating quantity:", err);
      setCart((prev) =>
        prev.map((i) => i.cartId === cartId ? { ...i, quantity: item?.quantity ?? newQty } : i)
      );
    }
  }

  function handleCheckout() {
    const oos = cart.filter((item) => item.isOutOfStock);
    if (oos.length > 0) {
      setOutOfStockItems(oos);
      setOutOfStockPopup(true);
      return;
    }
    navigate("/checkout");
  }

  async function handleContinueWithoutOOS() {
    try {
      await Promise.all(
        outOfStockItems.map((item) =>
          axios.delete(`${CART_URL}/remove/${item.cartId}`, { withCredentials: true })
        )
      );
      const removedIds = new Set(outOfStockItems.map((i) => i.cartId));
      setCart((prev) => prev.filter((item) => !removedIds.has(item.cartId)));

      setOutOfStockPopup(false);
      setOutOfStockItems([]);

      toast.success("Out-of-stock items removed", {
        style: { borderRadius: "10px", background: "#fff", color: "#111", border: "1px solid #ddd", fontWeight: "normal" },
        iconTheme: { primary: "#111", secondary: "#fff" },
      });

      navigate("/checkout");
    } catch (err) {
      console.error("Error removing out-of-stock items:", err);
      toast.error("Something went wrong. Please try again.", {
        style: { borderRadius: "10px", background: "#fff", color: "#111", border: "1px solid #ddd", fontWeight: "normal" },
      });
    }
  }

  function handleCancelPopup() {
    setOutOfStockPopup(false);
    setOutOfStockItems([]);
  }

  const total = cart.reduce(
    (acc, item) => acc + (item.productPrice || 0) * (item.quantity || 1),
    0
  );

  if (loading) {
    return (
      <div className="h-screen flex justify-center items-center">
        <p className="text-gray-600">Loading cart...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="h-screen flex flex-col justify-center items-center">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">You are not logged in</h2>
        <p className="text-gray-600">Please login to view your cart.</p>
      </div>
    );
  }

  return (
    <>
      {outOfStockPopup && (
        <OutOfStockPopup
          items={outOfStockItems}
          onContinue={handleContinueWithoutOOS}
          onCancel={handleCancelPopup}
        />
      )}

      <div className="min-h-screen bg-gray-100 py-10 px-6 pt-15">
        <h1 className="text-3xl font-semibold text-center mb-8">Your Cart</h1>

        {cart.length === 0 ? (
          <div className="flex flex-col items-center">
            <p className="text-gray-700 text-lg">Your cart is empty.</p>
          </div>
        ) : (
          <div className="max-w-5xl mx-auto bg-white shadow-lg rounded-2xl p-6">
            <div className="flex flex-col gap-6">
              {cart.map((item) => (
                <div
                  key={item.cartId}
                  className="flex flex-col md:flex-row items-center justify-between border-b pb-4"
                >
                  <Link to={`/productdetails/${item.productId}`}>
                    <div className="flex items-center gap-4">
                      <img
                        src={item.productImage}
                        alt={item.productName}
                        className="w-32 h-32 object-cover rounded-lg"
                      />
                      <div>
                        <h2 className="text-lg font-medium text-gray-900">{item.productName}</h2>
                        <p className="text-gray-500 text-sm">Size: {item.size}</p>
                        <p className="text-gray-800 font-semibold">₹{item.productPrice}</p>
                        {item.stockWarning && (
                          <p className="text-orange-500 text-xs">{item.stockWarning}</p>
                        )}
                        {item.isOutOfStock && (
                          <p className="text-red-500 text-xs font-medium">Out of stock</p>
                        )}
                      </div>
                    </div>
                  </Link>

                  <div className="flex items-center gap-3 mt-4 md:mt-0">
                    <div className="flex items-center border rounded-lg px-3 py-1">
                      <button
                        onClick={() => handleQuantityChange(item.cartId, (item.quantity || 1) - 1)}
                        className="px-2 text-lg text-gray-700 hover:text-black"
                      >
                        −
                      </button>
                      <span className="px-3 text-gray-800 text-sm font-medium">{item.quantity || 1}</span>
                      <button
                        onClick={() => handleQuantityChange(item.cartId, (item.quantity || 1) + 1)}
                        disabled={item.availableStock > 0 && (item.quantity || 1) >= item.availableStock}
                        className="px-2 text-lg text-gray-700 hover:text-black disabled:opacity-30 disabled:cursor-not-allowed"
                      >
                        +
                      </button>
                    </div>
                    <button
                      onClick={() => handleRemove(item.cartId)}
                      className="text-gray-700 hover:underline"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-800">Total: ₹{total}</h2>
              <button
                className="px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
                onClick={handleCheckout}
              >
                Checkout
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}