import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from './components/ProtectedRoute';
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import AdminDashboard from "./pages/AdminDashboard";
import CustomerDashboard from "./pages/CustomerDashboard";
import { useContext } from "react";
import { AuthContext } from "./context/AuthContext";

function App() {
  const { token, user } = useContext(AuthContext);

  // Auto redirect if user is already logged in
  const RedirectIfLoggedIn = ({ children }) => {
    if (token && user?.role === "admin") return <Navigate to="/admin/dashboard" replace />;
    if (token && user?.role === "customer") return <Navigate to="/customer/dashboard" replace />;
    return children;
  };

  return (
    <Router>
      <Routes>
        {/* Login/Register */}
        <Route
          path="/"
          element={
            <RedirectIfLoggedIn>
              <LoginPage />
            </RedirectIfLoggedIn>
          }
        />
        <Route
          path="/login"
          element={
            <RedirectIfLoggedIn>
              <LoginPage />
            </RedirectIfLoggedIn>
          }
        />
        <Route
          path="/register"
          element={
            <RedirectIfLoggedIn>
              <RegisterPage />
            </RedirectIfLoggedIn>
          }
        />

        {/* Protected Routes */}
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute role="admin">
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/customer/dashboard"
          element={
            <ProtectedRoute role="customer">
              <CustomerDashboard />
            </ProtectedRoute>
          }
        />

        {/* Catch-all: redirect unknown routes to login */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
