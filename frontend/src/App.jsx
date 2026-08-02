import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import Login from "./pages/Login";
import DashboardLayout from "./layouts/DashboardLayout";
import Employees from "./pages/Employees";
import GenerateSlip from "./pages/GenerateSlip";
import History from "./pages/History";

// Simple wrapper to protect routes
const ProtectedRoute = ({ children, roles }) => {
  const { user, loading } = useAuth();

  if (loading) return <div>Loading...</div>;
  if (!user) return <Navigate to="/login" />;

  // RBAC Check
  if (roles && !roles.includes(user.role)) {
    return <Navigate to="/history" />;
  }

  return children;
};

function App() {
  return (
    <Routes>
      {/* Public Route */}
      <Route path="/login" element={<Login />} />

      {/* Private Routes (Wrapped in Layout) */}
      <Route
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        {/* HR-only pages */}
        <Route
          path="/employees"
          element={
            <ProtectedRoute roles={["HR"]}>
              <Employees />
            </ProtectedRoute>
          }
        />

        <Route
          path="/generate"
          element={
            <ProtectedRoute roles={["HR"]}>
              <GenerateSlip />
            </ProtectedRoute>
          }
        />

        {/* Available to both HR and Employee */}
        <Route path="/history" element={<History />} />

        {/* Salary Setup can be a simple placeholder or same as Employees */}
        <Route path="/salary-setup" element={<Employees />} />
      </Route>

      {/* Redirect root to login */}
      <Route path="/" element={<Navigate to="/login" />} />
    </Routes>
  );
}

export default App;
