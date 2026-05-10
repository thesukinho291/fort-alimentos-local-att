import { useEffect } from "react";
import { Loader2 } from "lucide-react";
import { Navigate, useLocation } from "react-router-dom";
import { useCustomerAuth } from "@/hooks/useCustomerAuth";

const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
  const { customer, loading, openLogin } = useCustomerAuth();
  const location = useLocation();

  useEffect(() => {
    if (!loading && !customer) openLogin();
  }, [customer, loading, openLogin]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!customer) {
    return <Navigate to="/" replace state={{ from: location.pathname }} />;
  }

  return children;
};

export default ProtectedRoute;
