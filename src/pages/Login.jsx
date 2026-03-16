import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import { useGoogleLogin } from "@react-oauth/google";
import { context } from "../App";
import { useContext } from "react";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const { setUser } = useContext(context);

  const AUTH_URL = "https://localhost:7177/api/usersauth";

  const handleSubmit = async (e) => {
  e.preventDefault();

  if (!email || !password) {
    setError("Please fill in all fields");
    return;
  }

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailPattern.test(email)) {
    setError("Enter a valid email address");
    return;
  }

  // const passwordPattern = /^(?=.*[A-Z])(?=.*\d).{8,}$/;
  // if (!passwordPattern.test(password)) {
  //   setError(
  //     "Password must be at least 8 characters long, include one uppercase letter and one number"
  //   );
  //   return;
  // }

  try {
    const formData = new FormData();
    formData.append("Email", email.trim());
    formData.append("Password", password);

    const res = await axios.post(`${AUTH_URL}/login`, formData,{
     withCredentials: true,
    });
  

    if(res.data.success){
      const userData = res.data.data;
      const token =  userData.token;
      const payload = JSON.parse(atob(token.split(".")[1]));
      const roleId = payload.role;  

      if(roleId == 2)
      {

      localStorage.setItem("admin", JSON.stringify({email, token}));

      toast.success("Admin Login Successful!", {
        style: {
          borderRadius: "10px",
          background: "#fff",
          color: "#111",
          border: "1px solid #ddd",
          fontWeight: "normal",
        },
        iconTheme: { primary: "#111", secondary: "#fff" },
      });

      setTimeout(() => navigate("/admin/dashboard"), 1000);
    }else{
    localStorage.setItem("user", JSON.stringify({ email, token }));
          setUser({ email, token });
          toast.success("Login Successful!", {
            style: {
              borderRadius: "10px",
              background: "#fff",
              color: "#111",
              border: "1px solid #ddd",
              fontWeight: "normal",
            },
            iconTheme: { primary: "#111", secondary: "#fff" },
          });
          setTimeout(() => navigate("/"), 1000);
        }
      }
        else{
        setError(res.data.message || "Invalid email or password");
        }
         } catch (err) {
      const msg = err.response?.data?.message || "Something went wrong. Try again later.";
      setError(msg);
    }
   };
   

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
  
        const newUser = await axios.post("http://localhost:5000/users", {
          ...googleUser,
          blocked: false, 
        });
        user = newUser.data;
      } else {
        user = res.data[0];

        if (user.blocked) {
          toast.error("Your account has been blocked by the admin", {
            style: {
              borderRadius: "10px",
              background: "#fff",
              color: "#111",
              border: "1px solid #ddd",
              fontWeight: "normal",
            },
            iconTheme: { primary: "#111", secondary: "#fff" },
          });
          return;
        }
      }

      localStorage.setItem("user", JSON.stringify(user));
      setUser(user);

      toast.success(`Welcome ${googleUser.name}`, {
        style: {
          borderRadius: "10px",
          background: "#fff",
          color: "#111",
          border: "1px solid #ddd",
          fontWeight: "normal",
        },
        iconTheme: { primary: "#111", secondary: "#fff" },
      });

      navigate("/");
    } catch (err) {
      console.error("Google login failed:", err);
      toast.error("Google login failed. Try again later.", {
        style: {
          borderRadius: "10px",
          background: "#fff",
          color: "#111",
          border: "1px solid #ddd",
          fontWeight: "normal",
        },
        iconTheme: { primary: "#111", secondary: "#fff" },
      });
    }
  },
  onError: () => {
    toast.error("Google login failed");
  },
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
        <div className="flex-1 bg-white rounded-l-3xl flex flex-col justify-center md:py-22 md:px-15 py-15 w-full items-center">
          <div className="mb-8 text-center">
            <h1
              id="logo-texta"
              className="text-2xl font-semibold text-gray-800 font-GFS Didot serif"
            >
              Marqelle
            </h1>
            <p className="text-gray-500 text-1xl text-sm leading-loose">
              Where class meets comfort.
            </p>
          </div>
          <div className="flex justify-center mb-8 bg-gray-200 rounded-full p-1 w-75 h-10 mx-auto gap-1">
            <button
              className="w-1/2 flex items-center justify-center text-center py-2 text-sm font-medium rounded-full transition-all duration-300 bg-black text-white shadow-md"
              onClick={() => navigate("/login")}
            >
              LogIn
            </button>
            <button
              className="w-1/2 flex items-center justify-center text-center py-2 text-sm font-medium rounded-full text-black hover:bg-gray-300"
              onClick={() => navigate("/signup")}
            >
              Sign Up
            </button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4 w-75 mx-auto text-sm">
            <p className="text-xs font-semibold text-gray-700 ml-4 mb-1">Email</p>
            <input
              type="email"
              placeholder="Enter your email"
              className="w-full border border-gray-300 rounded-full px-4 py-2 focus:outline-none focus:ring-1 focus:ring-black"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            
            <p className="text-xs font-semibold text-gray-700 ml-4 mb-1">Passward</p>
            <input
              type="password"
              placeholder="Enter your password"
              className="w-full border border-gray-300 rounded-full px-4 py-2 focus:outline-none focus:ring-1 focus:ring-black"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            {error && <p className="text-red-500 text-sm text-center">{error}</p>}

            <button
              type="submit"
              className="text-sm font-medium w-full bg-black text-white py-2 rounded-full w-75"
            >
              Login
            </button>

            <div className="flex items-center gap-2">
              <hr className="flex-grow border-gray-300" />
              <span className="text-gray-400 text-xs">OR</span>
              <hr className="flex-grow border-gray-300" />
            </div>

            <button className="w-full flex items-center justify-center border border-gray-300 py-1 rounded-full hover:bg-gray-100 gap-2"
             onClick={() => loginWithGoogle()}>
              <lord-icon
                src="https://cdn.lordicon.com/dbvisxjw.json"
                trigger="hover"
                style={{
                  width: "30px",
                  height: "30px",
                  primary: "#ffffff",
                  secondary: "#2ca58d",
                  tertiary: "#ffc738",
                  quaternary: "#4bb3fd",
                  quinary: "#f24c00",
                }}
              ></lord-icon>
              Continue with Google
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
