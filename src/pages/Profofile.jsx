import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { useContext, useState } from "react";
import { context } from "../App";
import toast from "react-hot-toast";
import axios from "axios";

const AUTH_URL = "https://localhost:7177/api/usersauth";
const PROFILE_URL = "https://localhost:7177/api/userprofile";

const TOAST_STYLE = {
  style: { borderRadius: "10px", background: "#fff", color: "#111", border: "1px solid #ddd", fontWeight: "normal" },
  iconTheme: { primary: "#111", secondary: "#fff" },
};

export default function Profile() {
  const { user, setUser } = useContext(context);
  const navigate = useNavigate();
  const location = useLocation();

  const isAccountPage = location.pathname === "/profile" || location.pathname === "/profile/";
  const isOrdersPage = location.pathname === "/profile/orders";

  const [editMode, setEditMode] = useState(false);
  const [firstName, setFirstName] = useState(user?.firstName || user?.FirstName || "");
  const [lastName, setLastName] = useState(user?.lastName || user?.LastName || "");
  const [email, setEmail] = useState(user?.email || user?.Email || "");
  const [saving, setSaving] = useState(false);

  const [showChangePassword, setShowChangePassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [pwLoading, setPwLoading] = useState(false);
  const [pwError, setPwError] = useState("");

  const fullName = user?.firstName && user?.lastName
    ? `${user.firstName} ${user.lastName}`
    : user?.FirstName && user?.LastName
    ? `${user.FirstName} ${user.LastName}`
    : user?.fullName || "User";

  const userEmail = user?.email || user?.Email || "Not provided";

  
  const handleLogout = () => {
    toast(
      (t) => (
        <div>
          <p className="mb-5 font-medium mt-2">Are you sure you want to logout?</p>
          <div className="flex gap-2 mb-3">
            <button
              onClick={async () => {
                try {
                  await axios.post(`${AUTH_URL}/logout`, {}, { withCredentials: true });
                } catch {}
                localStorage.removeItem("token");
                localStorage.removeItem("user");
                setUser(null);
                toast.dismiss(t.id);
                toast.success("Logged out successfully", TOAST_STYLE);
                navigate("/login");
              }}
              className="px-7 py-1 bg-black text-white rounded hover:bg-red-600 text-sm font-small"
            >
              Sign Out
            </button>
            <button
              onClick={() => toast.dismiss(t.id)}
              className="px-9 py-1 bg-gray-300 text-gray-800 rounded hover:bg-gray-400 text-sm font-medium"
            >
              Cancel
            </button>
          </div>
        </div>
      ),
      { duration: 5000, ...TOAST_STYLE }
    );
  };

  const handleUpdateProfile = async () => {
    if (!firstName.trim() || !lastName.trim() || !email.trim()) {
      toast.error("Please fill all fields", TOAST_STYLE);
      return;
    }
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email)) {
      toast.error("Enter a valid email address", TOAST_STYLE);
      return;
    }
    setSaving(true);
    try {
      await axios.put(
        `${PROFILE_URL}/update-profile?firstName=${firstName.trim()}&lastName=${lastName.trim()}&email=${email.trim()}`,
        {},
        { withCredentials: true }
      );
      const updatedUser = { ...user, firstName: firstName.trim(), lastName: lastName.trim() };
      localStorage.setItem("user", JSON.stringify(updatedUser));
      setUser(updatedUser);
      toast.success("Profile updated successfully!", TOAST_STYLE);
      setEditMode(false);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update profile.", TOAST_STYLE);
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    setPwError("");
    if (!currentPassword || !newPassword || !confirmPassword) {
      setPwError("Please fill all fields");
      return;
    }
    const passwordPattern = /^(?=.*[A-Z])(?=.*\d).{8,}$/;
    if (!passwordPattern.test(newPassword)) {
      setPwError("Password must be at least 8 characters, 1 uppercase & 1 number");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPwError("Passwords do not match");
      return;
    }
    setPwLoading(true);
    try {
      await axios.put(
        `${PROFILE_URL}/change-password?currentPassword=${currentPassword}&newPassword=${newPassword}`,
        {},
        { withCredentials: true }
      );
      toast.success("Password changed successfully!", TOAST_STYLE);
      setShowChangePassword(false);
      setCurrentPassword(""); setNewPassword(""); setConfirmPassword("");
    } catch (err) {
      setPwError(err.response?.data?.message || "Failed to change password.");
    } finally {
      setPwLoading(false);
    }
  };

  const [showEmailChange, setShowEmailChange] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [emailOtp, setEmailOtp] = useState("");
  const [emailOtpSent, setEmailOtpSent] = useState(false);
  const [emailLoading, setEmailLoading] = useState(false);
  const [emailError, setEmailError] = useState("");

  const inputClass = "w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-black transition-colors";

  const handleSendEmailOtp = async () => {
    setEmailError("");
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!newEmail.trim() || !emailPattern.test(newEmail)) {
      setEmailError("Enter a valid email address");
      return;
    }
    setEmailLoading(true);
    try {
      await axios.post(
        `${PROFILE_URL}/change-email/send-otp?newEmail=${newEmail.trim()}`,
        {},
        { withCredentials: true }
      );
      toast.success("OTP sent to your new email!", TOAST_STYLE);
      setEmailOtpSent(true);
    } catch (err) {
      setEmailError(err.response?.data?.message || "Failed to send OTP.");
    } finally {
      setEmailLoading(false);
    }
  };

  const handleVerifyEmailOtp = async () => {
    setEmailError("");
    if (!emailOtp.trim()) { setEmailError("Please enter the OTP"); return; }
    setEmailLoading(true);
    try {
      await axios.post(
        `${PROFILE_URL}/change-email/verify?otpCode=${emailOtp.trim()}`,
        {},
        { withCredentials: true }
      );
      const updatedUser = { ...user, email: newEmail.trim() };
      localStorage.setItem("user", JSON.stringify(updatedUser));
      setUser(updatedUser);
      toast.success("Email updated successfully!", TOAST_STYLE);
      setShowEmailChange(false);
      setEmailOtpSent(false);
      setNewEmail(""); setEmailOtp(""); setEmailError("");
    } catch (err) {
      setEmailError(err.response?.data?.message || "Invalid or expired OTP.");
    } finally {
      setEmailLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white  px-6 py-4 pl-52 mt-15">
        <h1 id="logo-text" className="text-4xl font-semibold text-gray-800">Marqelle</h1>
      </div>

      <div>
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex gap-8">
            <button
              onClick={() => navigate("/profile")}
              className={`py-3 border-b-2 text-sm font-semibold transition ${
                isAccountPage ? "border-black text-gray-900" : "border-transparent text-gray-600 hover:text-gray-900"
              }`}
            >
              Account Details
            </button>
            <button
              onClick={() => navigate("/profile/orders")}
              className={`py-3 border-b-2 text-sm font-semibold transition ${
                isOrdersPage ? "border-black text-gray-900" : "border-transparent text-gray-600 hover:text-gray-900"
              }`}
            >
              My Orders
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto">
        {isAccountPage && (
          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>

            <div className="mb-6">
              <h2 className="text-2xl font-semibold text-gray-900">Account Details</h2>
            </div>

        
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 mb-4">
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-sm font-semibold text-gray-500 tracking-wide">Personal Details</h3>
                {!editMode && (
                  <button
                    onClick={() => setEditMode(true)}
                    className="text-xs font-semibold text-black border border-gray-200 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Change
                  </button>
                )}
              </div>

              {!editMode ? (
                <div className="space-y-4">
                  <div>
                    <p className="text-xs text-gray-400 mb-0.5">Full Name</p>
                    <p className="text-sm font-semibold text-gray-900">{fullName}</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">First Name</label>
                      <input className={inputClass} value={firstName} onChange={(e) => setFirstName(e.target.value)} />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Last Name</label>
                      <input className={inputClass} value={lastName} onChange={(e) => setLastName(e.target.value)} />
                    </div>
                  </div>
                  <div className="flex gap-2 pt-1">
                    <button
                      onClick={handleUpdateProfile}
                      disabled={saving}
                      className="flex-1 py-2.5 bg-black text-white text-sm font-medium rounded-xl hover:bg-gray-800 transition-colors disabled:opacity-50"
                    >
                      {saving ? "Saving..." : "Save Changes"}
                    </button>
                    <button
                      onClick={() => {
                        setEditMode(false);
                        setFirstName(user?.firstName || user?.FirstName || "");
                        setLastName(user?.lastName || user?.LastName || "");
                        setEmail(user?.email || user?.Email || "");
                      }}
                      className="flex-1 py-2.5 bg-white text-gray-700 text-sm font-medium rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-sm font-semibold text-gray-500 tracking-wide">Password</h3>
                {!showChangePassword && (
                  <button
                    onClick={() => setShowChangePassword(true)}
                    className="text-xs font-semibold text-black border border-gray-200 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Change
                  </button>
                )}
              </div>

              {!showChangePassword ? (
                <p className="text-sm text-gray-400">••••••••••••</p>
              ) : (
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Current Password</label>
                    <input type="password" className={inputClass} value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)} placeholder="Enter current password" />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">New Password</label>
                    <input type="password" className={inputClass} value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)} placeholder="At least 8 chars, 1 uppercase, 1 number" />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Confirm New Password</label>
                    <input type="password" className={inputClass} value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Repeat new password" />
                  </div>

                  {pwError && <p className="text-xs text-red-500">{pwError}</p>}

                  <div className="flex gap-2 pt-1">
                    <button
                      onClick={handleChangePassword}
                      disabled={pwLoading}
                      className="flex-1 py-2.5 bg-black text-white text-sm font-medium rounded-xl hover:bg-gray-800 transition-colors disabled:opacity-50"
                    >
                      {pwLoading ? "Updating..." : "Update Password"}
                    </button>
                    <button
                      onClick={() => {
                        setShowChangePassword(false);
                        setCurrentPassword(""); setNewPassword(""); setConfirmPassword(""); setPwError("");
                      }}
                      className="flex-1 py-2.5 bg-white text-gray-700 text-sm font-medium rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>

            </div>

            <div className="flex flex-col gap-4 mt-14">
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
                <div className="flex items-center justify-between mb-5">
                  <h3 className="text-sm font-semibold text-gray-500 tracking-wide">Email Address</h3>
                  {!showEmailChange && (
                    <button
                      onClick={() => setShowEmailChange(true)}
                      className="text-xs font-semibold text-black border border-gray-200 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Change
                    </button>
                  )}
                </div>

                {!showEmailChange ? (
                  <div>
                    <p className="text-xs text-gray-400 mb-0.5">Current Email</p>
                    <p className="text-sm font-semibold text-gray-900">{userEmail}</p>
                  </div>
                ) : emailOtpSent ? (
                  <div className="space-y-3">
                    <p className="text-xs text-gray-500">Enter the OTP sent to <strong>{newEmail}</strong></p>
                    <input
                      type="text" maxLength={6}
                      placeholder="6-digit OTP"
                      className={inputClass + " tracking-widest text-center"}
                      value={emailOtp} onChange={(e) => setEmailOtp(e.target.value)}
                    />
                    {emailError && <p className="text-xs text-red-500">{emailError}</p>}
                    <div className="flex gap-2 pt-1">
                      <button onClick={handleVerifyEmailOtp} disabled={emailLoading}
                        className="flex-1 py-2.5 bg-black text-white text-sm font-medium rounded-xl hover:bg-gray-800 transition-colors disabled:opacity-50">
                        {emailLoading ? "Verifying..." : "Verify & Update"}
                      </button>
                      <button onClick={() => { setShowEmailChange(false); setEmailOtpSent(false); setNewEmail(""); setEmailOtp(""); setEmailError(""); }}
                        className="flex-1 py-2.5 bg-white text-gray-700 text-sm font-medium rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors">
                        Cancel
                      </button>
                    </div>
                    <button onClick={handleSendEmailOtp} disabled={emailLoading}
                      className="text-xs text-gray-400 hover:text-black transition">
                      Resend OTP
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">New Email Address</label>
                      <input type="email" className={inputClass}
                        placeholder="Enter new email"
                        value={newEmail} onChange={(e) => setNewEmail(e.target.value)} />
                    </div>
                    {emailError && <p className="text-xs text-red-500">{emailError}</p>}
                    <div className="flex gap-2 pt-1">
                      <button onClick={handleSendEmailOtp} disabled={emailLoading}
                        className="flex-1 py-2.5 bg-black text-white text-sm font-medium rounded-xl hover:bg-gray-800 transition-colors disabled:opacity-50">
                        {emailLoading ? "Sending OTP..." : "Send OTP"}
                      </button>
                      <button onClick={() => { setShowEmailChange(false); setNewEmail(""); setEmailError(""); }}
                        className="flex-1 py-2.5 bg-white text-gray-700 text-sm font-medium rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors">
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
                <h3 className="text-sm font-semibold text-gray-500 tracking-wide mb-3">Session</h3>
            
                <button
                  onClick={handleLogout}
                  className="w-full py-2 text-sm font-medium text-black border border-gray-400 rounded-md hover:text-gray-500 transition-colors"
                >
                  Sign Out
                </button>
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