import { Navigate, useLocation } from "react-router-dom";

const ProtectedRoute = ({ children, requiredRole = null }) => {
  const location = useLocation();
  const token = localStorage.getItem("authToken");
  let user = null;

  // تحسين: التعامل مع أخطاء parsing JSON لتجنب crash
  try {
    const userStr = localStorage.getItem("user");
    if (userStr) {
      user = JSON.parse(userStr);
    }
  } catch (error) {
    console.error("❌ Error parsing user from localStorage:", error);
    localStorage.removeItem("user"); // مسح البيانات الخاطئة لتجنب تكرار
  }

  console.log("🔍 ProtectedRoute - Token:", token);
  console.log("🔍 ProtectedRoute - User:", user);
  console.log("🔍 ProtectedRoute - Required Role:", requiredRole);

  // Check if user is authenticated
  if (!token || !user) {
    console.log("❌ Not authenticated, redirecting to login");
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check if specific role is required
  if (requiredRole) {
    const hasRequiredRole = Array.isArray(requiredRole)
      ? requiredRole.includes(user.role) // دعم مصفوفة من الأدوار
      : user.role === requiredRole; // دعم قيمة واحدة

    if (!hasRequiredRole) {
      console.log(
        `❌ Role mismatch. Required: ${JSON.stringify(
          requiredRole
        )}, User has: ${user.role}`
      );
      // Redirect based on user role
      switch (user.role) {
        case "organizer":
          console.log("🔄 Redirecting to organizer dashboard");
          return <Navigate to="/organizer-dashboard" replace />;
        case "admin":
          console.log("🔄 Redirecting to admin dashboard");
          return <Navigate to="/admin-dashboard" replace />;
        default:
          console.log("🔄 Redirecting to home");
          return <Navigate to="/home" replace />;
      }
    }
  }

  console.log("✅ Access granted");
  return children;
};

export default ProtectedRoute;
