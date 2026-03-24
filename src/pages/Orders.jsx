import { useEffect, useState, useContext } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { context } from "../App";

const BASE = "https://localhost:7177/api";
const TOAST_STYLE = {
  style: {
    borderRadius: "10px",
    background: "#fff",
    color: "#111",
    border: "1px solid #ddd",
    fontWeight: "normal",
  },
};

export default function Orders() {
  const { user } = useContext(context);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { setLoading(false); return; }

    axios
      .get(`${BASE}/userorder/my-orders`, { withCredentials: true })
      .then((res) => {
        if (res.data.data && Array.isArray(res.data.data)) {
          const transformedOrders = res.data.data.map((order) => {
            const orderDate = new Date(order.orderedDate);
            const deliveryDate = new Date(orderDate);
            deliveryDate.setDate(deliveryDate.getDate() + 5);
            return {
              id: order.orderId,
              date: orderDate.toLocaleDateString("en-IN"),
              time: orderDate.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }),
              deliveryDate: deliveryDate.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }),
              status: order.status,
              total: order.totalAmount,
              items: order.products || [],
            };
          });

          const sorted = transformedOrders.sort((a, b) => {
            const parseDate = (order) => {
              const combined = order.time ? `${order.date}T${order.time}` : order.date;
              const d = new Date(combined);
              return isNaN(d.getTime()) ? 0 : d.getTime();
            };
            return parseDate(b) - parseDate(a);
          });

          setOrders(sorted);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("API Error:", err);
        toast.error("Failed to load orders", TOAST_STYLE);
        setLoading(false);
      });
  }, [user]);

  const handleCancel = (orderId) => {
    toast.dismiss();
    toast.custom((t) => (
      <div className={`${t.visible ? "animate-enter" : "animate-leave"} flex items-center justify-between gap-6 bg-white border border-gray-300 text-gray-900 px-6 py-4 rounded-xl shadow-md w-[340px]`}>
        <span className="text-base">Are you sure you want to cancel?</span>
        <div className="flex gap-3">
          <button
            onClick={async () => {
              toast.dismiss(t.id);
              try {
                await axios.put(`${BASE}/userorder/cancel-order?orderId=${orderId}`, {}, { withCredentials: true });
                setOrders((prev) => prev.map((o) => o.id === orderId ? { ...o, status: "Cancelled" } : o));
                toast.success("Your order has been cancelled.", { style: { borderRadius: "10px", background: "#fff", color: "#111", border: "1px solid #ddd" } });
              } catch (err) {
                toast.error("Failed to cancel order", { style: { borderRadius: "10px", background: "#fff", color: "#111", border: "1px solid #ddd" } });
              }
            }}
            className="bg-black text-white text-sm px-4 py-2 rounded-md hover:bg-gray-800 transition"
          >Yes</button>
          <button onClick={() => toast.dismiss(t.id)}
            className="text-sm text-gray-700 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-100 transition"
          >No</button>
        </div>
      </div>
    ));
  };

  if (loading) return <p className="text-center text-gray-600 mt-10">Loading your orders...</p>;
  if (!orders.length) return <p className="text-center text-gray-600 mt-10">You haven't placed any orders yet.</p>;

  const statusSteps = ["Pending", "Shipped", "Out for Delivery", "Delivered"];

  return (
    <div className="space-y-6 p-6">
      <h2 className="text-2xl font-semibold mb-6">My Orders</h2>

      {orders.map((order) => {
        const currentStepIndex = statusSteps.indexOf(order.status);
        const isDelivered = order.status === "Delivered";
        const isCancelled = order.status === "Cancelled";

        return (
          <div key={order.id} className="border border-gray-300 rounded-lg p-5 bg-white shadow-sm">
            <div className="flex justify-between mb-3">
              <h3 className="font-medium">Order #{order.id}</h3>
              <p className="text-sm text-gray-500">{order.date}</p>
            </div>

            <div className="divide-y">
              {order.items && order.items.length > 0 ? (
                order.items.map((item, index) => (
                  <div key={index} className="flex items-center justify-between py-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={Array.isArray(item.productImage) ? item.productImage[0] : item.productImage}
                        alt={item.productName}
                        className="w-16 h-16 object-cover rounded-md"
                        onError={(e) => { e.target.src = "https://via.placeholder.com/64?text=Product"; }}
                      />
                      <div>
                        <p className="font-medium text-gray-900">{item.productName || "Unknown Product"}</p>
                        <p className="text-sm text-gray-500">Quantity: {item.quantity}</p>
                        {item.size && <p className="text-xs text-gray-500">Size: {item.size}</p>}
                      </div>
                    </div>
                    <span className="font-semibold text-gray-700">₹{(item.price * item.quantity).toLocaleString("en-IN")}</span>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-sm">No items in this order.</p>
              )}
            </div>

            <div className="flex justify-between mt-4">
              <span className="font-medium">Total:</span>
              <span className="font-semibold">₹{order.total.toLocaleString("en-IN")}</span>
            </div>

            {!isCancelled && (
              <div className="mt-4 flex items-center gap-2">
                <span className="text-xs text-gray-500">
                  {isDelivered ? "Delivered on:" : "Expected delivery by:"}
                </span>
                <span className="text-xs font-semibold text-green-900">{order.deliveryDate}</span>
              </div>
            )}

            {!isCancelled ? (
              <div className="mt-5">
                <h4 className="text-sm font-medium mb-5">Order Tracking</h4>
                <div className="relative flex items-center justify-between">
                  <div className="absolute top-2.5 left-0 w-full h-0.5 bg-gray-300 z-0 rounded"></div>
                  <div
                    className="absolute top-2.5 left-0 h-0.5 bg-green-600 z-0 rounded transition-all duration-1000 ease-in-out"
                    style={{ width: `${isDelivered ? 100 : (currentStepIndex / (statusSteps.length - 1.4)) * 100}%` }}
                  ></div>
                  {statusSteps.map((step, index) => {
                    const isCompleted = isDelivered || index < currentStepIndex;
                    const isCurrent = !isDelivered && index === currentStepIndex;
                    return (
                      <div key={step} className="flex-1 flex flex-col items-center relative z-10">
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all duration-500
                          ${isCompleted ? "bg-green-600 border-green-600" : isCurrent ? "bg-yellow-500 border-yellow-500 animate-pulse" : "bg-white border-gray-300"}`}>
                          {isCompleted && !isCurrent && (
                            <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                              <path d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </div>
                        <span className={`text-xs mt-2 text-center ${isCompleted || isCurrent ? "text-gray-800 font-medium" : "text-gray-400"}`}>{step}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="mt-5">
                <h4 className="text-sm font-medium mb-2 text-red-600">Status: Cancelled</h4>
                <div className="w-full h-0.5 bg-red-500 rounded"></div>
              </div>
            )}

            {order.status !== "Delivered" && order.status !== "Cancelled" && (
              <button onClick={() => handleCancel(order.id)}
                className="bg-red-500 hover:bg-red-600 text-white text-xs px-4 py-1 rounded-md mt-7 ml-240 mb-2">
                Cancel Order
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
}