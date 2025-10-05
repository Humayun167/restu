import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ShoppingCart, Menu, X, User, Search, XCircle, LogOut } from "lucide-react";
import { useCart } from "@/hooks/useCart";
import { useSearch } from "@/context/SearchContext";
import { useUser } from "@/context/UserContext";

const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { searchQuery, setSearchQuery, clearSearch } = useSearch();
  const { getTotalItems } = useCart();
  const { user, logout, isLoggedIn } = useUser();
  const navigate = useNavigate();

  // Debug header state
  console.log('🏠 Header - User:', user);
  console.log('🏠 Header - IsLoggedIn:', isLoggedIn);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const navItems = [
    { name: "HOME", href: "/", hasDropdown: false },
    { name: "MENU", href: "/products", hasDropdown: false },
    { name: "RESERVATIONS", href: "/reservations", hasDropdown: false },
    { name: "ABOUT", href: "#about", hasDropdown: false },
    { name: "CONTACT", href: "#contact", hasDropdown: false },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <h1 className="text-2xl font-bold text-foreground">Tastyc</h1>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-8">
            {navItems.map((item) => (
              <div key={item.name} className="relative">
                {item.href.startsWith('/') ? (
                  <Link
                    to={item.href}
                    className="text-sm font-medium text-foreground hover:text-primary transition-colors"
                  >
                    {item.name}
                  </Link>
                ) : (
                  <a
                    href={item.href}
                    className="text-sm font-medium text-foreground hover:text-primary transition-colors"
                  >
                    {item.name}
                  </a>
                )}
              </div>
            ))}
          </nav>

          {/* Search Bar - Desktop */}
          <div className="hidden md:flex items-center flex-1 max-w-xs mx-4">
            <div className="relative w-full">
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-3 w-3 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-6 pr-6 py-0.5 w-full text-xs bg-muted/50 border-border focus:bg-background h-7"
              />
              {searchQuery && (
                <button
                  onClick={clearSearch}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  <XCircle className="h-3 w-3" />
                </button>
              )}
            </div>
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center space-x-4">
            <div className="hidden sm:flex items-center space-x-2">
              {isLoggedIn ? (
                // Authenticated user buttons
                <>
                  <Link to="/profile">
                    <Button variant="outline" size="sm" className="border-border hover:bg-muted">
                      <User className="h-4 w-4 mr-2" />
                      {user?.name || 'Profile'}
                    </Button>
                  </Link>
                </>
              ) : (
                // Guest user buttons
                <>
                  <Link to="/login">
                    <Button variant="outline" size="sm" className="border-border hover:bg-muted">
                      Login
                    </Button>
                  </Link>
                  <Link to="/register">
                    <Button size="sm" className="bg-primary hover:bg-primary/90 text-primary-foreground">
                      Sign Up
                    </Button>
                  </Link>
                </>
              )}
            
            </div>
            
            <Link to="/cart">
              <button className="relative p-2 hover:bg-secondary rounded-lg transition-colors">
                <ShoppingCart className="h-5 w-5 text-foreground" />
                {getTotalItems() > 0 && (
                  <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center animate-pulse">
                    {getTotalItems()}
                  </span>
                )}
              </button>
            </Link>

            {/* Mobile Menu Button */}
            <button
              className="lg:hidden p-2"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? (
                <X className="h-6 w-6 text-foreground" />
              ) : (
                <Menu className="h-6 w-6 text-foreground" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden border-t border-border">
            {/* Mobile Search */}
            <div className="px-4 py-4 border-b border-border">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search for food..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-10 py-2 w-full bg-muted/50 border-border focus:bg-background"
                />
                {searchQuery && (
                  <button
                    onClick={clearSearch}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <XCircle className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
            <nav className="py-4 space-y-2">
              {navItems.map((item) => (
                <div key={item.name}>
                  {item.href.startsWith('/') ? (
                    <Link
                      to={item.href}
                      className="block px-4 py-2 text-sm font-medium text-foreground hover:text-primary hover:bg-muted transition-colors"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      {item.name}
                    </Link>
                  ) : (
                    <a
                      href={item.href}
                      className="block px-4 py-2 text-sm font-medium text-foreground hover:text-primary hover:bg-muted transition-colors"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      {item.name}
                    </a>
                  )}
                </div>
              ))}
              <div className="px-4 pt-4 space-y-2">
                {isLoggedIn ? (
                  // Authenticated user mobile menu
                  <>
                    <Link to="/profile">
                      <Button variant="outline" className="w-full border-border hover:bg-muted mb-2">
                        <User className="h-4 w-4 mr-2" />
                        {user?.name || 'My Profile'}
                      </Button>
                    </Link>
                    <Button 
                      variant="outline" 
                      className="w-full border-border hover:bg-muted"
                      onClick={() => {
                        handleLogout();
                        setIsMobileMenuOpen(false);
                      }}
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      Logout
                    </Button>
                  </>
                ) : (
                  // Guest user mobile menu
                  <>
                    <div className="grid grid-cols-2 gap-2">
                      <Link to="/login">
                        <Button variant="outline" className="w-full border-border hover:bg-muted">
                          Login
                        </Button>
                      </Link>
                      <Link to="/register">
                        <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
                          Sign Up
                        </Button>
                      </Link>
                    </div>
                  </>
                )}
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;