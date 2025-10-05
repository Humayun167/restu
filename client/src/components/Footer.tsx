import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { 
  MapPin, 
  Phone, 
  Mail, 
  Clock, 
  Facebook, 
  Twitter, 
  Instagram, 
  Youtube,
  ArrowRight,
  LogOut
} from "lucide-react";
import { useUser } from "@/context/UserContext";

const Footer = () => {
  const { user, logout, isLoggedIn } = useUser();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <footer className="bg-card border-t border-border">
      {/* Newsletter Section */}
      <div className="bg-primary">
        <div className="container mx-auto px-4 py-12">
          <div className="text-center max-w-2xl mx-auto">
            <h3 className="text-2xl md:text-3xl font-bold text-primary-foreground mb-4">
              Stay Updated with Our Latest Offers
            </h3>
            <p className="text-primary-foreground/80 mb-6">
              Subscribe to our newsletter and be the first to know about new dishes, special promotions, and exclusive events.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <Input 
                type="email" 
                placeholder="Enter your email address"
                className="bg-background border-border text-foreground flex-1"
              />
              <Button variant="secondary" className="bg-background text-foreground hover:bg-background/90">
                Subscribe
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          
          {/* Restaurant Info */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <h4 className="text-xl font-bold text-foreground">Restu</h4>
            </div>
            <p className="text-foreground/70 leading-relaxed">
              Experience authentic flavors and exceptional dining at Restu. We serve fresh, delicious meals made with love and the finest ingredients.
            </p>
            <div className="flex space-x-4">
              <Button variant="ghost" size="sm" className="p-2 hover:bg-primary hover:text-primary-foreground">
                <Facebook className="w-5 h-5" />
              </Button>
              <Button variant="ghost" size="sm" className="p-2 hover:bg-primary hover:text-primary-foreground">
                <Twitter className="w-5 h-5" />
              </Button>
              <Button variant="ghost" size="sm" className="p-2 hover:bg-primary hover:text-primary-foreground">
                <Instagram className="w-5 h-5" />
              </Button>
              <Button variant="ghost" size="sm" className="p-2 hover:bg-primary hover:text-primary-foreground">
                <Youtube className="w-5 h-5" />
              </Button>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-foreground">Quick Links</h4>
            <nav className="space-y-2">
              <Link to="/" className="block text-foreground/70 hover:text-primary transition-colors">
                Home
              </Link>
              <Link to="#about" className="block text-foreground/70 hover:text-primary transition-colors">
                About Us
              </Link>
              <Link to="#menu" className="block text-foreground/70 hover:text-primary transition-colors">
                Our Menu
              </Link>
              <Link to="/cart" className="block text-foreground/70 hover:text-primary transition-colors">
                Cart
              </Link>
              <Link to="#contact" className="block text-foreground/70 hover:text-primary transition-colors">
                Contact
              </Link>
              {isLoggedIn ? (
                <>
                  <Link to="/profile" className="block text-foreground/70 hover:text-primary transition-colors">
                    Profile ({user?.name})
                  </Link>
                  <button 
                    onClick={handleLogout}
                    className="block text-left text-foreground/70 hover:text-primary transition-colors"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login" className="block text-foreground/70 hover:text-primary transition-colors">
                    Login
                  </Link>
                  <Link to="/register" className="block text-foreground/70 hover:text-primary transition-colors">
                    Sign Up
                  </Link>
                </>
              )}
            </nav>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-foreground">Contact Info</h4>
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <MapPin className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-foreground/70">
                    123 Restaurant Street<br />
                    Food District, City 12345<br />
                    United States
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="w-5 h-5 text-primary flex-shrink-0" />
                <p className="text-foreground/70">+1 (555) 123-4567</p>
              </div>
              <div className="flex items-center space-x-3">
                <Mail className="w-5 h-5 text-primary flex-shrink-0" />
                <p className="text-foreground/70">info@tastyrestaurant.com</p>
              </div>
            </div>
          </div>

          {/* Opening Hours */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-foreground">Opening Hours</h4>
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <Clock className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span className="text-foreground/70">Monday - Friday</span>
                    <span className="text-foreground font-medium">11:00 AM - 10:00 PM</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-foreground/70">Saturday</span>
                    <span className="text-foreground font-medium">10:00 AM - 11:00 PM</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-foreground/70">Sunday</span>
                    <span className="text-foreground font-medium">10:00 AM - 9:00 PM</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="pt-2">
              <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
                Make Reservation
              </Button>
            </div>
          </div>
        </div>
      </div>

      <Separator className="bg-border" />

      {/* Bottom Footer */}
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <div className="text-center md:text-left">
            <p className="text-foreground/60 text-sm">
              © 2025 Restu Restaurant. All rights reserved.
            </p>
          </div>
          <div className="flex flex-wrap justify-center md:justify-end space-x-6 text-sm">
            <Link to="/privacy" className="text-foreground/60 hover:text-primary transition-colors">
              Privacy Policy
            </Link>
            <Link to="/terms" className="text-foreground/60 hover:text-primary transition-colors">
              Terms of Service
            </Link>
            <Link to="/cookies" className="text-foreground/60 hover:text-primary transition-colors">
              Cookie Policy
            </Link>
            <Link to="/sitemap" className="text-foreground/60 hover:text-primary transition-colors">
              Sitemap
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;