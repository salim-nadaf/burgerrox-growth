import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Menu, Phone, MapPin, User, LogOut } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import AuthForm from "./AuthForm";
import Cart from "./Cart";

const Header = () => {
  const [authDialogOpen, setAuthDialogOpen] = useState(false);
  const { user, signOut, profile } = useAuth();
  const location = useLocation();
  return (
    <header className="bg-background border-b border-border shadow-warm">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-8">
            <Link to="/" className="font-bebas text-4xl text-foreground tracking-wider hover:text-primary transition-colors">
              BURGER ROX
            </Link>
            <nav className="hidden md:flex space-x-6">
              {location.pathname === '/menu' ? (
                <Link to="/" className="font-montserrat font-medium text-foreground hover:text-primary transition-colors">
                  Home
                </Link>
              ) : (
                <a href="#menu" className="font-montserrat font-medium text-foreground hover:text-primary transition-colors">
                  Menu
                </a>
              )}
              <a href="#about" className="font-montserrat font-medium text-foreground hover:text-primary transition-colors">
                About
              </a>
              <a href="#contact" className="font-montserrat font-medium text-foreground hover:text-primary transition-colors">
                Contact
              </a>
            </nav>
          </div>
          
          <div className="hidden lg:flex items-center space-x-4 text-sm font-montserrat">
            <div className="flex items-center space-x-1 text-muted-foreground">
              <Phone size={16} />
              <span>9970078688</span>
            </div>
            <div className="flex items-center space-x-1 text-muted-foreground">
              <MapPin size={16} />
              <span>Urban Forest, Mamurdi</span>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <Cart />
            
            {user ? (
              <div className="flex items-center space-x-2">
                <span className="hidden md:inline text-sm">
                  {profile?.name || 'User'}
                </span>
                <Button variant="ghost" size="icon" onClick={signOut}>
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <Dialog open={authDialogOpen} onOpenChange={setAuthDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <User className="h-4 w-4" />
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <AuthForm onClose={() => setAuthDialogOpen(false)} />
                </DialogContent>
              </Dialog>
            )}
            
            <Button 
              variant="brand" 
              size="lg" 
              className="hidden md:flex"
              onClick={() => window.open('https://wa.me/919970078688', '_blank')}
            >
              Order Now
            </Button>
            
            <Button variant="ghost" size="icon" className="md:hidden">
              <Menu size={20} />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;