import { Link, useLocation } from "react-router-dom";
import { Cherry, LogOut } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";

const navItems = [
  { label: "Головна", path: "/" },
  { label: "Діти", path: "/children" },
  { label: "Групи", path: "/groups" },
  { label: "Звіти", path: "/reports" },
  { label: "Вихователі", path: "/teachers" },
  { label: "Налаштування", path: "/settings" },
];

const Navbar = () => {
  const location = useLocation();
  const { signOut } = useAuth();

  return (
    <nav className="sticky top-0 z-50 border-b bg-card shadow-sm">
      <div className="container mx-auto flex items-center justify-between px-6 py-3">
        <Link to="/" className="flex items-center gap-2">
          <Cherry className="h-7 w-7 text-primary" />
          <span className="text-lg font-bold text-foreground">
            База обліку дітей
          </span>
        </Link>
        <div className="flex items-center gap-1">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${
                location.pathname === item.path
                  ? "bg-muted text-foreground shadow-sm"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              {item.label}
            </Link>
          ))}
          <Button variant="ghost" size="icon" onClick={signOut} title="Вийти">
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
