import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Menu, Phone, MapPin, LogOut, User } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import Cart from "./Cart";
import OrdersSheet from "./OrdersSheet";
import ProfileSheet from "./ProfileSheet";
import LoginModal from "./LoginModal";

const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const { user, signOut, profile } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    setMobileMenuOpen(false);
  };

  return (
    <>
      <header className="bg-card border-b border-border shadow-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <a href="/" className="font-bebas text-2xl sm:text-3xl text-foreground tracking-wider hover:text-primary transition-colors" aria-label="Burger Rox home">
              BURGER ROX
            </a>

            {/* Desktop nav */}
            <nav className="hidden md:flex items-center gap-5" aria-label="Main navigation">
              {location.pathname === '/menu' ? (
                <Link to="/" className="font-montserrat text-sm font-medium text-foreground hover:text-primary transition-colors">Home</Link>
              ) : (
                <Link to="/menu" className="font-montserrat text-sm font-medium text-foreground hover:text-primary transition-colors">Menu</Link>
              )}
              <Link to="/delivery-area" className="font-montserrat text-sm font-medium text-foreground hover:text-primary transition-colors">Delivery Areas</Link>
              {location.pathname === '/menu' ? (
                <Link to="/#about" className="font-montserrat text-sm font-medium text-foreground hover:text-primary transition-colors">About</Link>
              ) : (
                <a href="#about" className="font-montserrat text-sm font-medium text-foreground hover:text-primary transition-colors">About</a>
              )}
            </nav>
            
            {/* Desktop actions */}
            <div className="hidden md:flex items-center gap-2">
              <OrdersSheet />
              <Cart />
              {user ? (
                <div className="flex items-center gap-1">
                  <ProfileSheet />
                  <Button variant="ghost" size="icon" onClick={signOut} aria-label="Sign out" className="h-8 w-8">
                    <LogOut className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <Button variant="ghost" size="icon" aria-label="Log in" onClick={() => setLoginOpen(true)}>
                  <User className="h-4 w-4" />
                </Button>
              )}
              <Link to="/menu">
                <Button variant="brand" size="sm" className="h-9 px-4 text-sm font-montserrat font-semibold">
                  Order Now
                </Button>
              </Link>
            </div>

            {/* Mobile: cart + menu */}
            <div className="flex items-center gap-1 md:hidden">
              <OrdersSheet />
              <Cart />
              {user ? (
                <ProfileSheet />
              ) : (
                <Button variant="ghost" size="icon" aria-label="Log in" className="h-9 w-9" onClick={() => setLoginOpen(true)}>
                  <User size={18} />
                </Button>
              )}
              <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-9 w-9" aria-label="Open menu">
                    <Menu size={18} />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-72">
                  <SheetHeader>
                    <SheetTitle className="font-bebas text-xl tracking-wider text-left">MENU</SheetTitle>
                  </SheetHeader>
                  
                  <nav className="flex flex-col gap-3 mt-6" aria-label="Mobile navigation">
                    {location.pathname === '/menu' ? (
                      <Link to="/" className="font-montserrat font-medium text-foreground hover:text-primary py-1.5" onClick={() => setMobileMenuOpen(false)}>Home</Link>
                    ) : (
                      <Link to="/menu" className="font-montserrat font-medium text-foreground hover:text-primary py-1.5" onClick={() => setMobileMenuOpen(false)}>Full Menu</Link>
                    )}
                    <Link to="/delivery-area" className="font-montserrat font-medium text-foreground hover:text-primary py-1.5" onClick={() => setMobileMenuOpen(false)}>Delivery Areas</Link>
                    <button className="font-montserrat font-medium text-foreground hover:text-primary py-1.5 text-left" onClick={() => {
                      setMobileMenuOpen(false);
                      if (location.pathname !== '/') { navigate('/'); setTimeout(() => document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' }), 100); }
                      else { setTimeout(() => document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' }), 300); }
                    }}>About</button>
                    <button className="font-montserrat font-medium text-foreground hover:text-primary py-1.5 text-left" onClick={() => {
                      setMobileMenuOpen(false);
                      if (location.pathname !== '/') { navigate('/'); setTimeout(() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' }), 100); }
                      else { setTimeout(() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' }), 300); }
                    }}>Contact</button>
                  </nav>

                  <div className="space-y-2 pt-4 mt-4 border-t border-border/30">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Phone size={14} />
                      <span className="font-montserrat text-xs">9321389985</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <MapPin size={14} />
                      <span className="font-montserrat text-xs">Urban Forest, Mamurdi</span>
                    </div>
                  </div>

                  <Button variant="brand" className="w-full mt-4 h-10" onClick={() => { setMobileMenuOpen(false); navigate('/menu'); }}>
                    Order Now
                  </Button>

                  {user && (
                    <Button variant="ghost" size="sm" className="w-full mt-2 text-muted-foreground text-xs" onClick={handleSignOut}>
                      <LogOut className="h-3 w-3 mr-1" /> Sign Out
                    </Button>
                  )}
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </header>

      {/* Login modal triggered from header */}
      <LoginModal
        open={loginOpen}
        onOpenChange={setLoginOpen}
        onSuccess={() => setLoginOpen(false)}
      />
    </>
  );
};

export default Header;
