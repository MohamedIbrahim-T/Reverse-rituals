import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Mail, Lock, LogIn, ArrowRight, Eye, EyeOff } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-toastify";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const { login, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) navigate("/");
  }, [user, navigate]);

  const [isLoading, setIsLoading] = useState(false);

  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const validateForm = () => {
    const newError = "";
    
    if (!email.trim()) {
      newError = "Email is required";
    } else if (!validateEmail(email)) {
      newError = "Please enter a valid email address";
    } else if (!password) {
      newError = "Password is required";
    }
    
    setError(newError);
    return !newError;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsLoading(true);

    const result = await login(email, password);
    setIsLoading(false);

    if (result.success) {
      toast.success("Welcome to Reverse Rituals 🌿");
      navigate("/");
    } else {
      toast.error(result.message);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8faf8] flex items-center justify-center px-6">

      {/* Page container */}
      <div className="grid md:grid-cols-2 w-full max-w-6xl bg-white rounded-3xl shadow-xl overflow-hidden">

        {/* Left Haircare Branding Section */}
        <div className="hidden md:flex flex-col justify-center bg-[#f0fdf4] p-12">

          <h1 className="text-4xl font-black text-[#064e3b] mb-4">
            Reverse Rituals 🌿
          </h1>

          <p className="text-[#064e3b]/80 text-lg leading-relaxed">
            Natural haircare for strong, healthy and beautiful hair.
            Experience herbal ingredients and premium care with every drop.
          </p>

          <div className="mt-10">
            <img
              src="/Hero.png"
              alt="haircare"
              className="rounded-2xl"
              loading="lazy"
            />
          </div>
        </div>

        {/* Login Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-10 md:p-14 flex flex-col justify-center"
        >
          {/* Header */}
          <div className="mb-10">
            <h2 className="text-3xl font-bold text-gray-800 mb-2">
              Welcome Back
            </h2>

<p className="text-[#064e3b]/60">
              Login to continue your haircare journey
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">

            {/* Email */}
            <div>
              <label className="text-[#064e3b]/70 text-sm">
                Email Address
              </label>

              <div className="flex items-center border rounded-xl mt-2 px-4 py-3 focus-within:border-[#c5a059]">
                <Mail className="text-[#064e3b]/50" size={18} />
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="w-full ml-3 outline-none text-[#064e3b]"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                {email && (
                  <button
                    type="button"
                    onClick={() => setEmail("")}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="text-[#064e3b]/70 text-sm">
                Password
              </label>

              <div className="flex items-center border rounded-xl mt-2 px-4 py-3 focus-within:border-[#c5a059]">
                <Lock className="text-[#064e3b]/50" size={18} />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  className="w-full ml-3 outline-none"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {error && (
              <p className="text-red-500 text-xs">{error}</p>
            )}

            {/* Forgot */}
            <div className="text-right">
              <Link
                to="/forgot-password"
                className="text-sm text-[#c5a059] hover:underline"
              >
                Forgot Password?
              </Link>
            </div>


            {/* Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#064e3b] hover:bg-[#053d2f] text-white py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>Logging in...</>
              ) : (
                <>Sign In <ArrowRight size={18} /></>
              )}
            </button>
          </form>

          {/* Signup */}
          <div className="mt-8 text-center">
            <p className="text-[#064e3b]/60">
              Don't have an account?
            </p>

            <Link
              to="/signup"
              className="text-[#c5a059] font-semibold hover:underline"
            >
              Create Free Account
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default LoginPage;