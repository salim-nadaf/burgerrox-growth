import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { MapPin, Phone, Clock, Instagram, Facebook } from "lucide-react";

const Contact = () => {
  return (
    <section id="contact" className="py-20 bg-secondary/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="font-bebas text-6xl md:text-7xl text-foreground tracking-wider mb-4">
            FIND US
          </h2>
          <p className="font-allura text-2xl md:text-3xl text-primary mb-6">
            We're right where you need us to be
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12">
          <div className="space-y-8">
            <Card className="border-2 border-border hover:border-primary transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-start space-x-4">
                  <div className="bg-primary/10 rounded-full p-3">
                    <MapPin className="text-primary" size={24} />
                  </div>
                  <div>
                    <h3 className="font-bebas text-xl text-foreground tracking-wide mb-2">
                      LOCATION
                    </h3>
                    <p className="font-montserrat text-muted-foreground">
                      Urban Forest, Mamurdi<br />
                      Pune-412101
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-2 border-border hover:border-primary transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-start space-x-4">
                  <div className="bg-primary/10 rounded-full p-3">
                    <Clock className="text-primary" size={24} />
                  </div>
                  <div>
                    <h3 className="font-bebas text-xl text-foreground tracking-wide mb-2">
                      HOURS
                    </h3>
                    <div className="font-montserrat text-muted-foreground space-y-1">
                      <p>Mon-Thu, Sat-Sun: 11AM - 9:30PM</p>
                      <p>Friday: 4PM - 9:30PM</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-2 border-border hover:border-primary transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-start space-x-4">
                  <div className="bg-primary/10 rounded-full p-3">
                    <Phone className="text-primary" size={24} />
                  </div>
                  <div>
                    <h3 className="font-bebas text-xl text-foreground tracking-wide mb-2">
                      CONTACT
                    </h3>
                    <div className="font-montserrat text-muted-foreground space-y-1">
                      <p>Phone: 9970078688</p>
                      <p>Orders: 9321389985</p>
                      <p>WhatsApp Orders Available</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-8">
            <div className="bg-primary/10 rounded-2xl p-8 text-center">
              <h3 className="font-bebas text-3xl text-foreground tracking-wider mb-4">
                READY TO ROX?
              </h3>
              <p className="font-montserrat text-muted-foreground mb-6">
                We deliver fresh, delicious burgers right to your door. Order via WhatsApp for quick service.
              </p>
              <div className="space-y-4">
                <Button 
                  variant="brand" 
                  size="lg" 
                  className="w-full"
                  onClick={() => window.open('https://wa.me/919970078688', '_blank')}
                >
                  Order on WhatsApp
                </Button>
                <Button 
                  variant="outline" 
                  size="lg" 
                  className="w-full"
                  onClick={() => window.open('tel:9970078688', '_blank')}
                >
                  Call to Order
                </Button>
              </div>
            </div>

            <div className="text-center">
              <h3 className="font-bebas text-2xl text-foreground tracking-wide mb-4">
                FOLLOW THE ROX
              </h3>
              <p className="font-montserrat text-muted-foreground mb-6">
                Stay updated with the latest menu items, deals, and campus events.
              </p>
              <div className="flex justify-center space-x-4">
                <a 
                  href="https://www.instagram.com/burgerroxx" 
                  target="_blank" 
                  rel="noopener noreferrer"
                >
                  <Button variant="ghost" size="icon" className="bg-primary/10 hover:bg-primary hover:text-primary-foreground">
                    <Instagram size={20} />
                  </Button>
                </a>
                <a 
                  href="https://www.facebook.com/burgerroxx/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                >
                  <Button variant="ghost" size="icon" className="bg-primary/10 hover:bg-primary hover:text-primary-foreground">
                    <Facebook size={20} />
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