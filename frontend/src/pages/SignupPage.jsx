import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Mail, Lock, User, ArrowRight, Eye, EyeOff } from "lucide-react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-toastify";

const SignupPage = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});

  const { user, login } = useAuth();
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
    const newErrors = {};
    
    if (!name.trim()) {
      newErrors.name = "Name is required";
    }
    
    if (!email.trim()) {
      newErrors.email = "Email is required";
    } else if (!validateEmail(email)) {
      newErrors.email = "Please enter a valid email address";
    }
    
    if (!password) {
      newErrors.password = "Password is required";
    } else if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }
    
    if (!confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsLoading(true);

    try {
      const API_URL =
        import.meta.env.VITE_API_URL || "http://localhost:5001";

      await axios.post(`${API_URL}/api/users`, {
        name,
        email,
        password,
      });

      toast.success("Account created successfully 🌿");

      await login(email, password);
      navigate("/");
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Registration failed"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8faf8] flex items-center justify-center px-6">

      <div className="grid md:grid-cols-2 w-full max-w-6xl bg-white rounded-3xl shadow-xl overflow-hidden">

        {/* Left Branding Section */}
        <div className="hidden md:flex flex-col justify-center bg-[#e8f5e9] p-12">

          <h1 className="text-4xl font-black text-[#064e3b] mb-4">
            Reverse Rituals 🌿
          </h1>

          <p className="text-[#064e3b]/80 text-lg">
            Join our herbal haircare journey and experience
            natural ingredients for stronger and healthier hair.
          </p>

          <div className="mt-10">
            <img
              src="/Hero.png"
              alt="haircare"
              className=""
              loading="lazy"
            />
          </div>
        </div>

        {/* Signup Form */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-10 md:p-14 flex flex-col justify-center"
        >
          <h2 className="text-3xl font-bold text-gray-800 mb-2">
            Create Account
          </h2>

          <p className="text-gray-500 mb-8">
            Start your Reverse Rituals journey today
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">

            {/* Name */}
            <div>
              <label className="text-gray-600 text-sm">
                Full Name
              </label>

              <div className="flex items-center border rounded-xl mt-2 px-4 py-3 focus-within:border-[#c5a059]">
                <User className="text-gray-400" size={18} />
                <input
                  type="text"
                  placeholder="Enter your name"
                  className="w-full ml-3 outline-none"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
                {name && (
                  <button
                    type="button"
                    onClick={() => setName("")}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    ✕
                  </button>
                )}
              </div>
              {errors.name && (
                <p className="text-red-500 text-xs mt-1">{errors.name}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="text-gray-600 text-sm">
                Email Address
              </label>

              <div className="flex items-center border rounded-xl mt-2 px-4 py-3 focus-within:border-[#c5a059]">
                <Mail className="text-gray-400" size={18} />
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="w-full ml-3 outline-none"
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
              {errors.email && (
                <p className="text-red-500 text-xs mt-1">{errors.email}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="text-gray-600 text-sm">
                Password
              </label>

              <div className="flex items-center border rounded-xl mt-2 px-4 py-3 focus-within:border-[#c5a059]">
                <Lock className="text-gray-400" size={18} />
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
              {errors.password && (
                <p className="text-red-500 text-xs mt-1">{errors.password}</p>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="text-gray-600 text-sm">
                Confirm Password
              </label>

              <div className="flex items-center border rounded-xl mt-2 px-4 py-3 focus-within:border-[#c5a059]">
                <Lock className="text-gray-400" size={18} />
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm your password"
                  className="w-full ml-3 outline-none"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>
              )}
            </div>

            {/* Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#064e3b] hover:bg-[#053d2f] text-white py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>Creating Account...</>
              ) : (
                <>Sign Up <ArrowRight size={18} /></>
              )}
            </button>
          </form>

          {/* Login Link */}
          <div className="mt-8 text-center">
            <p className="text-gray-500">
              Already have an account?
            </p>

            <Link
              to="/login"
              className="text-[#c5a059] font-semibold hover:underline"
            >
              Sign in here
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default SignupPage;