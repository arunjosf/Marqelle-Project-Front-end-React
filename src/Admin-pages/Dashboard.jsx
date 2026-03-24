import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useContext } from "react";
import { context } from "../App";
import axios from "axios";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import AdminSidebar from "./sidebar";

const BASE = "https://localhost:7177/api";

export default function AdminDashboard() {
  const [dashboard, setDashboard] = useState(null);
  const navigate = useNavigate();
  const { user } = useContext(context);

  const fetchData = async () => {
    try {
      const res = await axios.get(`${BASE}/admindashboard`, { withCredentials: true,});
      setDashboard(res.data.data);
    } catch (err) {
      console.error("Admin dashboard fetch error:", err);
    }
  };


  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 3000);
    return () => clearInterval(interval);
  }, []);

  const revenue = dashboard?.totalRevenue || 0;
  const categoryData = (dashboard?.salesByCategory || []).map((c) => ({
    name: c.categoryName ?? c.CategoryName,
    value: c.totalSales ?? c.TotalSales,
  }));
  const topProducts = dashboard?.topSellingProducts || [];

  const COLORS = ["#000000", "#565656ff", "#897e7eff", "#574b4bff"];

  return (
    <div className="flex min-h-screen bg-gray-100">
      <AdminSidebar />

      <main className="flex-1 p-6 overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-semibold text-gray-800">Welcome Back</h2>
            <p className="text-gray-500 text-sm">Let's see an overview</p>
          </div>

      {user && (
      <div className="flex items-center gap-3 bg-white p-2 rounded-full shadow-sm pr-7">
      <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center text-gray-700 font-bold">
      {user.email?.charAt(0).toUpperCase()}
      </div>
     <div className="text-left">
       <p className="text-xs text-gray-500">{user.email}</p>
        </div>
         </div>
        )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-2xl shadow-sm p-4">
            <h4 className="text-gray-500 text-sm">Total Orders</h4>
            <p className="text-2xl font-semibold">{dashboard?.totalOrders ?? 0}</p>
          </div>
          <div className="bg-white rounded-2xl shadow-sm p-4">
            <h4 className="text-gray-500 text-sm">Total Revenue</h4>
            <p className="text-2xl font-semibold">₹{revenue.toLocaleString("en-IN")}</p>
          </div>
          <div className="bg-white rounded-2xl shadow-sm p-4">
            <h4 className="text-gray-500 text-sm">Total Users</h4>
            <p className="text-2xl font-semibold">{dashboard?.totalUsers ?? 0}</p>
          </div>
          <div className="bg-white rounded-2xl shadow-sm p-4">
            <h4 className="text-gray-500 text-sm">Total Products</h4>
            <p className="text-2xl font-semibold">{dashboard?.totalProducts ?? 0}</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
          <h4 className="font-semibold text-gray-800 mb-4">Sales by Category</h4>

          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="w-full md:w-1/2 h-64">
              <ResponsiveContainer>
                <PieChart>
                  <Pie
                    data={categoryData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={90}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(1)}%`}
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `₹${value.toLocaleString("en-IN")}`} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="w-full md:w-1/2 mt-6 md:mt-0 md:pl-8">
              <div className="text-center md:text-left mb-4">
                <h5 className="text-xl font-semibold">Total ₹{revenue.toLocaleString("en-IN")}</h5>
              </div>
              {categoryData.length > 0 ? (
                categoryData.map((c, i) => {
                  const percent = revenue > 0 ? ((c.value / revenue) * 100).toFixed(1) : 0;
                  return (
                    <div key={c.name} className="flex justify-between items-center mb-2 text-gray-700">
                      <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }}></span>
                        <span>{c.name} ({percent}%)</span>
                      </div>
                      <span>₹{c.value.toLocaleString("en-IN")}</span>
                    </div>
                  );
                })
              ) : (
                <p className="text-gray-500">No category data available</p>
              )}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-6">
          <div className="flex justify-between items-center mb-4">
            <h4 className="font-semibold text-gray-800">Top Selling Products</h4>
            <button
              className="text-sm bg-gray-900 text-white px-3 py-1 rounded-full"
              onClick={() => navigate("/admin/orders")}
            >
              View All
            </button>
          </div>

          <div className="space-y-3">
            {topProducts.map((p, i) => (
              <div key={p.productId ?? p.ProductId} className="flex items-center justify-between bg-gray-50 border border-gray-200 rounded-xl p-3">
                <div className="flex items-center gap-3">
                  <span className="text-sm text-gray-500 font-medium w-6 text-center">#{i + 1}</span>
                  {p.productImage ?? p.ProductImage ? (
                    <img
                      src={p.productImage ?? p.ProductImage}
                      alt={p.productName ?? p.ProductName}
                      className="w-14 h-14 rounded-lg object-cover"
                    />
                  ) : (
                    <div className="w-14 h-14 bg-gray-200 rounded-lg flex items-center justify-center text-gray-400 text-xs">No Img</div>
                  )}
                  <div>
                    <h5 className="text-base font-semibold text-gray-800 truncate max-w-[180px]">{p.productName ?? p.ProductName}</h5>
                    <p className="text-xs text-gray-500">{p.categoryName ?? p.CategoryName ?? "N/A"}</p>
                  </div>
                </div>
                <div className="text-sm text-gray-600 flex flex-col items-end">
                  <span>Sold: <strong>{p.totalSold ?? p.TotalSold ?? 0}</strong></span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}