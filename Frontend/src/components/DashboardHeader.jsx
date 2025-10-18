import React, { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { UserCircleIcon } from "@heroicons/react/24/solid";
import logo from "../assets/LogoPowerpay.png"

const DashboardHeader = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  if (!user) return null;

  return (
    <div className="relative z-10 mb-6">
       {/* <img
      src={logo}  // ✅ or external URL
      alt="PowerPe Logo"
      className="w-[auto] h-10 mx-[auto] mb-4 "
    /> */}
      <div className="flex items-center justify-between mb-2">
        {/* Profile info */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-white/30">
            {user.profilePic ? (
              <img
                src={user.profilePic}
                alt="Profile"
                className="w-full h-full object-cover"
              />
            ) : (
              <UserCircleIcon className="w-full h-full text-white/80" />
            )}
          </div>
          <span className="text-white font-semibold">{user.name}</span>
        </div>

        {/* Logout button */}
        <button
          onClick={handleLogout}
          className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 shadow-md transition"
        >
          Logout
        </button>
      </div>

      <hr className="border-t border-white/20" />
    </div>
  );
};

export default DashboardHeader;
