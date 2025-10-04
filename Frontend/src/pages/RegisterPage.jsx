import React, { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { EyeIcon, EyeSlashIcon, XMarkIcon } from "@heroicons/react/24/solid"; 
import logo from "../assets/LogoPowerpay.png";

const GlassCard = ({ children, className }) => (
  <div
    className={`bg-white/10 backdrop-blur-2xl border border-white/20 shadow-lg rounded-2xl ${className}`}
  >
    {children}
  </div>
);

const FormInput = ({ showToggle, value, onChange, name, placeholder, type, minLength }) => {
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
        minLength={minLength}
        className="w-full px-4 py-3 pr-10 bg-black/20 border border-white/20 rounded-lg placeholder-gray-400 text-white focus:outline-none focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400 transition duration-300"
      />
      {showToggle && (
        <button
          type="button"
          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-yellow-400 !bg-none !bg-transparent !shadow-none"
          onClick={() => setShowPassword(!showPassword)}
        >
          {showPassword ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
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

const RegisterPage = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "customer",
  });
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const { name, email, password, confirmPassword, role } = formData;

  const onChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");

    if (password.length < 8) {
      setError("Password must be at least 8 characters long!");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match!");
      return;
    }

    try {
      await axios.post("http://localhost:8000/api/auth/register", {
        name,
        email,
        password,
        role,
      });

      setSuccessMsg("Registration successful! Redirecting to login...");
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-tr from-[#232526] to-[#414345] text-white p-4 overflow-hidden">
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

        <GlassCard className="p-8">
          <form
            onSubmit={handleSubmit}
            className="space-y-6"
            aria-label="Register Form"
          >
            <h2 className="text-3xl font-semibold text-white text-center">
              Create Account
            </h2>

            {/* Alert with Close Button */}
            {(error || successMsg) && (
              <div className={`flex items-center justify-center gap-3 w-full`}>
                {(error || successMsg) && (
                  <div
                    className={`flex items-center justify-center gap-3 w-full px-3 py-2 rounded text-sm border ${
                      error
                        ? "bg-red-500/30 border-red-500 text-red-200"
                        : "bg-green-500/30 border-green-400 text-green-200"
                    }`}
                    role="alert"
                  >
                    <button
                      type="button"
                      onClick={() => {
                        setError("");
                        setSuccessMsg("");
                      }}
                      className="text-white hover:text-gray-200 flex-shrink-0 !p-0 !bg-none !bg-transparent !shadow-none !none"
                    >
                      <XMarkIcon className="w-5 h-5 sm:w-6 sm:h-6 text-transparent" />
                    </button>
                    <span className="flex-1 text-center">{error || successMsg}</span>
                    <button
                      type="button"
                      onClick={() => {
                        setError("");
                        setSuccessMsg("");
                      }}
                      className="text-white hover:text-gray-200 flex-shrink-0 !p-0 !bg-none !bg-transparent !shadow-none !none"
                    >
                      <XMarkIcon className="w-5 h-5 sm:w-6 sm:h-6 " />
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Name */}
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-300 mb-1"
              >
                Name
              </label>
              <FormInput
                type="text"
                id="name"
                name="name"
                value={name}
                onChange={onChange}
                required
                placeholder="Your full name"
              />
            </div>

            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-300 mb-1"
              >
                Email
              </label>
              <FormInput
                type="email"
                id="email"
                name="email"
                value={email}
                onChange={onChange}
                required
                placeholder="you@example.com"
              />
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-300 mb-1"
              >
                Password
              </label>
              <FormInput
                showToggle
                id="password"
                name="password"
                value={password}
                onChange={onChange}
                placeholder="Create a strong password"
                minLength={8}
              />
            </div>

            {/* Confirm Password */}
            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-gray-300 mb-1"
              >
                Confirm Password
              </label>
              <FormInput
                showToggle
                id="confirmPassword"
                name="confirmPassword"
                value={confirmPassword}
                onChange={onChange}
                placeholder="Re-enter your password"
                minLength={8}
              />
            </div>

            {/* Role */}
            <div>
              <label
                htmlFor="role"
                className="block text-sm font-medium text-gray-300 mb-1"
              >
                Role
              </label>
              <FormSelect
                id="role"
                name="role"
                value={role}
                onChange={onChange}
              >
                <option value="customer" className="bg-[#414345] text-white">
                  Customer
                </option>
                <option value="admin" className="bg-[#414345] text-white">
                  Admin
                </option>
              </FormSelect>
            </div>

            <button
              type="submit"
              className="w-full flex justify-center py-3 px-6 bg-yellow-500 hover:bg-yellow-600 text-white font-semibold rounded-md shadow-md transition duration-300"
            >
              Register
            </button>

            <p className="text-center text-gray-300 text-sm">
              Already have an account?{" "}
              <Link
                to="/login"
                className="text-yellow-400 hover:text-yellow-300 transition font-semibold"
              >
                Sign In
              </Link>
            </p>
          </form>
        </GlassCard>
      </motion.div>
    </div>
  );
};

export default RegisterPage;
