import { useEffect, useState } from "react";
import axios from "axios";
import AdminSidebar from "./sidebar";
import { Search } from "lucide-react";

const BASE = "https://localhost:7177/api/adminorder";

const STATUS_MAP = {
  "Pending": 0,
  "Shipped": 1,
  "OutForDelivery": 2,
  "Delivered": 3,
  "Cancelled": 4,
};

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [search, setSearch] = useState("");

  const fetchData = async () => {
    try {
      const res = await axios.get(`${BASE}/all-orders`, { withCredentials: true });
      const data = (res.data.data || [])
        .filter((o) => (o.products ?? o.Products ?? []).length > 0)
        .sort((a, b) => new Date(b.orderedDate ?? b.OrderedDate) - new Date(a.orderedDate ?? a.OrderedDate));
      setOrders(data);
    } catch (err) {
      console.error("Admin Orders fetch error:", err?.response?.status, err?.response?.data);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleStatusChange = async (orderId, newStatus) => {
    const statusValue = STATUS_MAP[newStatus];
    try {
      await axios.put(
        `${BASE}/update-status?orderId=${orderId}&status=${statusValue}`,
        {},
        { withCredentials: true }
      );
      setOrders((prev) =>
        prev.map((o) => (o.orderId === orderId || o.OrderId === orderId)
          ? { ...o, status: newStatus, Status: newStatus }
          : o
        )
      );
    } catch (err) {
      console.error("Status update failed:", err);
    }
  };

  const filteredOrders = orders.filter((order) => {
    const ser = search.toLowerCase();
    if (!ser) return true;
    const orderId = order.orderId ?? order.OrderId;
    const userId = order.userId ?? order.UserId;
    const products = order.products ?? order.Products ?? [];
    return (
      String(orderId).toLowerCase().includes(ser) ||
      String(userId).toLowerCase().includes(ser) ||
      products.some((p) => String(p.productId ?? p.ProductId).toLowerCase().includes(ser))
    );
  });

  return (
    <div className="flex min-h-screen bg-gray-100">
      <AdminSidebar />

      <main className="flex-1 p-8 overflow-y-auto">

        <div className="flex justify-between items-center mb-6 mt-1">
          <h1 className="text-2xl font-semibold text-gray-900">Manage Orders</h1>
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
          <p className="text-gray-500 text-center mt-20 text-sm">No orders found.</p>
        ) : (
          <div className="space-y-6">
            {filteredOrders.map((order) => {
              const orderId = order.orderId ?? order.OrderId;
              const userId = order.userId ?? order.UserId;
              const status = order.status ?? order.Status ?? "Pending";
              const totalAmount = order.totalAmount ?? order.TotalAmount ?? 0;
              const paymentMethod = order.paymentMethod ?? order.PaymentMethod ?? "N/A";
              const orderedDate = order.orderedDate ?? order.OrderedDate;
              const products = order.products ?? order.Products ?? [];

              return (
                <div
                  key={orderId}
                  className={`border border-gray-300 rounded-xl p-6 bg-white shadow-sm transition ${
                    status === "Cancelled" ? "opacity-80 bg-gray-50" : ""
                  }`}
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-medium text-gray-800">Order #{orderId}</h3>
                      <p className="text-sm text-gray-600 mt-1">User ID: {userId}</p>
                      <p className="text-sm text-gray-600 mt-1">
                        Payment Method:{" "}
                        <span className="font-semibold text-gray-800">{paymentMethod}</span>
                      </p>
                    </div>
                    <p className="text-sm text-gray-600">
                      <span className="font-semibold text-gray-600">Date:</span>{" "}
                      {orderedDate
                        ? new Date(orderedDate).toLocaleDateString("en-GB", {
                            day: "2-digit", month: "short", year: "numeric",
                          })
                        : "N/A"}
                    </p>
                  </div>

                  <div className="divide-y">
                    {products.map((item, i) => {
                      const img = item.productImage ?? item.ProductImage;
                      const name = item.productName ?? item.ProductName ?? "Unknown Product";
                      const productId = item.productId ?? item.ProductId;
                      const quantity = item.quantity ?? item.Quantity;
                      const price = item.price ?? item.Price ?? 0;

                      return (
                        <div key={i} className="flex items-center justify-between py-3">
                          <div className="flex items-center gap-3">
                            {img ? (
                              <img src={img} alt={name} className="w-16 h-16 object-cover rounded-md" />
                            ) : (
                              <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center text-gray-400 text-xs">No Img</div>
                            )}
                            <div>
                              <p className="font-medium text-gray-900">{name}</p>
                              <p className="text-sm text-gray-600">Product ID: {productId}</p>
                              <p className="text-sm text-gray-600">Quantity: {quantity}</p>
                            </div>
                          </div>
                          <span className="text-gray-700 text-sm font-semibold">₹{price}</span>
                        </div>
                      );
                    })}
                  </div>

                  <div className="flex items-center justify-between mt-5">
                    <div className="flex items-center gap-3">
                      <span className="font-medium text-gray-800">Status:</span>
                      {status === "Cancelled" ? (
                        <span className="text-red-600 font-bold text-sm bg-red-100 px-2 py-0.5 rounded-md shadow-sm">
                          Cancelled
                        </span>
                      ) : (
                        <select
                          value={status}
                          onChange={(e) => handleStatusChange(orderId, e.target.value)}
                          className={`border border-gray-300 rounded-md text-sm px-3 py-1 focus:outline-none transition ${
                            status === "Pending" ? "text-yellow-600 font-medium" : "text-green-600 font-medium"
                          }`}
                        >
                          <option className="text-black" value="Pending">Pending</option>
                          <option className="text-black" value="Shipped">Shipped</option>
                          <option className="text-black" value="OutForDelivery">Out for Delivery</option>
                          <option className="text-black" value="Delivered">Delivered</option>
                        </select>
                      )}
                    </div>
                    <div>
                      <span className="font-medium text-gray-800 mr-2">Total:</span>
                      <span className="font-semibold text-gray-900">₹{totalAmount}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}