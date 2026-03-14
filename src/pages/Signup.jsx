import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";

export default function Signup() {
  const navigate = useNavigate();
  const [firstname, setFirstname] = useState("");
  const [lastname, setLastname] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!firstname || !lastname || !email || !password) {
      setError("Please fill in all fields");
      return;
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email)) {
      setError("Enter a valid email address");
      return;
    }

    const passwordPattern = /^(?=.*[A-Z])(?=.*\d).{8,}$/;
    if (!passwordPattern.test(password)) {
      setError(
        "Password must be at least 8 characters long, 1 uppercase letter & 1 number"
      );
      return;
    }

    try {
      const existingUser = await axios.get(
        `http://localhost:5000/users?email=${email}`
      );

      if (existingUser.data.length > 0) {
        setError("User already exists with this email");
        return;
      }

      const newUser = {
        id: Date.now(),
        firstname,
        lastname,
        email,
        password,
      };

      await axios.post("http://localhost:5000/users", newUser);

        toast.success("Sign up Successful!", {
          style: {
            borderRadius: "10px",
            background: "#fff",
            color: "#111",
            border: "1px solid #ddd",
            fontWeight: "normal",
          },
          iconTheme: {
            primary: "#111",
            secondary: "#fff",
          },
        });

        setTimeout(() => navigate("/login"), 1000);
    } catch (err) {
      console.error(err);
      setError("Something went wrong. Please try again later.");
    }
  };

   
  return (
    <div className="flex h-screen items-center justify-center bg-gray-100">
      <div className="relative w-[800px] rounded-3xl shadow-2xl overflow-hidden flex gap-2 bg-white">
        <div
          className="hidden md:flex w-[420px] flex flex-col items-center justify-center text-center text-white relative overflow-hidden bg-cover rounded-3xl"
          style={{ backgroundImage: "url('src/assets/signup2.png')" }}>
          <div
            className="mt-15 px-4 py-2 text-xs text-gray-300 bg-white/10 backdrop-blur-md rounded-full shadow-md border border-white/20 mt-110">
            © 2025 Marqelle. All rights reserved.
          </div>
        </div>

        <div className="flex-1 bg-white rounded-l-3xl p-8 flex flex-col justify-center md:py-10 md:px-15 py-15">
          <div className="mb-8 text-center">
            <h1
              id="logo-text"
              className="text-2xl font-semibold text-gray-800">Marqelle</h1>
            <p className="text-gray-500 text-1xl text-sm leading-loose">Experience the perfect fit</p>
          </div>

          <div className="flex justify-center mb-8 bg-gray-200 rounded-full p-1 w-75 h-10 mx-auto gap-1">
            <button
              className="w-1/2 flex items-center justify-center text-center py-2 text-sm font-medium rounded-full text-black hover:rounded-full hover:transition-all hover:duration-300 hover:bg-gray-300"
              onClick={() => navigate("/login")}>
              LogIn
            </button>
            <button
              className="w-1/2 flex items-center justify-center text-center py-2 text-sm font-medium rounded-full transition-all duration-300 bg-black text-white shadow-md"
              onClick={() => navigate("/signup")}>Sign Up</button>
          </div>

          
          <form onSubmit={handleSubmit} className="space-y-4 w-75 mx-auto text-sm">
            <p className="text-xs font-semibold text-gray-700 ml-4 mb-1">Firstname</p>
            <input
              type="text"
              placeholder="Firstname"
              className="w-full border border-gray-300 rounded-full px-4 py-2 focus:outline-none focus:ring-1 focus:ring-black"
              value={firstname}
              onChange={(e) => setFirstname(e.target.value)}
              required
            />
            
            <p className="text-xs font-semibold text-gray-700 ml-4 mb-1">Lastname</p>
            <input
              type="text"
              placeholder="Lastname"
              className="w-full border border-gray-300 rounded-full px-4 py-2 focus:outline-none focus:ring-1 focus:ring-black"
              value={lastname}
              onChange={(e) => setLastname(e.target.value)}
              required
            />
            
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

            {error && (
              <p className="text-red-500 text-sm text-center">{error}</p>
            )}

            <button
              type="submit"
              className="text-sm font-medium w-full bg-black text-white py-2 rounded-full w-75 mt-5">
              Sign Up
            </button>

            <div className="flex items-center gap-2">
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
