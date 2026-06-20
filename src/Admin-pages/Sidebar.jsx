import { LayoutDashboard, Package, ShoppingBag, Users, LogOut, Menu, X } from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useState } from "react";

export default function AdminSidebar() {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

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
    <>
      <div className="md:hidden flex items-center justify-between p-4 bg-white mb-4 shadow-sm mx-4 mt-4 rounded-xl">
        <h2 className="text-xl font-bold tracking-wide">Marqelle Admin</h2>
        <button onClick={() => setIsOpen(true)}>
          <Menu size={24} />
        </button>
      </div>

      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      <aside className={`w-64 bg-white text-black flex flex-col p-6 min-h-[calc(100vh-40px)] md:sticky md:top-5 ml-5 mt-5 mb-5 rounded-xl max-md:fixed max-md:top-0 max-md:left-0 max-md:h-full max-md:ml-0 max-md:mt-0 max-md:mb-0 max-md:rounded-none max-md:z-50 max-md:transition-transform max-md:duration-300 max-md:-translate-x-full ${isOpen ? "max-md:translate-x-0" : ""} z-40`}>
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-xl font-bold text-left tracking-wide">
            Marqelle
          </h2>
          <button className="md:hidden text-gray-500" onClick={() => setIsOpen(false)}>
            <X size={24} />
          </button>
        </div>

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
    </>
  );
}
