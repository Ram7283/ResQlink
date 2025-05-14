import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";
import { Redirect, Route } from "wouter";

type ProtectedRouteProps = {
  path: string;
  component: React.ComponentType<any>;
  allowedRoles?: string[];
};

export function ProtectedRoute({
  path,
  component: Component,
  allowedRoles
}: ProtectedRouteProps) {
  const { user, isLoading } = useAuth();

  return (
    <Route path={path}>
      {(params) => {
        if (isLoading) {
          return (
            <div className="flex items-center justify-center min-h-screen">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          );
        }

        if (!user) {
          return <Redirect to="/auth" />;
        }

        if (allowedRoles && !allowedRoles.includes(user.role)) {
          return (
            <div className="flex flex-col items-center justify-center min-h-screen">
              <h1 className="text-3xl font-bold mb-4">Access Denied</h1>
              <p className="text-muted-foreground">
                You don't have permission to access this page.
              </p>
            </div>
          );
        }

        return <Component {...params} />;
      }}
    </Route>
  );
}