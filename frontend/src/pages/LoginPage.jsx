import React, { useContext, useEffect, useState } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import { BACKEND_URL } from "../constant.jsx";
import { Eye, EyeOff } from "lucide-react";
import { UserContext } from "../context/userContext.jsx";
import { useNavigate } from "react-router-dom";

const LoginPage = () => {
  const { setUser, user } = useContext(UserContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate("/");
    }
  }, [user]); // Added dependency array to avoid infinite re-renders

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await axios.post(`${BACKEND_URL}/hosp/login`, formData, {
        withCredentials: true,
      });

      if (response.data.success) {
        const { token, user } = response.data;
        Cookies.set("token", token, {
          expires: 7,
          secure: true,
          sameSite: "none",
        });

        Cookies.set("role", user.role, {
          expires: 7,
          secure: true,
          sameSite: "none",
        });

        console.log(`${user.role} Logged In Successfully:`, user);
        setUser(user); // ✅ Set user in context
        navigate("/"); // ✅ Redirect after login
      } else {
        setError(response.data.message || "Login failed");
      }
    } catch (error) {
      setError(error.response?.data?.message || "Something went wrong");
      console.error("Login Error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="w-[800px] h-[600px] p-12 bg-white rounded-2xl shadow-xl">
        <div className="mb-12 text-center">
          <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-blue-600 tracking-tight">
            Welcome Back
          </h1>
          <p className="mt-3 text-gray-500 text-lg">
            Enter your credentials to access your account
          </p>
        </div>
        {error && <p className="text-red-500 text-center">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="space-y-3">
            <label
              htmlFor="email"
              className="block text-base font-semibold text-gray-800"
            >
              Email Address
            </label>
            <input
              id="email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-5 py-4 text-base rounded-xl border border-gray-300 focus:ring-4 focus:ring-purple-100 focus:border-purple-600 outline-none transition-all duration-200 ease-in-out bg-gray-50 hover:bg-gray-50/80"
              placeholder="Enter your email address"
              required
            />
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <label
                htmlFor="password"
                className="block text-base font-semibold text-gray-800"
              >
                Password
              </label>
              <button
                type="button"
                className="text-sm font-medium text-purple-600 hover:text-purple-700 transition-colors"
              >
                Forgot password?
              </button>
            </div>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full px-5 py-4 text-base rounded-xl border border-gray-300 focus:ring-4 focus:ring-purple-100 focus:border-purple-600 outline-none transition-all duration-200 ease-in-out bg-gray-50 hover:bg-gray-50/80"
                placeholder="Enter your password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors p-1"
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>
          <button
            type="submit"
            className="w-full py-4 px-6 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl font-semibold text-base hover:opacity-90 transition-all duration-200 ease-in-out focus:outline-none focus:ring-4 focus:ring-purple-100 mt-6 shadow-lg shadow-purple-600/20"
            disabled={loading}
          >
            {loading ? "Logging In..." : "Sign in"}
          </button>
        </form>
        <p className="mt-10 text-center text-gray-600 text-base">
          Don't have an account?{" "}
          <a
            href="/register"
            className="text-purple-600 hover:text-purple-700 font-semibold transition-colors"
          >
            Create an account
          </a>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
