import React, { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import logo from "../assets/LogoPowerpay.png";

const Header = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <header className="bg-gradient-to-r from-orange-500 to-orange-600 shadow-[1px_1px_6px_black] fixed min-w-[100%] top-0 z-50">
      <div className=" px-[8px] py-[11px] sm:max-w-[88rem] mx-auto px-6 py-4 flex flex-wrap justify-between items-center text-white">
        {/* Logo */}
        <Link
          to="/"
          className="text-2xl font-extrabold tracking-widest hover:scale-105 transition-transform"
        >
          {/* Power<span className="text-yellow-300">Pe</span> */}
          <img src={logo} alt="logo" className="w-[145px]" />
        </Link>

        {/* Navigation */}
        {!user ? (
          <nav className="space-x-4 font-semibold text-yellow-200">
            <Link to="/login" className="hover:text-white transition">
              Login
            </Link>
            <span>|</span>
            <Link
              to="/register"
              className="text-white hover:text-white transition"
            >
              Register
            </Link>
          </nav>
        ) : (
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 items-start sm:items-center">
            {/* User Info */}
            <span className="text-yellow-100 font-medium">
              Welcome, <span className="underline">{user.name}</span>{" "}
              <span className="text-sm opacity-80">({user.role})</span>
            </span>

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="px-4 py-2 rounded-full bg-gradient-to-r from-orange-600 to-yellow-500 text-white font-semibold shadow-md hover:shadow-lg transition transform hover:scale-105"
              title="Logout"
              aria-label="Logout"
            >
              Logout
            </button>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
