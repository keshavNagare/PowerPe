import React, { useState, useContext } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { motion } from "framer-motion";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/solid";
import logo from "../assets/LogoPowerpay.png";
import { XMarkIcon } from "@heroicons/react/24/solid"; // for close button

const GlassCard = ({ children, className }) => (
  <div
    className={`bg-white/10 backdrop-blur-2xl border border-white/20 shadow-lg rounded-2xl ${className}`}
  >
    {children}
  </div>
);

const FormInput = ({
  showToggle,
  value,
  onChange,
  name,
  placeholder,
  type,
}) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="relative">
      <input
        type={showToggle ? (showPassword ? "text" : "password") : type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required
        className="w-full px-4 py-3 pr-10 bg-black/20 border border-white/20 rounded-lg placeholder-gray-400 text-white focus:outline-none focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400 transition duration-300"
      />
      {showToggle && (
        <button
          type="button"
          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-yellow-400 !bg-none !bg-transparent !shadow-none"
          onClick={() => setShowPassword(!showPassword)}
        >
          {showPassword ? (
            <EyeSlashIcon className="w-5 h-5" />
          ) : (
            <EyeIcon className="w-5 h-5" />
          )}
        </button>
      )}
    </div>
  );
};

const FormSelect = (props) => (
  <select
    {...props}
    className={`w-full px-4 py-3 bg-black/20 border border-white/20 rounded-lg text-white focus:outline-none focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400 transition duration-300 ${props.className}`}
  >
    {props.children}
  </select>
);

const PrimaryButton = ({ children, ...props }) => (
  <button
    {...props}
    className={`w-full bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-3 px-4 rounded-lg transition duration-300 shadow-lg flex items-center justify-center disabled:opacity-50 ${props.className} `}
  >
    {children}
  </button>
);

const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("customer");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const res = await axios.post("http://localhost:8000/api/auth/login", {
        email,
        password,
      });

      if (res.data.role !== role) {
        setError(`Login failed: You are not registered as ${role}`);
        return;
      }

      const userData = {
        name: res.data.name,
        email: res.data.email,
        role: res.data.role,
      };

      login(res.data.token, userData);

      if (role === "admin") {
        navigate("/admin/dashboard");
      } else {
        navigate("/customer/dashboard");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-tr from-[#232526] to-[#414345] text-white p-4 overflow-hidden">
      {/* Decorative Blurred Shapes */}
      <div className="absolute w-96 h-96 bg-yellow-500 rounded-full filter blur-3xl opacity-30 top-[-100px] left-[-100px]"></div>
      <div className="absolute w-72 h-72 bg-yellow-500 rounded-full filter blur-3xl opacity-30 bottom-[0px] right-[0px]"></div>

      <motion.div
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="mb-8 flex flex-col justify-center items-center">
          <h1 className="text-5xl font-bold tracking-wider bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-indigo-400">
            <Link
              to="/"
              className="text-2xl font-extrabold tracking-widest hover:scale-105 transition-transform"
            >
              <img src={logo} alt="logo" className="w-[220px]" />
            </Link>
          </h1>
          <p className="text-indigo-200">Your Digital Electricity Bill Hub</p>
        </div>

        <GlassCard>
          <form
            onSubmit={handleSubmit}
            className="space-y-6 p-8"
            aria-label="Login Form"
          >
            <h2 className="text-3xl font-semibold text-white text-center">
              Welcome Back
            </h2>

            {/* Error Message with Close Button */}
            {error && (
              
              <div
                className="bg-red-500/30 border border-red-500 text-red-200 px-4 py-3 rounded-lg text-sm flex items-center justify-between"
                role="alert"
              >
                <button
                  type="button"
                  onClick={() => setError("")}
                  className="mr-4 text-red-200 hover:text-white flex-shrink-0 !bg-none !bg-transparent !shadow-none !none"
                >
                  <XMarkIcon className="w-5 h-5 sm:w-6 sm:h-6 text-transparent" />
                </button>

                <span className="flex-1 text-center sm:text-center text-[1rem]">{error}</span>
                <button
                  type="button"
                  onClick={() => setError("")}
                  className="ml-4 text-red-200 hover:text-white flex-shrink-0 !bg-none !bg-transparent !shadow-none"
                >
                  <XMarkIcon className="w-5 h-5 sm:w-6 sm:h-6" />
                </button>
              </div>
            )}

            {/* Email */}
            <div className="space-y-2">
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-300"
              >
                Email address
              </label>
              <FormInput
                id="email"
                type="email"
                name="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
              />
            </div>

            {/* Password with show/hide toggle */}
            <div className="space-y-2">
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-300"
              >
                Password
              </label>
              <FormInput
                showToggle
                id="password"
                name="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
              />
            </div>

            {/* Role */}
            <div className="space-y-2">
              <label
                htmlFor="role"
                className="block text-sm font-medium text-gray-300"
              >
                Sign in as
              </label>
              <FormSelect
                id="role"
                value={role}
                onChange={(e) => setRole(e.target.value)}
              >
                <option value="customer" className="bg-[#414345] text-white">
                  Customer
                </option>
                <option value="admin" className="bg-[#414345] text-white">
                  Admin
                </option>
              </FormSelect>
            </div>

            <PrimaryButton type="submit">Sign In</PrimaryButton>

            <p className="text-center text-gray-300 text-sm">
              Don't have an account?{" "}
              <Link
                to="/register"
                className="text-yellow-400 hover:text-yellow-300 transition font-semibold"
              >
                Register
              </Link>
            </p>
          </form>
        </GlassCard>
      </motion.div>
    </div>
  );
};

export default LoginPage;
