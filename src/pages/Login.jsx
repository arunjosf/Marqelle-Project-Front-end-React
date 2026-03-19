import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import { useGoogleLogin } from "@react-oauth/google";
import { context } from "../App";
import { useContext } from "react";

const AUTH_URL = "https://localhost:7177/api/usersauth";
const TOAST_STYLE = {
  style: { borderRadius: "10px", background: "#fff", color: "#111", border: "1px solid #ddd", fontWeight: "normal" },
  iconTheme: { primary: "#111", secondary: "#fff" },
};

export default function Login() {
  const navigate = useNavigate();
  const { setUser } = useContext(context);

  // ── Login fields ──
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  // ── Forgot password steps: null | "email" | "otp" ──
  const [forgotStep, setForgotStep] = useState(null);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotOtp, setForgotOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [forgotError, setForgotError] = useState("");
  const [forgotLoading, setForgotLoading] = useState(false);

  // ── Login ─────────────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email || !password) { setError("Please fill in all fields"); return; }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email)) { setError("Enter a valid email address"); return; }

    try {
      const formData = new FormData();
      formData.append("Email", email.trim());
      formData.append("Password", password);

      const res = await axios.post(`${AUTH_URL}/login`, formData, { withCredentials: true });

      if (res.data.success) {
        const userData = res.data.data;
        const token = userData.token;
        const payload = JSON.parse(atob(token.split(".")[1]));
        const roleId = payload.role;

        if (roleId == 2) {
          localStorage.setItem("admin", JSON.stringify({ email, token }));
          toast.success("Admin Login Successful!", TOAST_STYLE);
          setTimeout(() => navigate("/admin/dashboard"), 1000);
        } else {
          localStorage.setItem("user", JSON.stringify({ email, token }));
          setUser({ email, token });
          toast.success("Login Successful!", TOAST_STYLE);
          setTimeout(() => navigate("/"), 1000);
        }
      } else {
        setError(res.data.message || "Invalid email or password");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong. Try again later.");
    }
  };

  // ── Forgot Password — Step 1: Send OTP ───────────────────────────────────
  const handleSendOtp = async (e) => {
    e.preventDefault();
    setForgotError("");

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!forgotEmail.trim() || !emailPattern.test(forgotEmail)) {
      setForgotError("Enter a valid email address");
      return;
    }

    setForgotLoading(true);
    try {
      await axios.post(`${AUTH_URL}/forgot-password/send-otp?email=${forgotEmail.trim()}`);
      toast.success("OTP sent to your email!", TOAST_STYLE);
      setForgotStep("otp");
    } catch (err) {
      setForgotError(err.response?.data?.message || "Failed to send OTP.");
    } finally {
      setForgotLoading(false);
    }
  };

  // ── Forgot Password — Step 2: Verify OTP & Reset ─────────────────────────
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setForgotError("");

    if (!forgotOtp.trim()) { setForgotError("Please enter the OTP"); return; }

    const passwordPattern = /^(?=.*[A-Z])(?=.*\d).{8,}$/;
    if (!passwordPattern.test(newPassword)) {
      setForgotError("Password must be at least 8 characters, 1 uppercase & 1 number");
      return;
    }
    if (newPassword !== confirmNewPassword) { setForgotError("Passwords do not match"); return; }

    setForgotLoading(true);
    try {
      await axios.post(
        `${AUTH_URL}/forgot-password/verify-otp-reset?otpCode=${forgotOtp.trim()}&newPassword=${newPassword}`
      );
      toast.success("Password reset successfully! Please log in.", TOAST_STYLE);
      // Reset all forgot state and go back to login
      setForgotStep(null);
      setForgotEmail(""); setForgotOtp(""); setNewPassword(""); setConfirmNewPassword("");
    } catch (err) {
      setForgotError(err.response?.data?.message || "Invalid or expired OTP.");
    } finally {
      setForgotLoading(false);
    }
  };

  // ── Google Login ──────────────────────────────────────────────────────────
  const loginWithGoogle = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        const accessToken = tokenResponse.access_token;
        const googleUserRes = await axios.get("https://www.googleapis.com/oauth2/v3/userinfo", {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        const googleUser = {
          id: googleUserRes.data.sub,
          name: googleUserRes.data.name,
          email: googleUserRes.data.email,
          picture: googleUserRes.data.picture,
        };

        const res = await axios.get(`http://localhost:5000/users?email=${googleUser.email}`);
        let user;

        if (res.data.length === 0) {
          const newUser = await axios.post("http://localhost:5000/users", { ...googleUser, blocked: false });
          user = newUser.data;
        } else {
          user = res.data[0];
          if (user.blocked) {
            toast.error("Your account has been blocked by the admin", TOAST_STYLE);
            return;
          }
        }

        localStorage.setItem("user", JSON.stringify(user));
        setUser(user);
        toast.success(`Welcome ${googleUser.name}`, TOAST_STYLE);
        navigate("/");
      } catch (err) {
        console.error("Google login failed:", err);
        toast.error("Google login failed. Try again later.", TOAST_STYLE);
      }
    },
    onError: () => toast.error("Google login failed"),
  });

  return (
    <div className="flex h-screen items-center justify-center bg-gray-100">
      <div className="relative w-[800px] rounded-3xl shadow-2xl overflow-hidden flex gap-2 bg-white">
        <div
          className="hidden md:flex w-[420px] flex flex-col items-center justify-center text-center text-white relative overflow-hidden bg-cover rounded-3xl"
          style={{ backgroundImage: "url('src/assets/login3.png')" }}
        >
          <div className="mt-10 px-4 py-2 text-xs text-gray-300 bg-white/10 backdrop-blur-md rounded-full shadow-md border border-white/20 mt-110">
            © 2025 Marqelle. All rights reserved.
          </div>
        </div>

        <div className="flex-1 bg-white rounded-l-3xl flex flex-col justify-center md:py-15 md:px-15 py-15 w-full items-center">
          <div className="mb-7 text-center">
            <h1 id="logo-texta" className="text-2xl font-semibold text-gray-800 font-GFS Didot serif">Marqelle</h1>
            <p className="text-gray-500 text-1xl text-sm leading-loose">Where class meets comfort.</p>
          </div>

          {/* ── Normal Login ── */}
          {!forgotStep && (
            <>
              <div className="flex justify-center mb-6 bg-gray-200 rounded-full p-1 w-75 h-10 mx-auto gap-1">
                <button className="w-1/2 flex items-center justify-center text-center py-1 text-sm font-medium rounded-full transition-all duration-300 bg-black text-white shadow-md"
                  onClick={() => navigate("/login")}>LogIn</button>
                <button className="w-1/2 flex items-center justify-center text-center py-1 text-sm font-medium rounded-full text-black hover:bg-gray-300"
                  onClick={() => navigate("/signup")}>Sign Up</button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4 w-75 mx-auto text-sm">
                <p className="text-xs font-semibold text-gray-700 ml-4 mb-1">Email</p>
                <input type="email" placeholder="Enter your email"
                  className="w-full border border-gray-300 rounded-full px-4 py-2 focus:outline-none focus:ring-1 focus:ring-black"
                  value={email} onChange={(e) => setEmail(e.target.value)} />

                <p className="text-xs font-semibold text-gray-700 ml-4">Passward</p>
                <input type="password" placeholder="Enter your password"
                  className="w-full border border-gray-300 rounded-full px-4 py-2 focus:outline-none focus:ring-1 focus:ring-black"
                  value={password} onChange={(e) => setPassword(e.target.value)} />

                <div className="text-right">
                  <button type="button" onClick={() => { setForgotStep("email"); setError(""); }}
                    className="text-xs text-gray-500 hover:text-black transition">
                    Forgot password?
                  </button>
                </div>  

                {error && <p className="text-red-500 text-sm text-center">{error}</p>}

                <button type="submit"
                  className="text-sm font-medium w-full bg-black text-white py-2 rounded-full w-75">
                  Login
                </button>

                <div className="flex items-center gap-2">
                  <hr className="flex-grow border-gray-300" />
                  <span className="text-gray-400 text-xs">OR</span>
                  <hr className="flex-grow border-gray-300" />
                </div>

                <button className="w-full flex items-center justify-center border border-gray-300 py-1 rounded-full hover:bg-gray-100 gap-2"
                  onClick={() => loginWithGoogle()}>
                  <lord-icon src="https://cdn.lordicon.com/dbvisxjw.json" trigger="hover"
                    style={{ width: "30px", height: "30px", primary: "#ffffff", secondary: "#2ca58d", tertiary: "#ffc738", quaternary: "#4bb3fd", quinary: "#f24c00" }}>
                  </lord-icon>
                  Continue with Google
                </button>
              </form>
            </>
          )}

          {forgotStep === "email" && (
            <form onSubmit={handleSendOtp} className="space-y-4 w-75 mx-auto text-sm">
              <p className="text-center text-gray-500 text-xs mb-4">
                Enter your registered email and we'll send you an OTP to reset your password.
              </p>

              <p className="text-xs font-semibold text-gray-700 ml-4 mb-1">Email</p>
              <input type="email" placeholder="Enter your email"
                className="w-full border border-gray-300 rounded-full px-4 py-2 focus:outline-none focus:ring-1 focus:ring-black"
                value={forgotEmail} onChange={(e) => setForgotEmail(e.target.value)} />

              {forgotError && <p className="text-red-500 text-sm text-center">{forgotError}</p>}

              <button type="submit" disabled={forgotLoading}
                className="text-sm font-medium w-full bg-black text-white py-2 rounded-full disabled:opacity-60 disabled:cursor-not-allowed">
                {forgotLoading ? "Sending OTP..." : "Send OTP"}
              </button>

              <div className="text-center">
                <button type="button" onClick={() => { setForgotStep(null); setForgotError(""); }}
                  className="text-xs text-gray-400 hover:text-black transition">
                  ← Back to Login
                </button>
              </div>
            </form>
          )}

          {forgotStep === "otp" && (
            <form onSubmit={handleResetPassword} className="space-y-4 w-75 mx-auto text-sm">
              <p className="text-center text-gray-500 text-xs mb-2">
                Enter the OTP sent to <strong>{forgotEmail}</strong> and set your new password.
              </p>

              <p className="text-xs font-semibold text-gray-700 ml-4 mb-1">OTP</p>
              <input type="text" placeholder="Enter 6-digit OTP" maxLength={6}
                className="w-full border border-gray-300 rounded-full px-4 py-2 focus:outline-none focus:ring-1 focus:ring-black tracking-widest text-center"
                value={forgotOtp} onChange={(e) => setForgotOtp(e.target.value)} />

              <p className="text-xs font-semibold text-gray-700 ml-4 mb-1">New Password</p>
              <input type="password" placeholder="New password"
                className="w-full border border-gray-300 rounded-full px-4 py-2 focus:outline-none focus:ring-1 focus:ring-black"
                value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />

              <p className="text-xs font-semibold text-gray-700 ml-4 mb-1">Confirm New Password</p>
              <input type="password" placeholder="Confirm new password"
                className="w-full border border-gray-300 rounded-full px-4 py-2 focus:outline-none focus:ring-1 focus:ring-black"
                value={confirmNewPassword} onChange={(e) => setConfirmNewPassword(e.target.value)} />

              {forgotError && <p className="text-red-500 text-sm text-center">{forgotError}</p>}

              <button type="submit" disabled={forgotLoading}
                className="text-sm font-medium w-full bg-black text-white py-2 rounded-full disabled:opacity-60 disabled:cursor-not-allowed">
                {forgotLoading ? "Resetting..." : "Reset Password"}
              </button>

              <div className="flex justify-between">
                <button type="button" onClick={() => { setForgotStep("email"); setForgotError(""); }}
                  className="text-xs text-gray-400 hover:text-black transition">
                  ← Back
                </button>
                <button type="button" onClick={handleSendOtp} disabled={forgotLoading}
                  className="text-xs text-gray-400 hover:text-black transition disabled:opacity-50">
                  Resend OTP
                </button>
              </div>
            </form>
          )}

        </div>
      </div>
    </div>
  );
}