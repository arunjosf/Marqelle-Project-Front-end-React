import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { useContext } from "react";
import { context } from "../App";
import toast from "react-hot-toast";

const TOAST_STYLE = {
  style: {
    borderRadius: "10px",
    background: "#fff",
    color: "#111",
    border: "1px solid #ddd",
    fontWeight: "normal",
  },
};

export default function Profile() {
  const { user, setUser } = useContext(context);
  const navigate = useNavigate();
  const location = useLocation();

  const isAccountPage = location.pathname === "/profile" || location.pathname === "/profile/";
  const isOrdersPage = location.pathname === "/profile/orders";

  // Combine FirstName and LastName
  const fullName = user?.FirstName && user?.LastName 
    ? `${user.FirstName} ${user.LastName}`
    : user?.firstName && user?.lastName
    ? `${user.firstName} ${user.lastName}`
    : user?.fullName || "User";

  const handleLogout = () => {
    toast(
      (t) => (
        <div>
          <p className="mb-3 font-medium">Are you sure you want to logout?</p>
          <div className="flex gap-2">
            <button
              onClick={() => {
                localStorage.removeItem("token");
                localStorage.removeItem("user");
                setUser(null);
                toast.dismiss(t.id);
                toast.success("Logged out successfully", TOAST_STYLE);
                navigate("/login");
              }}
              className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 text-sm font-medium"
            >
              Yes, Logout
            </button>
            <button
              onClick={() => toast.dismiss(t.id)}
              className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400 text-sm font-medium"
            >
              Cancel
            </button>
          </div>
        </div>
      ),
      { duration: 5000, ...TOAST_STYLE }
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 ml-46 mt-15">
        <h1 id="logo-text" className="text-4xl font-semibold text-gray-800">Marqelle</h1>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex gap-8">
            <button
              onClick={() => navigate("/profile")}
              className={`py-3 border-b-2 text-sm font-semibold transition ${
                isAccountPage
                  ? "border-black text-gray-900"
                  : "border-transparent text-gray-600 hover:text-gray-900"
              }`}
            >
              Account Details
            </button>
            <button
              onClick={() => navigate("/profile/orders")}
              className={`py-3 border-b-2 text-sm font-semibold transition ${
                isOrdersPage
                  ? "border-black text-gray-900"
                  : "border-transparent text-gray-600 hover:text-gray-900"
              }`}
            >
              My Orders
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto">
        {isAccountPage && (
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold">Account Details</h2>
              <button
                onClick={handleLogout}
                className="px-5 py-2 bg-gray-900 text-white rounded-md hover:bg-red-600 transition-colors text-sm font-medium"
              >
                Logout
              </button>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
              <div className="space-y-6">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">
                    Full Name
                  </p>
                  <p className="text-lg font-semibold text-gray-900">
                    {fullName}
                  </p>
                </div>

                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">
                    Email
                  </p>
                  <p className="text-lg font-semibold text-gray-900">
                    {user?.email || user?.Email || "Not provided"}
                  </p>
                </div>


              </div>
            </div>
          </div>
        )}

        {isOrdersPage && <Outlet />}
      </div>
    </div>
  );
}