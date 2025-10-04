import React, { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { Link, useNavigate } from "react-router-dom";

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav className="w-full bg-gradient-to-r from-[#1f2937] to-[#374151] shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex flex-wrap items-center justify-between gap-4">
        {/* Brand */}
        <Link
          to="/"
          className="text-3xl font-extrabold text-white tracking-wide hover:scale-105 transition-transform duration-200"
        >
          Power<span className="text-yellow-400">Pe</span>
        </Link>

        {/* Navigation Items */}
        <div className="flex flex-wrap items-center gap-4">
          {!user ? (
            <>
              <Link
                to="/login"
                className="px-4 py-2 rounded-full text-white font-semibold border border-white hover:bg-white hover:text-gray-800 transition duration-200"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="px-4 py-2 rounded-full text-white font-semibold bg-yellow-400 hover:bg-yellow-300 hover:text-gray-900 transition duration-200"
              >
                Register
              </Link>
            </>
          ) : (
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 text-sm sm:text-base">
              <span className="text-white font-medium">
                Welcome,{" "}
                <span className="text-yellow-300 font-semibold underline underline-offset-2">
                  {user.name || user.username}
                </span>{" "}
                <span className="opacity-80">({user.role})</span>
              </span>
              <button
                onClick={handleLogout}
                className="px-4 py-2 rounded-full bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 text-white font-semibold shadow-md transition hover:shadow-lg transform hover:scale-105"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
