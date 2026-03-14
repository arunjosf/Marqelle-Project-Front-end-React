import { LayoutDashboard, Package, ShoppingBag, Users, LogOut } from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

export default function AdminSidebar() {
  const navigate = useNavigate();

  const navLinks = [
    { to: "/admin/dashboard", label: "Dashboard", Icon: LayoutDashboard },
    { to: "/admin/products", label: "Products", Icon: Package },
    { to: "/admin/orders", label: "Orders", Icon: ShoppingBag },
    { to: "/admin/users", label: "Users", Icon: Users },
  ];

  const handleLogout = () => {
    localStorage.removeItem("admin"); 
    toast.success("Logged out successfully!", {
      style: {
        borderRadius: "10px",
        background: "#fff",
        color: "#111",
        border: "1px solid #ddd",
        fontWeight: "normal",
      },
      iconTheme: { primary: "#111", secondary: "#fff" },
    });
    navigate("/login");
  };

  return (
    <aside className="w-64 bg-white text-black flex flex-col p-6 min-h-screen ml-5 mt-5 mb-5 rounded-xl">
      <h2 className="text-xl font-bold mb-8 text-left tracking-wide">
        Marqelle
      </h2>

      <nav className="flex flex-col gap-2">
        {navLinks.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded-2xl transition ${
                isActive
                  ? "bg-gray-200 text-black"
                  : "text-black hover:bg-gray-200 hover:text-black"
              }`
            }>
            <link.Icon size={18} />
            {link.label}
          </NavLink>
        ))}

        <hr className="my-4 border-gray-300" />

        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2 rounded-2xl text-black hover:bg-red-100 transition font-semibold">
          <LogOut size={18} />
          Logout
        </button>
      </nav>

      <div className="pt-6 border-t border-gray-300 text-sm text-gray-500 text-center mt-auto">
        © 2025 Marqelle Admin
      </div>
    </aside>
  );
}
