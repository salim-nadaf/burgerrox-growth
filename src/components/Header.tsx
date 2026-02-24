import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Menu, Phone, MapPin, LogOut } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import Cart from "./Cart";
import OrdersSheet from "./OrdersSheet";
import ProfileSheet from "./ProfileSheet";
import GuestProfileSheet from "./GuestProfileSheet";

const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, signOut, profile } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    setMobileMenuOpen(false);
  };

  return (
    <header className="bg-background border-b border-border shadow-warm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-8">
            <a href="/" className="font-bebas text-4xl text-foreground tracking-wider hover:text-primary transition-colors" aria-label="Burger Rox home">
              BURGER ROX
            </a>
            <nav className="hidden md:flex space-x-6" aria-label="Main navigation">
              {location.pathname === '/menu' ? (
                <Link to="/" className="font-montserrat font-medium text-foreground hover:text-primary transition-colors">
                  Home
                </Link>
              ) : (
                <Link to="/menu" className="font-montserrat font-medium text-foreground hover:text-primary transition-colors">
                  Menu
                </Link>
              )}
              {location.pathname === '/menu' ? (
                <>
                  <Link to="/#about" className="font-montserrat font-medium text-foreground hover:text-primary transition-colors">
                    About
                  </Link>
                  <Link to="/#contact" className="font-montserrat font-medium text-foreground hover:text-primary transition-colors">
                    Contact
                  </Link>
                </>
              ) : (
                <>
                  <a href="#about" className="font-montserrat font-medium text-foreground hover:text-primary transition-colors">
                    About
                  </a>
                  <a href="#contact" className="font-montserrat font-medium text-foreground hover:text-primary transition-colors">
                    Contact
                  </a>
                </>
              )}
            </nav>
          </div>
          
          <div className="hidden lg:flex items-center space-x-4 text-sm font-montserrat">
            <div className="flex items-center space-x-1 text-muted-foreground">
              <Phone size={16} />
              <span>9321389985</span>
            </div>
            <div className="flex items-center space-x-1 text-muted-foreground">
              <MapPin size={16} />
              <span>Urban Forest, Mamurdi</span>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="hidden md:flex items-center space-x-2">
              <OrdersSheet />
              <Cart />
              
              {user ? (
                <div className="flex items-center space-x-2">
                  <span className="hidden lg:inline text-sm">
                    {profile?.name || 'User'}
                  </span>
                  <ProfileSheet />
                  <Button variant="ghost" size="icon" onClick={signOut} aria-label="Sign out">
                    <LogOut className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <GuestProfileSheet />
              )}
              
              <Button 
                variant="brand" 
                className="hidden lg:flex h-12 px-7 text-base"
                onClick={() => navigate('/menu')}
                aria-label="View menu"
              >
                View Menu
              </Button>
            </div>
            
            {/* Mobile Menu */}
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden" aria-label="Open menu">
                  <Menu size={20} />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-full sm:w-80">
                <SheetHeader>
                  <SheetTitle className="font-bebas text-2xl tracking-wider text-left">
                    BURGER ROX
                  </SheetTitle>
                </SheetHeader>
                
                <div className="flex flex-col space-y-6 mt-8">
                  {/* User Section */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <OrdersSheet />
                      <Cart />
                      {user ? (
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-medium">
                            {profile?.name || 'User'}
                          </span>
                          <ProfileSheet />
                          <Button variant="ghost" size="icon" onClick={handleSignOut}>
                            <LogOut className="h-4 w-4" />
                          </Button>
                        </div>
                      ) : (
                        <GuestProfileSheet />
                      )}
                    </div>
                  </div>

                  {/* Navigation */}
                  <nav className="flex flex-col space-y-4" aria-label="Mobile navigation">
                    {location.pathname === '/menu' ? (
                      <Link 
                        to="/" 
                        className="font-montserrat font-medium text-foreground hover:text-primary transition-colors py-2"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        Home
                      </Link>
                    ) : (
                      <>
                        <Link 
                          to="/menu" 
                          className="font-montserrat font-medium text-foreground hover:text-primary transition-colors py-2"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          Full Menu
                        </Link>
                        <a 
                          href="#menu" 
                          className="font-montserrat font-medium text-foreground hover:text-primary transition-colors py-2"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          Menu Highlights
                        </a>
                      </>
                    )}
                    <button 
                      className="font-montserrat font-medium text-foreground hover:text-primary transition-colors py-2 text-left"
                      onClick={() => {
                        setMobileMenuOpen(false);
                        if (location.pathname !== '/') {
                          navigate('/');
                          setTimeout(() => {
                            document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' });
                          }, 100);
                        } else {
                          setTimeout(() => {
                            document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' });
                          }, 300);
                        }
                      }}
                    >
                      About
                    </button>
                    <button 
                      className="font-montserrat font-medium text-foreground hover:text-primary transition-colors py-2 text-left"
                      onClick={() => {
                        setMobileMenuOpen(false);
                        if (location.pathname !== '/') {
                          navigate('/');
                          setTimeout(() => {
                            document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
                          }, 100);
                        } else {
                          setTimeout(() => {
                            document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
                          }, 300);
                        }
                      }}
                    >
                      Contact
                    </button>
                  </nav>

                  {/* Contact Info */}
                  <div className="space-y-3 pt-4 border-t">
                    <div className="flex items-center space-x-2 text-muted-foreground">
                      <Phone size={16} />
                      <span className="font-montserrat text-sm">9321389985</span>
                    </div>
                    <div className="flex items-center space-x-2 text-muted-foreground">
                      <MapPin size={16} />
                      <span className="font-montserrat text-sm">Urban Forest, Mamurdi</span>
                    </div>
                  </div>

                  {/* Order Button */}
                   <Button 
                    variant="brand" 
                    size="lg" 
                    className="w-full mt-6"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      navigate('/menu');
                    }}
                    aria-label="View menu"
                  >
                    View Menu
                  </Button>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;