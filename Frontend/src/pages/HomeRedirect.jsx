import { useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

const HomeRedirect = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      // Redirect based on user role
      if (user.role === "admin") {
        navigate("/admin/dashboard", { replace: true });
      } else if (user.role === "customer") {
        navigate("/customer/dashboard", { replace: true });
      }
    } else {
      // If no user, send to login page
      navigate("/login", { replace: true });
    }
  }, [user, navigate]);

  return null; // nothing to display, just redirect
};

export default HomeRedirect;
