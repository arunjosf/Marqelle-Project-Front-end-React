import { useContext, useEffect, useState } from "react";
import axios from "axios";
import { context } from "../App";
import { useNavigate, Link } from "react-router-dom";
import { Search, Bookmark, ShoppingCart, Menu, X } from "lucide-react";
import toast from "react-hot-toast";

export default function Profile() {
  const { user, setUser, orders, setOrders, products, setProducts, wishlist, cart } = useContext(context);
  const navigate = useNavigate();

  useEffect(() => {
    const loggedUser = user || JSON.parse(localStorage.getItem("user"));
    if (!loggedUser || !loggedUser.id) return;

    if (!user) setUser(loggedUser);

    axios
      .get("http://localhost:5000/products")
      .then((res) => setProducts(res.data.data || []))
      .catch((err) => console.error("Product fetch error:", err));

    axios
      .get(`http://localhost:5000/orders?userId=${loggedUser.id}`)
      .then((res) => {
        const sorted = [...res.data].sort((a, b) => {
          const parseDate = (order) => {
            if (!order?.date) return 0;
            const d = new Date(order.date);
            return isNaN(d.getTime()) ? 0 : d.getTime();
          };
          return parseDate(b) - parseDate(a);
        });
        setOrders(sorted);
      })
      .catch((err) => console.error("Order fetch error:", err));
  }, [user]);

  const handleCancel = async (id) => {
    toast.dismiss();
    toast.custom((t) => (
      <div
        className={`${
          t.visible ? "animate-enter" : "animate-leave"
        } flex items-center justify-between gap-6 bg-white border border-gray-300 text-gray-900 px-6 py-4 rounded-xl shadow-md w-[340px]`}
      >
        <span className="text-base">Are you sure you want to cancel?</span>

        <div className="flex gap-3">
          <button
            onClick={async () => {
              toast.dismiss(t.id);
              try {
                const orderToUpdate = orders.find((o) => o.id === id);
                if (!orderToUpdate) return;
                const updatedOrder = { ...orderToUpdate, status: "Cancelled" };
                await axios.put(`http://localhost:5000/orders/${id}`, updatedOrder);
                setOrders((prev) =>
                  prev.map((o) => (o.id === id ? updatedOrder : o))
                );

                toast.success("Your order has been cancelled.", {
                  style: {
                    borderRadius: "10px",
                    background: "#fff",
                    color: "#111",
                    border: "1px solid #ddd",
                  },
                });
              } catch (err) {
                console.error("Cancel error:", err);
                toast.error("Failed to cancel order", {
                  style: {
                    borderRadius: "10px",
                    background: "#fff",
                    color: "#111",
                    border: "1px solid #ddd",
                  },
                });
              }
            }}
            className="bg-black text-white text-sm px-4 py-2 rounded-md hover:bg-gray-800 transition"
          >
            Yes
          </button>

          <button
            onClick={() => toast.dismiss(t.id)}
            className="text-sm text-gray-700 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-100 transition"
          >
            No
          </button>
        </div>
      </div>
    ));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem("user");

    toast.success("You have been logged out.", {
      duration: 3000,
      style: {
        borderRadius: "10px",
        background: "#fff",
        color: "#111",
        border: "1px solid #ddd",
        fontWeight: "normal",
        fontSize: "15px",
        padding: "12px 18px",
      },
      iconTheme: {
        primary: "black",
        secondary: "#fff",
      },
    });
    navigate("/login");
  };

  const statusSteps = ["Pending", "Shipped", "Out for Delivery", "Delivered"];

  return (
    <>
      <div className="flex items-center justify-between px-60 mt-8">
        <Link to={"/home"}>
          <h2 className="text-4xl md:text-5xl font-semibold text-black text-left md:text-left md:ml-1 mt-8">
            Marqelle.
          </h2>
        </Link>

        <div className="flex items-center gap-3 mt-10">
          <Link to="/home" className="hover:text-gray-600">Home</Link>
          <button className="px-2 py-2 rounded-[15px] text-gray-900 text-sm">
            <Link to={"/search"}><Search size={17} /></Link>
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

      <hr className="border-t border-gray-900 w-[81%] mx-5 md:w-[67%] mx-auto mt-5 md:mt-7" />

      <div className="max-w-5xl mx-auto my-10 bg-white rounded-2xl shadow-md p-8 mt-15">
        <div className="text-left mb-10">
          <h1 className="text-3xl font-semibold">
            {user ? `Welcome, ${user.firstname || "User"}!` : "My Profile"}
          </h1>
          <p className="text-gray-500 mt-1">{user?.email}</p>

          <button
            onClick={handleLogout}
            className="mt-5 bg-gray-900 hover:bg-gray-800 text-white font-medium px-6 py-2 rounded-full shadow-sm">
            Logout
          </button>
        </div>
        <div className="space-y-6">
          <h2 className="text-2xl font-semibold mb-3 text-left">Your Orders</h2>

          {orders.length === 0 ? (
            <p className="text-left text-gray-600">
              You haven’t placed any orders yet.
            </p>
          ) : (
            orders.map((order) => {
              const currentStepIndex = statusSteps.indexOf(order.status);
              const isDelivered = order.status === "Delivered";

              return (
                <div
                  key={order.id}
                  className="border border-gray-300 rounded-lg p-5 bg-white shadow-sm">

                  <div className="flex justify-between mb-3">
                    <h3 className="font-medium">Order #{order.id}</h3>
                    <p className="text-sm text-gray-500">{order.date.slice(0,10)}</p>
                  </div>

                  <div className="divide-y">
                    {order.items && order.items.length > 0 ? (
                      order.items.map((item, index) => {
                        const dbProduct = products.find(
                          (p) => Number(p.id) === Number(item.productId)
                        );
                        const product = item.image ? item : dbProduct;
                        if (!product) return null;

                        return (
                          <div
                            key={index}
                            className="flex items-center justify-between py-3">
                            <div className="flex items-center gap-3">
                              <img
                                src={Array.isArray(product.image) ? product.image[0] : product.image}
                                alt={product.name}
                                className="w-16 h-16 object-cover rounded-md"
                              />
                              <div>
                                <p className="font-medium text-gray-900">
                                  {product.name || "Unknown Product"}
                                </p>
                                <p className="text-sm text-gray-500">
                                  Quantity: {item.quantity}
                                </p>
                              </div>
                            </div>

                            <span className="font-semibold text-gray-700">
                              ₹{product.price * item.quantity}
                            </span>
                          </div>
                        );
                      })
                    ) : (
                      <p className="text-gray-500 text-sm">No items in this order.</p>
                    )}
                  </div>

                  <div className="flex justify-between mt-7">
                    <span className="font-medium">Total:</span>
                    <span className="font-semibold">₹{order.total}</span>
                  </div>

                  <div className="mt-5">
                    <h4 className="text-sm font-medium mb-2">Order Tracking</h4>

                    <div className="relative flex items-center justify-between">
                      <div className="absolute top-2.5 left-0 w-full h-0.5 bg-gray-300 z-0 rounded"></div>

                      <div
                        className="absolute top-2.5 left-0 h-0.5 bg-green-600 z-0 rounded transition-all duration-1000 ease-in-out"
                        style={{
                          width: `${isDelivered ? 100 : (currentStepIndex) / (statusSteps.length - 1) * 100}%`,
                        }}
                      ></div>

                      {statusSteps.map((step, index) => {
                        const isCompleted = isDelivered || index < currentStepIndex;
                        const isCurrent = !isDelivered && index === currentStepIndex;

                        return (
                          <div key={step} className="flex-1 flex flex-col items-center relative z-10">
                            <div
                              className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all duration-500
                                ${isCompleted
                                  ? "bg-green-600 border-green-600"
                                  : isCurrent
                                  ? "bg-yellow-500 border-yellow-500 animate-pulse"
                                  : "bg-white border-gray-300"
                                }`}
                            >
                              {isCompleted && !isCurrent && (
                                <svg
                                  className="w-3 h-3 text-white"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  viewBox="0 0 24 24"
                                >
                                  <path d="M5 13l4 4L19 7" />
                                </svg>
                              )}
                            </div>

                            <span
                              className={`text-xs mt-2 text-center ${isCompleted || isCurrent ? "text-gray-800 font-medium" : "text-gray-400"}`}
                            >
                              {step}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {order.status !== "Delivered" && order.status !== "Cancelled" && (
                    <button
                      onClick={() => handleCancel(order.id)}
                      className="bg-red-500 hover:bg-red-600 text-white text-xs px-4 py-1 rounded-md mt-10 ml-204"
                    >
                      Cancel Order
                    </button>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </>
  );
}
