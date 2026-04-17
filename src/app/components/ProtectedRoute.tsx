import { useEffect, useState } from "react";
import { Navigate } from "react-router";
import { AdminLogin } from "./AdminLogin";

// Session timeout: 2 hours
const SESSION_TIMEOUT = 2 * 60 * 60 * 1000;

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    checkAuthentication();
  }, []);

  const checkAuthentication = () => {
    const authenticated = sessionStorage.getItem("isAdminAuthenticated");
    const loginTime = sessionStorage.getItem("adminLoginTime");

    if (authenticated === "true" && loginTime) {
      const timeElapsed = Date.now() - parseInt(loginTime);
      
      // Check if session has expired
      if (timeElapsed < SESSION_TIMEOUT) {
        setIsAuthenticated(true);
      } else {
        // Session expired
        sessionStorage.removeItem("isAdminAuthenticated");
        sessionStorage.removeItem("adminLoginTime");
        setIsAuthenticated(false);
      }
    } else {
      setIsAuthenticated(false);
    }
  };

  // Loading state
  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-white text-lg">Loading...</div>
      </div>
    );
  }

  // Not authenticated - show login
  if (!isAuthenticated) {
    return <AdminLogin />;
  }

  // Authenticated - show protected content
  return <>{children}</>;
}
