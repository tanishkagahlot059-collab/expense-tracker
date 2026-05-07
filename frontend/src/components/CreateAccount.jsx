import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { Eye, EyeOff, User, Lock } from "lucide-react";

const CreateAccount = ({ API_URL = import.meta.env.VITE_API_URL }) => {
  const { state } = useLocation();
  const navigate = useNavigate();

  const email = state?.email;

  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // ✅ SAFE REDIRECT (fix)
  useEffect(() => {
    if (!email) {
      navigate("/verify-email");
    }
  }, [email, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name || !password) {
      return alert("All fields are required");
    }

    if (password.length < 8) {
      return alert("Password must be at least 8 characters");
    }

    try {
      setLoading(true);

      await axios.post(`${API_URL}/api/user/register`, {
        name,
        email,
        password,
      });

      alert("Account created 🎉");
      navigate("/login");
    } catch (err) {
      alert(err.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-lg overflow-hidden">
        
        {/* HEADER */}
        <div className="bg-gradient-to-r from-green-400 to-teal-500 text-white text-center py-6">
          <div className="w-14 h-14 mx-auto bg-white/20 rounded-full flex items-center justify-center mb-2">
            <User className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-semibold">Create Account</h2>
          <p className="text-sm opacity-90">Complete your signup</p>
        </div>

        {/* FORM */}
        <form onSubmit={handleSubmit} className="p-6">
          
          <p className="text-center text-gray-500 text-sm mb-4 break-all">
            {email}
          </p>

          {/* NAME */}
          <div className="relative mb-4">
            <User className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full pl-10 border p-2 rounded-lg focus:ring-2 focus:ring-teal-400 outline-none"
            />
          </div>

          {/* PASSWORD */}
          <div className="relative mb-4">
            <Lock className="absolute left-3 top-3 w-5 h-5 text-gray-400" />

            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-10 pr-10 border p-2 rounded-lg focus:ring-2 focus:ring-teal-400 outline-none"
            />

            <div
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-3 cursor-pointer text-gray-400"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </div>
          </div>

          {/* BUTTON */}
          <button
            disabled={loading}
            className="w-full bg-gradient-to-r from-green-400 to-teal-500 text-white py-2 rounded-lg font-medium hover:opacity-90 transition"
          >
            {loading ? "Creating..." : "Create Account"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateAccount;