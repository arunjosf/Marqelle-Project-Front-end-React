import { useEffect, useState } from "react";
import axios from "axios";
import AdminSidebar from "./sidebar";
import { Search } from "lucide-react";

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");

  const fetchData = async () => {
    try {
      const [ordersRes, productsRes, usersRes] = await Promise.all([
        axios.get("http://localhost:5000/orders"),
        axios.get("http://localhost:5000/products"),
        axios.get("http://localhost:5000/users"), ]);

        const validOrders = (ordersRes.data || [])
        .filter((o) => o && o.items && o.items.length > 0)
        .sort((a, b) => new Date(b.date) - new Date(a.date));

      setOrders(validOrders);
      setProducts(productsRes.data.data || []);
      setUsers(usersRes.data || []);

    } catch (err) {
      console.error("Admin Orders fetch error:", err); 
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await axios.patch(`http://localhost:5000/orders/${orderId}`, {
        status: newStatus,
      });
      setOrders((prev) =>
        prev.map((o) =>
          o.id === orderId ? { ...o, status: newStatus } : o
        )
      );
    } catch (err) {
      console.error("Status update failed:", err);
    }
  };

  const filteredOrders = orders.filter((order) => {
    const ser = search.toLowerCase();
    if (!ser) return true;
    return (
      String(order.id).toLowerCase().includes(ser) ||
      String(order.userId).toLowerCase().includes(ser) ||
      (order.items && order.items.some((items) =>
      String(items.productId).toLowerCase().includes(ser)
      ))
    );
  });

  const getUserName = (userId) => {
    const user = users.find((u) => String(u.id) === String(userId));
    return user ? `${user.firstname} ${user.lastname}` : "Unknown User";
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      <AdminSidebar />

      <main className="flex-1 p-8 overflow-y-auto">
  
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-semibold text-gray-900">Orders</h1>
          <div className="flex items-center gap-2 bg-black text-white px-5 py-2 rounded-full text-sm">
            Total Orders: {filteredOrders.length}
          </div>
        </div>

        <div className="flex items-center bg-white border border-gray-300 rounded-full px-4 py-2 shadow-sm w-full max-w-md mb-8">
          <Search className="w-4 h-4 text-gray-500 mr-2" />
          <input
            type="text"
            placeholder="Search by Order ID, User ID, or Product ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 outline-none text-sm text-gray-700"
          />
        </div>

        {filteredOrders.length === 0 ? (
          <p className="text-gray-500 text-center mt-20 text-sm">
            No orders found.
          </p>
        ) : (
          <div className="space-y-6">
            {filteredOrders.map((order) => (
              <div
                key={order.id}
                className={`border border-gray-300 rounded-xl p-6 bg-white shadow-sm transition
                  ${
                    order.status === "Cancelled"
                      ? "opacity-80 bg-gray-50"
                      : ""
                  }`}>
        
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-medium text-gray-800">
                      Order #{order.id}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                      User: {getUserName(order.userId)} (ID: {order.userId})
                    </p>
                    <p className="text-sm text-gray-600 mt-1">
                      Payment Method:{" "} <span className="font-semibold text-gray-800"> {order.paymentMethod || "N/A"}
                      </span>
                    </p>
                  </div>
                  <p className="text-sm text-gray-600">
                    <span className="font-semibold text-gray-600">Date:</span>{" "}
                    {order.date
                      ? new Date(order.date).toLocaleDateString("en-GB", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })
                      : "N/A"}
                  </p>
                </div>

                <div className="divide-y">
                  {order.items.map((item, i) => {
                    const product = products.find(
                      (p) => Number(p.id) === Number(item.productId)
                    );
                    if (!product) return null;

                    const img = Array.isArray(product.image)
                      ? product.image[0]
                      : product.image;

                    return (
                      <div
                        key={i}
                        className="flex items-center justify-between py-3"
                      >
                        <div className="flex items-center gap-3">
                          <img
                            src={img}
                            alt={product.name}
                            className="w-16 h-16 object-cover rounded-md"
                          />
                          <div>
                            <p className="font-medium text-gray-900">
                              {product.name || "Unknown Product"}
                            </p>
                            <p className="text-sm text-gray-600">
                              Product ID: {item.productId}
                            </p>
                            <p className="text-sm text-gray-600">
                              Quantity: {item.quantity}
                            </p>
                          </div>
                        </div>

                        <span className="text-gray-700 text-sm font-semibold">
                          ₹{product.price || 0}
                        </span>
                      </div>
                    );
                  })}
                </div>

                <div className="flex items-center justify-between mt-5">
                  <div className="flex items-center gap-3">
                    <span className="font-medium text-gray-800">Status:</span>

                    {order.status === "Cancelled" ? (
                      <span className="text-red-600 font-bold text-sm bg-red-100 px-2 py-0.5 rounded-md shadow-sm">
                        Cancelled
                      </span>
                    ) : (
                      <select
                        value={order.status || "Pending"}
                        onChange={(e) =>
                          handleStatusChange(order.id, e.target.value)
                        }
                       className={`border border-gray-300 rounded-md text-sm px-3 py-1 focus:outline-none transition
                        ${order.status === "Pending" ? "text-yellow-600 font-medium"  : "text-green-600 font-medium"}`}>

                        <option className="text-black" value="Pending">
                          Pending
                        </option>
                        <option className="text-black" value="Shipped">
                          Shipped
                        </option>
                        <option className="text-black" value="Out for Delivery">
                          Out for Delivery
                        </option>
                        <option className="text-black" value="Delivered">
                          Delivered
                        </option>
                      </select>
                    )}
                  </div>

                  <div>
                    <span className="font-medium text-gray-800 mr-2">
                      Total:
                    </span>
                    <span className="font-semibold text-gray-900">
                      ₹{order.total}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
