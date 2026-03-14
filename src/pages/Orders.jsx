import { useEffect, useContext } from "react";
import axios from "axios";
import { context } from "../App";

export default function Orders() {
  const { user, orders, setOrders, products, setProducts } = useContext(context);

  useEffect(() => {
    const loggedUser = user || JSON.parse(localStorage.getItem("user"));
    if (!loggedUser || !loggedUser.id) return;

    axios
      .get("http://localhost:5000/products")
      .then((res) => setProducts(res.data))
      .catch((err) => console.error("Product fetch error:", err));

    axios
      .get(`http://localhost:5000/orders?userId=${loggedUser.id}`)
      .then((res) => {
        const sorted = [...res.data].sort((a, b) => {
          const parseDate = (order) => {
            if (!order) return 0;
            const combined = order.time
              ? `${order.date}T${order.time}`
              : order.date;
            const d = new Date(combined);
            return isNaN(d.getTime()) ? 0 : d.getTime();
          };
          return parseDate(b) - parseDate(a);
        });
        setOrders(sorted);
      })
      .catch((err) => console.error("Order fetch error:", err));
  }, [user]);

  const handleCancel = async (id) => {
    if (!window.confirm("Are you sure you want to cancel this order?")) return;
    try {
      const order = orders.find((o) => o.id === id);
      if (!order) return;

      const updated = { ...order, status: "Cancelled" };
      await axios.put(`http://localhost:5000/orders/${id}`, updated);

      setOrders((prev) =>
        prev.map((o) => (o.id === id ? { ...o, status: "Cancelled" } : o))
      );
    } catch (err) {
      console.error("Cancel error:", err);
    }
  };

  if (!orders.length)
    return (
      <p className="text-center text-gray-600 mt-10">
        You haven’t placed any orders yet.
      </p>
    );

  return (
    <div className="space-y-6 p-6">
      <h2 className="text-2xl font-semibold mb-6">My Orders</h2>

      {orders.map((order) => (
        <div
          key={order.id}
          className="border border-gray-300 rounded-lg p-5 bg-white shadow-sm"
        >
          <div className="flex justify-between mb-3">
            <h3 className="font-medium">Order #{order.id}</h3>
            <p className="text-sm text-gray-500">{order.date}</p>
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
                    className="flex items-center justify-between py-3"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={
                          Array.isArray(product.image)
                            ? product.image[0]
                            : product.image
                        }
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

          <div className="flex justify-between items-center mt-5">
            <p
              className={`text-sm font-semibold ${
                order.status === "Cancelled"
                  ? "text-red-500"
                  : order.status === "Delivered"
                  ? "text-green-600"
                  : "text-yellow-600"
              }`}
            >
              Status: {order.status || "Pending"}
            </p>

            {order.status !== "Delivered" &&
              order.status !== "Cancelled" && (
                <button
                  onClick={() => handleCancel(order.id)}
                  className="bg-red-500 hover:bg-red-600 text-white text-xs px-4 py-1 rounded-md"
                >
                  Cancel Order
                </button>
              )}
          </div>
        </div>
      ))}
    </div>
  );
}
