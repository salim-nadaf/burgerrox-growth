import { Button } from "@/components/ui/button";
import { MapPin, Phone, Clock, Instagram, Facebook } from "lucide-react";

const Contact = () => {
  return (
    <section id="contact" className="py-20 bg-background" aria-labelledby="contact-heading">
      <div className="container mx-auto px-4">
        <header className="text-center mb-14">
          <h2 id="contact-heading" className="font-bebas text-6xl md:text-8xl text-foreground tracking-wider mb-3">
            FIND US
          </h2>
          <p className="font-allura text-2xl md:text-3xl text-primary mb-6" role="doc-subtitle">
            We're right where you need us to be
          </p>
        </header>

        <div className="grid lg:grid-cols-2 gap-12 max-w-5xl mx-auto">
          {/* Info Cards */}
          <div className="space-y-6">
            <div className="flex items-start space-x-4 p-5 rounded-xl bg-card border border-border/50 hover:border-primary transition-all duration-300" style={{ boxShadow: '0 8px 20px rgba(0,0,0,0.06)' }}>
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary flex items-center justify-center">
                <MapPin className="text-primary-foreground" size={20} />
              </div>
              <div>
                <h3 className="font-bebas text-xl text-foreground tracking-wide mb-1">LOCATION</h3>
                <p className="font-montserrat text-sm text-muted-foreground">Urban Forest, Mamurdi<br />Pune-412101</p>
              </div>
            </div>

            <div className="flex items-start space-x-4 p-5 rounded-xl bg-card border border-border/50 hover:border-primary transition-all duration-300" style={{ boxShadow: '0 8px 20px rgba(0,0,0,0.06)' }}>
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary flex items-center justify-center">
                <Clock className="text-primary-foreground" size={20} />
              </div>
              <div>
                <h3 className="font-bebas text-xl text-foreground tracking-wide mb-1">HOURS</h3>
                <div className="font-montserrat text-sm text-muted-foreground space-y-0.5">
                  <p>Mon-Thu, Sat-Sun: 11AM - 9:30PM</p>
                  <p>Friday: 4PM - 9:30PM</p>
                </div>
              </div>
            </div>

            <div className="flex items-start space-x-4 p-5 rounded-xl bg-card border border-border/50 hover:border-primary transition-all duration-300" style={{ boxShadow: '0 8px 20px rgba(0,0,0,0.06)' }}>
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary flex items-center justify-center">
                <Phone className="text-primary-foreground" size={20} />
              </div>
              <div>
                <h3 className="font-bebas text-xl text-foreground tracking-wide mb-1">CONTACT</h3>
                <div className="font-montserrat text-sm text-muted-foreground space-y-0.5">
                  <p>Phone: 9321389985 (WhatsApp)</p>
                  <p>Alternate: 9970078688</p>
                </div>
              </div>
            </div>
          </div>

          {/* CTA side */}
          <div className="space-y-8">
            <div className="rounded-2xl p-8 text-center bg-primary text-primary-foreground">
              <h3 className="font-bebas text-4xl tracking-wider mb-3">
                READY TO ROX?
              </h3>
              <p className="font-montserrat text-sm text-primary-foreground/90 mb-6">
                We deliver fresh, delicious burgers right to your door. Order via WhatsApp for quick service.
              </p>
              <div className="space-y-3">
                <Button 
                  variant="secondary" 
                  className="w-full h-12 text-base font-montserrat font-semibold"
                  onClick={() => window.open('https://wa.me/919321389985', '_blank')}
                  aria-label="Order on WhatsApp"
                >
                  Order on WhatsApp
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full h-12 text-base font-montserrat border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10"
                  onClick={() => window.open('tel:9321389985', '_blank')}
                  aria-label="Call us to place an order"
                >
                  Call to Order
                </Button>
              </div>
            </div>

            <div className="text-center p-6 rounded-xl bg-card border border-border/50" style={{ boxShadow: '0 8px 20px rgba(0,0,0,0.06)' }}>
              <h3 className="font-bebas text-2xl text-foreground tracking-wide mb-3">
                FOLLOW THE ROX
              </h3>
              <p className="font-montserrat text-sm text-muted-foreground mb-5">
                Stay updated with the latest deals and menu items.
              </p>
              <div className="flex justify-center space-x-4">
                <a 
                  href="https://www.instagram.com/burgerroxx" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  aria-label="Follow us on Instagram"
                >
                  <Button variant="ghost" size="icon" className="w-12 h-12 rounded-full bg-primary/10 hover:bg-primary hover:text-primary-foreground">
                    <Instagram size={22} aria-hidden="true" />
                  </Button>
                </a>
                <a 
                  href="https://www.facebook.com/burgerroxx/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  aria-label="Follow us on Facebook"
                >
                  <Button variant="ghost" size="icon" className="w-12 h-12 rounded-full bg-primary/10 hover:bg-primary hover:text-primary-foreground">
                    <Facebook size={22} aria-hidden="true" />
                  </Button>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;
