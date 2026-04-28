import { Link, useNavigate, useLocation } from "react-router-dom";
import { useApp } from "@/context/AppContext";
import { Button } from "@/components/ui/button";
import { Sparkles, LogOut, Menu, X } from "lucide-react";
import { toast } from "sonner";
import { useEffect, useState } from "react";

export const Navbar = () => {
  const { user, logout } = useApp();
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    toast.success("Logged out");
    setOpen(false);
    navigate("/");
  };

  return (
    <header className="sticky top-0 z-50 w-full glass">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="relative">
            <Sparkles className="h-6 w-6 text-primary transition-transform group-hover:rotate-12" />
            <div className="absolute inset-0 blur-lg bg-primary/50" />
          </div>
          <span className="font-display text-xl font-bold tracking-tight">
            GADM
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          <Link to="/marketplace">
            <Button variant="ghost" size="sm">Marketplace</Button>
          </Link>
          {user && (
            <>
              <Link to="/dashboard">
                <Button variant="ghost" size="sm">Dashboard</Button>
              </Link>
              <Link to="/train-model">
                <Button variant="ghost" size="sm">Train AI</Button>
              </Link>
            </>
          )}
        </nav>

        <div className="flex items-center gap-2">
          <div className="hidden sm:flex items-center gap-2">
            {user ? (
              <>
                <span className="hidden sm:block text-sm text-muted-foreground">
                  {user.name}
                </span>
                <Button variant="ghost" size="icon" onClick={handleLogout} aria-label="Logout">
                  <LogOut className="h-4 w-4" />
                </Button>
              </>
            ) : (
              <>
                <Link to="/auth">
                  <Button variant="ghost" size="sm">Login</Button>
                </Link>
                <Link to="/auth?mode=signup">
                  <Button variant="hero" size="sm">Sign Up</Button>
                </Link>
              </>
            )}
          </div>

          <button
            className="md:hidden h-10 w-10 inline-flex items-center justify-center rounded-md hover:bg-accent/10 transition-colors"
            onClick={() => setOpen(o => !o)}
            aria-label="Toggle menu"
            aria-expanded={open}
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden border-t border-border/50 glass">
          <nav className="container py-4 flex flex-col gap-2">
            <Link to="/marketplace" onClick={() => setOpen(false)}>
              <Button variant="ghost" className="w-full justify-start">Marketplace</Button>
            </Link>
            {user && (
              <>
                <Link to="/dashboard" onClick={() => setOpen(false)}>
                  <Button variant="ghost" className="w-full justify-start">Dashboard</Button>
                </Link>
                <Link to="/train-model" onClick={() => setOpen(false)}>
                  <Button variant="ghost" className="w-full justify-start">Train AI</Button>
                </Link>
              </>
            )}
            <div className="pt-2 mt-2 border-t border-border/50">
              {user ? (
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm text-muted-foreground px-3">{user.name}</span>
                  <Button variant="ghost" size="sm" onClick={handleLogout}>
                    <LogOut className="h-4 w-4 mr-2" /> Logout
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  <Link to="/auth" onClick={() => setOpen(false)}>
                    <Button variant="ghost" className="w-full">Login</Button>
                  </Link>
                  <Link to="/auth?mode=signup" onClick={() => setOpen(false)}>
                    <Button variant="hero" className="w-full">Sign Up</Button>
                  </Link>
                </div>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
};
