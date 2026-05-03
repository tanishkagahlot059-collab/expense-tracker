import React, { useState, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Mail } from "lucide-react";
import { motion } from "framer-motion";

const VerifyEmail = ({ API_URL = "http://localhost:4000/api"}) => {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [verified, setVerified] = useState(false);
  const [loading, setLoading] = useState(false);

  const inputsRef = useRef([]);
  const navigate = useNavigate();

  // SEND OTP
  const handleSendOtp = async () => {
    if (!email) return alert("Enter email first");

    try {
      setLoading(true);
      const res = await axios.post(`${API_URL}/api/user/send-otp`, { email });

      if (res.data.success) {
        setIsOtpSent(true);
      }
    } catch (err) {
      alert(err.response?.data?.message || "Error sending OTP");
    } finally {
      setLoading(false);
    }
  };

  // HANDLE OTP INPUT
  const handleChange = (value, index) => {
    if (!/^[0-9]?$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  // BACKSPACE
  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  };

  // VERIFY OTP
  const handleVerifyOtp = async () => {
    const finalOtp = otp.join("");

    if (finalOtp.length < 6) return alert("Enter complete OTP");

    try {
      setLoading(true);

      const res = await axios.post(`${API_URL}/api/user/verify-otp`, {
        email,
        otp: finalOtp,
      });

      if (res.data.success) {
        setVerified(true);

        setTimeout(() => {
          navigate("/create-account", { state: { email } });
        }, 1200);
      }
    } catch (err) {
      alert("Invalid OTP");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-sm bg-white rounded-2xl shadow-xl overflow-hidden"
      >

        {/* HEADER */}
        <div className="bg-gradient-to-r from-green-400 to-teal-500 text-white text-center py-6">
          <h2 className="text-xl font-semibold">Verify Email</h2>
          <p className="text-sm opacity-90">
            Enter your email to receive OTP
          </p>
        </div>

        <div className="p-6">

          {/* EMAIL */}
          <div className="relative mb-4">
            <Mail className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
            <input
              type="email"
              placeholder="Enter Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-10 border p-2 rounded-lg focus:ring-2 focus:ring-teal-400 outline-none"
            />
          </div>

          {/* SEND OTP */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleSendOtp}
            disabled={loading}
            className="w-full bg-gradient-to-r from-green-400 to-teal-500 text-white py-2 rounded-lg mb-4"
          >
            {loading ? "Sending..." : "Send OTP"}
          </motion.button>

          {/* OTP SECTION */}
          {isOtpSent && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <p className="text-xs text-gray-500 text-center mb-3">
                Enter 6-digit OTP sent to your email
              </p>

              <div className="flex justify-between mb-4">
                {otp.map((digit, index) => (
                  <motion.input
                    key={index}
                    initial={{ scale: 0.9 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: index * 0.05 }}
                    type="text"
                    maxLength="1"
                    value={digit}
                    ref={(el) => (inputsRef.current[index] = el)}
                    onChange={(e) => handleChange(e.target.value, index)}
                    onKeyDown={(e) => handleKeyDown(e, index)}
                    className="w-10 h-10 text-center border rounded-lg text-lg focus:ring-2 focus:ring-teal-400 outline-none"
                  />
                ))}
              </div>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleVerifyOtp}
                disabled={loading}
                className="w-full bg-teal-500 text-white py-2 rounded-lg"
              >
                {loading ? "Verifying..." : "Verify OTP"}
              </motion.button>
            </motion.div>
          )}

          {/* SUCCESS */}
          {verified && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="text-green-600 text-center mt-3 font-medium"
            >
              ✅ OTP Verified
            </motion.div>
          )}

        </div>
      </motion.div>
    </div>
  );
};

export default VerifyEmail;