import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import { useContext } from "react";
import { context } from "../App";

const AUTH_URL = "https://localhost:7177/api/usersauth";
const TOAST_STYLE = {
  style: { borderRadius: "10px", background: "#fff", color: "#111", border: "1px solid #ddd", fontWeight: "normal" },
  iconTheme: { primary: "#111", secondary: "#fff" },
};

export default function Signup() {
  const navigate = useNavigate();
  const { setUser } = useContext(context);

  const [firstname, setFirstname] = useState("");
  const [lastname, setLastname] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");

  const [showOtp, setShowOtp] = useState(false);
  const [otp, setOtp] = useState("");
  const [otpError, setOtpError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [resending, setResending] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!firstname || !lastname || !email || !password) {
      setError("Please fill in all fields");
      return;
    }

    const Name = /^[A-Za-z][A-Za-z\s]*$/;
    if (!Name.test(firstname)) {
      setError("First name must start with a letter & contain only letters and spaces");
      return;
    }
    if (!Name.test(lastname)) {
      setError("Last name must start with a letter & contain only letters and spaces");
      return;
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email)) {
      setError("Enter a valid email address");
      return;
    }

    const passwordPattern = /^(?=.*[A-Z])(?=.*\d).{8,}$/;
    if (!passwordPattern.test(password)) {
      setError("Password must be at least 8 characters long, 1 uppercase letter & 1 number");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setShowOtp(true);
    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("Firstname", firstname.trim());
      formData.append("LastName", lastname.trim());
      formData.append("Email", email.trim());
      formData.append("Password", password.trim());
      formData.append("ConfirmPassword", confirmPassword);

      const res = await axios.post(`${AUTH_URL}/register`, formData, { withCredentials: true });

      if (res.data.success) {
        toast.success("OTP sent to your email!", TOAST_STYLE);
      } else {
        setShowOtp(false);
        setError(res.data.message || "Registration failed. Please try again.");
      }
    } catch (err) {
      setShowOtp(false);
      setError(err.response?.data?.message || "Something went wrong. Please try again later.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setOtpError("");

    if (!otp.trim()) {
      setOtpError("Please enter the OTP");
      return;
    }

    try {
      const res = await axios.post(
        `${AUTH_URL}/verify-email?otpCode=${otp.trim()}`,
        {},
        { withCredentials: true }
      );

      if (res.data.success) {
        const profileRes = await axios.get("https://localhost:7177/api/userprofile/userprofile", { withCredentials: true });
        const d = profileRes.data.data;
        setUser({ id: d.id, firstName: d.firstName, lastName: d.lastName, email: d.email, roleId: d.roleId });

        toast.success("Email verified! Welcome to Marqelle.", TOAST_STYLE);
        navigate("/home");
      } else {
        setOtpError(res.data.message || "Verification failed.");
      }
    } catch (err) {
      setOtpError(err.response?.data?.message || "Invalid or expired OTP.");
    }
  };

  const handleResendOtp = async () => {
    setResending(true);
    setOtpError("");
    try {
      await axios.post(`${AUTH_URL}/resend-verification?email=${email}`, {}, { withCredentials: true });
      toast.success("New OTP sent to your email!", TOAST_STYLE);
    } catch (err) {
      setOtpError(err.response?.data?.message || "Failed to resend OTP.");
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="flex h-screen items-center justify-center bg-gray-100">
      <div className="relative w-[800px] rounded-3xl shadow-2xl overflow-hidden flex gap-2 bg-white">
        <div
          className="hidden md:flex w-[420px] flex flex-col items-center justify-center text-center text-white relative overflow-hidden bg-cover rounded-3xl"
          style={{ backgroundImage: "url('src/assets/signup2.png')" }}>
          <div className="mt-15 px-4 py-2 text-xs text-gray-300 bg-white/10 backdrop-blur-md rounded-full shadow-md border border-white/20 mt-110">
            © 2025 Marqelle. All rights reserved.
          </div>
        </div>

        <div className="flex-1 bg-white rounded-l-3xl p-8 flex flex-col justify-center md:py-10 md:px-15 py-15">
          <div className="mb-8 text-center">
            <h1 id="logo-text" className="text-2xl font-semibold text-gray-800">Marqelle</h1>
            <p className="text-gray-500 text-1xl text-sm leading-loose">Experience the perfect fit</p>
          </div>

          {!showOtp && (
            <>
              <div className="flex justify-center mb-8 bg-gray-200 rounded-full p-1 w-75 h-10 mx-auto gap-1">
                <button
                  className="w-1/2 flex items-center justify-center text-center py-2 text-sm font-medium rounded-full text-black hover:rounded-full hover:transition-all hover:duration-300 hover:bg-gray-300"
                  onClick={() => navigate("/login")}>
                  LogIn
                </button>
                <button
                  className="w-1/2 flex items-center justify-center text-center py-2 text-sm font-medium rounded-full transition-all duration-300 bg-black text-white shadow-md"
                  onClick={() => navigate("/signup")}>
                  Sign Up
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4 w-75 mx-auto text-sm">
                <p className="text-xs font-semibold text-gray-700 ml-4 mb-1">Firstname</p>
                <input type="text" placeholder="Firstname"
                  className="w-full border border-gray-300 rounded-full px-4 py-2 focus:outline-none focus:ring-1 focus:ring-black"
                  value={firstname} onChange={(e) => setFirstname(e.target.value)} required />

                <p className="text-xs font-semibold text-gray-700 ml-4 mb-1">Lastname</p>
                <input type="text" placeholder="Lastname"
                  className="w-full border border-gray-300 rounded-full px-4 py-2 focus:outline-none focus:ring-1 focus:ring-black"
                  value={lastname} onChange={(e) => setLastname(e.target.value)} required />

                <p className="text-xs font-semibold text-gray-700 ml-4 mb-1">Email</p>
                <input type="email" placeholder="Enter your email"
                  className="w-full border border-gray-300 rounded-full px-4 py-2 focus:outline-none focus:ring-1 focus:ring-black"
                  value={email} onChange={(e) => setEmail(e.target.value)} />

                <p className="text-xs font-semibold text-gray-700 ml-4 mb-1">Passward</p>
                <input type="password" placeholder="Enter your password"
                  className="w-full border border-gray-300 rounded-full px-4 py-2 focus:outline-none focus:ring-1 focus:ring-black"
                  value={password} onChange={(e) => setPassword(e.target.value)} />

                <p className="text-xs font-semibold text-gray-700 ml-4 mb-1">Confirm Passward</p>
                <input type="password" placeholder="Enter your password"
                  className="w-full border border-gray-300 rounded-full px-4 py-2 focus:outline-none focus:ring-1 focus:ring-black"
                  value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />

                {error && <p className="text-red-500 text-sm text-center">{error}</p>}

                <button type="submit"
                  disabled={submitting}
                  className="text-sm font-medium w-full bg-black text-white py-2 rounded-full w-75 mt-5 disabled:opacity-60 disabled:cursor-not-allowed">
                  {submitting ? "Sending OTP..." : "Sign Up"}
                </button>
              </form>
            </>
          )}

          {showOtp && (
            <form onSubmit={handleVerifyOtp} className="space-y-4 w-75 mx-auto text-sm ">
              <p className="text-center text-gray-500 text-xs mb-3">
                We sent a verification code to <br></br><strong>{email}</strong>
              </p>

              <p className="text-xs font-semibold text-gray-700 ml-2 mb-1">Enter OTP</p>
              <input  
                type="text"
                placeholder="Enter 6-digit OTP"
                maxLength={6}
                className="w-full border border-gray-300 rounded-full px-4 py-2 focus:outline-none focus:ring-1 focus:ring-black tracking-widest text-center"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
              />

              {otpError && <p className="text-red-500 text-sm text-center">{otpError}</p>}

              <button type="submit"
                className="text-sm font-medium w-full bg-black text-white py-2 rounded-full mt-5">
                Verify Email
              </button>

              <div className="flex justify-between items-center mt-2">
                <button
                  type="button"
                  onClick={() => { setShowOtp(false); setOtp(""); setOtpError(""); }}
                  className="text-xs text-gray-400 hover:text-black transition">
                  ← Back
                </button>
                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={resending}
                  className="text-xs text-gray-400 hover:text-black transition disabled:opacity-50">
                  {resending ? "Sending..." : "Resend OTP"}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}