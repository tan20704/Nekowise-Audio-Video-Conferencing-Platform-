import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import ConnectionStatus from "../ConnectionStatus";
import { Button } from "../ui/button";
import { Video, LogOut, LogIn, UserPlus, LayoutDashboard } from "lucide-react";

export default function Header() {
  const { isAuthenticated, user, logout } = useAuth();
  const location = useLocation();
  const isAuthPage =
    location.pathname === "/login" || location.pathname === "/register";

  return (
    <header className="border-b bg-surface shadow-sm">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <Link
            to="/"
            className="flex items-center gap-2 hover:opacity-80 transition-opacity"
          >
            <span className="material-symbols-outlined text-primary text-3xl">
              hub
            </span>
            <span className="text-xl font-semibold font-display">Nekowise</span>
          </Link>
          <div className="flex items-center gap-4">
            {isAuthenticated && <ConnectionStatus />}
            <nav className="flex items-center gap-2">
              {isAuthenticated ? (
                <>
                  <Button variant="ghost" size="sm" asChild>
                    <Link to="/dashboard">
                      <LayoutDashboard className="h-4 w-4" />
                      Dashboard
                    </Link>
                  </Button>
                  <span className="text-sm text-on-surface-variant px-2">
                    {user?.displayName || user?.username}
                  </span>
                  <Button variant="outline" size="sm" onClick={logout}>
                    <LogOut className="h-4 w-4" />
                    Logout
                  </Button>
                </>
              ) : (
                !isAuthPage && (
                  <>
                    <Button variant="ghost" size="sm" asChild>
                      <Link to="/login">
                        <LogIn className="h-4 w-4" />
                        Login
                      </Link>
                    </Button>
                    <Button size="sm" asChild>
                      <Link to="/register">
                        <UserPlus className="h-4 w-4" />
                        Register
                      </Link>
                    </Button>
                  </>
                )
              )}
            </nav>
          </div>
        </div>
      </div>
    </header>
  );
}
