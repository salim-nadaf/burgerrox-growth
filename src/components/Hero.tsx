import { Button } from "@/components/ui/button";
import heroImage from "@/assets/hero-burger.jpg";

const Hero = () => {
  return (
    <section className="relative min-h-[80vh] flex items-center justify-center overflow-hidden">
      {/* Background Image */}
       <div className="absolute inset-0 z-0">
         <img 
          src={heroImage} 
          alt="Delicious Burger Rox burger" 
          className="w-full h-full object-cover opacity-50"
          fetchPriority="high"
          decoding="async"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-background/60 to-background/40"></div>
      </div>

      <div className="container mx-auto px-4 z-10">
        <div className="max-w-4xl mx-auto text-center">
          <div className="space-y-6">
            <h2 className="font-bebas text-7xl md:text-9xl text-foreground leading-none tracking-wider">
              CRAVE-WORTHY
            </h2>
            <h3 className="font-bebas text-5xl md:text-7xl text-primary leading-none tracking-wider">
              BURGERS
            </h3>
            
            <p className="font-allura text-3xl md:text-4xl text-foreground mt-4">
              Rockin' homemade flavor
            </p>
            
            <p className="font-montserrat text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Maximum taste, minimum drama. We're all about serving up affordable, 
              delicious burgers that hit different. No fancy fluff – just real food 
              that gets it.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mt-8">
              <Button 
                variant="hero" 
                size="xl" 
                className="w-full sm:w-auto"
                onClick={() => window.open('https://wa.me/919970078688', '_blank')}
              >
                Order Your Fix
              </Button>
              <Button variant="outline" size="xl" className="w-full sm:w-auto" asChild>
                <a href="/menu">View Menu</a>
              </Button>
            </div>

            <div className="flex items-center justify-center space-x-8 mt-12 text-center">
              <div className="font-montserrat">
                <div className="font-bebas text-3xl text-primary">₹79</div>
                <div className="text-sm text-muted-foreground">Affordable</div>
              </div>
              <div className="w-px h-12 bg-border"></div>
              <div className="font-montserrat">
                <div className="font-bebas text-3xl text-primary">30MIN</div>
                <div className="text-sm text-muted-foreground">Quick Delivery</div>
              </div>
              <div className="w-px h-12 bg-border"></div>
              <div className="font-montserrat">
                <div className="font-bebas text-3xl text-primary">4.6★</div>
                <div className="text-sm text-muted-foreground">Customer Rated</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;