import { Link } from "react-router-dom";
import brLogo from "@/assets/BR Logo Transparent BG.png";

const Footer = () => {
  return (
    <footer className="py-12 bg-foreground" role="contentinfo" aria-label="Site footer">
      <div className="container mx-auto px-4">
        {/* Centered Logo + Tagline */}
        <div className="flex flex-col items-center mb-8">
          <img 
            src={brLogo} 
            alt="Burger Rox Logo" 
            className="h-16 md:h-20 w-auto mb-3"
            width="80"
            height="80"
            loading="lazy"
            decoding="async"
          />
          <p className="font-allura text-xl tracking-wide text-background text-center">
            Rockin' homemade flavor
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 items-start max-w-4xl mx-auto">
          {/* Links + Copyright */}
          <div className="text-center md:text-left space-y-3">
            <nav className="flex flex-wrap justify-center md:justify-start gap-x-4 gap-y-1 text-sm" aria-label="Legal and info links">
              <Link to="/privacy" className="text-background/80 hover:text-primary transition-colors">
                Privacy
              </Link>
              <Link to="/refund-policy" className="text-background/80 hover:text-primary transition-colors">
                Refund Policy
              </Link>
              <Link to="/terms" className="text-background/80 hover:text-primary transition-colors">
                Terms & Conditions
              </Link>
              <Link to="/delivery-area" className="text-background/80 hover:text-primary transition-colors">
                Delivery Area
              </Link>
            </nav>
            <p className="font-montserrat text-sm text-background/60">
              © 2026 Burger Rox. All rights reserved.
            </p>
            <p className="font-montserrat text-xs text-background/50">
              Made with <span aria-label="love">❤️</span> by a brother-sister duo
            </p>
          </div>

          {/* Contact */}
          <address className="text-center md:text-right not-italic">
            <div className="font-montserrat text-sm text-background/80 space-y-2">
              <p>Urban Forest, Mamurdi</p>
              <p className="font-semibold text-primary text-base">
                <a href="tel:+919321389985" aria-label="Call us at 9321389985">9321389985</a>
              </p>
              <p>
                <a href="mailto:cloudspicepvtltd@gmail.com" className="hover:text-primary transition-colors" aria-label="Email us">cloudspicepvtltd@gmail.com</a>
              </p>
              
              <nav className="flex justify-center md:justify-end space-x-4 mt-4" aria-label="Social media links">
                <a 
                  href="https://www.instagram.com/burgerroxx" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-background/70 hover:text-primary transition-colors"
                  aria-label="Follow us on Instagram"
                >
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                </a>
                <a 
                  href="https://www.facebook.com/burgerroxx/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-background/70 hover:text-primary transition-colors"
                  aria-label="Follow us on Facebook"
                >
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                </a>
              </nav>
            </div>
          </address>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
