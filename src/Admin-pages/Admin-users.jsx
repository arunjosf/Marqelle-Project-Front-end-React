import { useEffect, useState } from "react";
import axios from "axios";
import AdminSidebar from "./sidebar";
import { User, Search, Lock, Unlock } from "lucide-react";
import toast from "react-hot-toast";

export default function Users() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");

  const fetchUsers = async () => {
    try {
      const res = await axios.get("http://localhost:5000/users");
      const datas = (res.data || []).map((u) => ({
        ...u,
        blocked: !!u.blocked,
        firstname: u.firstname || "",
        lastname: u.lastname || "",
        email: u.email || "",
      }));
      setUsers(datas);
    } catch (err) {
      console.error("User fetch error:", err);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleBlockToggle = async (user) => {
  try {
    const updated = { ...user, blocked: !user.blocked };
    await axios.put(`http://localhost:5000/users/${user.id}`, updated);
    toast.success(
      updated.blocked
        ? `${user.firstname} has been blocked`
        : `${user.firstname} has been unblocked`,
      { duration: 4000 } 
    );
    fetchUsers(); 
  } catch (err) {
    toast.error("Error updating user", { duration: 4000 });
    console.error(err);
  }
};
  const filteredUsers = users.filter((u) => {
    const user = search.toLowerCase();
    return (
      (u.firstname.toLowerCase().includes(user) ||
        u.lastname.toLowerCase().includes(user) ||
        String(u.id).includes(user))
    );
  });

  return (
    <div className="flex min-h-screen bg-gray-100">
      <AdminSidebar />

      <main className="flex-1 p-6 overflow-y-auto">
        <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
          <div>
            <h2 className="text-2xl font-semibold text-gray-800">Users</h2>
            <p className="text-gray-500 text-sm">Manage all users</p>
          </div>

          <div className="flex items-center gap-2 bg-gray-900 text-white px-4 py-2 rounded-full text-sm">
            <User className="w-4 h-4" />
            Total: {filteredUsers.length}
          </div>
        </div>

        <div className="mb-6 flex items-center gap-2 bg-white border border-gray-300 rounded-full px-4 py-2 shadow-sm w-full sm:w-96">
          <Search className="w-4 h-4 text-gray-500" />
          <input
            type="text"
            placeholder="Search by name or ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 outline-none text-sm text-gray-700"
          />
        </div>

        <div className="space-y-3">
          {filteredUsers.length > 0 ? (
            filteredUsers.map((u, index) => (
              <div
                key={u.id}
                className={`flex justify-between items-center border rounded-xl p-4 shadow-sm transition ${
                  u.blocked
                    ? "bg-red-50 border-red-300"
                    : "bg-white border-gray-200"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center text-gray-600 font-semibold">
                    {u.firstname.charAt(0).toUpperCase() || "?"}
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-10 text-sm">
                    <h4 className="font-semibold text-gray-800">
                      {u.firstname} {u.lastname}
                    </h4>
                    <p className="text-gray-500">
                      <span className="text-gray-600 font-semibold">Email:</span>{" "}
                      {u.email}
                    </p>
                    <p className="text-gray-500">
                      <span className="text-gray-600 font-semibold">ID:</span>{" "}
                      {u.id}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => handleBlockToggle(u)}
                    className={`px-4 py-1 rounded-full text-sm font-medium flex items-center gap-2 cursor-pointer ${
                      u.blocked
                        ? "bg-green-600 text-white hover:bg-green-700"
                        : "bg-red-600 text-white hover:bg-red-700"
                    }`}>
                    {u.blocked ? (
                      <>
                        <Unlock className="w-4 h-4 cursor-pointer" /> Unblock
                      </>
                    ) : (
                      <>
                        <Lock className="w-4 h-4 cursor-pointer" /> Block
                      </>
                    )}
                  </button>

                  <div className="text-sm text-gray-600 text-right">
                    <p className="font-medium">#{index + 1}</p>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p className="text-gray-500 text-center py-10">No users found</p>
          )}
        </div>
      </main>
    </div>
  );
}
