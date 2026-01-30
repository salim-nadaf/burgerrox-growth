import { Users, Clock, DollarSign, Heart } from "lucide-react";

const About = () => {
  const features = [
    {
      icon: Users,
      title: "Family-First",
      description: "A sibling duo combining culinary passion with creative hustle. She perfects every patty, he tells the story – together we make it rox."
    },
    {
      icon: DollarSign,
      title: "Actually Affordable",
      description: "Quality burgers that don't require selling your textbooks. Prices that make sense."
    },
    {
      icon: Clock,
      title: "Quick & Fresh",
      description: "30-minute delivery because you've got places to be. Made fresh, served fast."
    },
    {
      icon: Heart,
      title: "No-Fuss Delivery",
      description: "Hassle-free delivery service and food that just hits. Your comfort food delivered to your comfort zone."
    }
  ];

  return (
    <section id="about" className="py-20 bg-background" aria-labelledby="about-heading">
      <div className="container mx-auto px-4">
        <header className="text-center mb-16">
          <h2 id="about-heading" className="font-bebas text-6xl md:text-7xl text-foreground tracking-wider mb-4">
            WHY WE ROX
          </h2>
          <p className="font-allura text-2xl md:text-3xl text-primary mb-6" role="doc-subtitle">
            Fresh burgers, honest flavours, zero shortcuts
          </p>
          <p className="font-montserrat text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            A brother-sister duo on a mission to serve fresh, crispy, and flavourful burgers – no shortcuts, no gimmicks. 
            She'd been perfecting her craft for years, winning over relatives, neighbors, and anyone lucky enough to grab a bite. 
            He saw something bigger – a brand built on trust and real flavor. Quality ingredients, honest recipes, and burgers 
            made with care – one order at a time.
          </p>
        </header>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8" role="list" aria-label="Our features">
          {features.map((feature, index) => (
            <article key={index} className="text-center group" role="listitem">
              <div className="bg-primary/10 rounded-full p-6 w-20 h-20 mx-auto mb-6 flex items-center justify-center group-hover:bg-primary group-hover:scale-110 transition-all duration-300" aria-hidden="true">
                <feature.icon className="text-primary group-hover:text-primary-foreground" size={32} />
              </div>
              <h3 className="font-bebas text-2xl text-foreground tracking-wide mb-3">
                {feature.title}
              </h3>
              <p className="font-montserrat text-muted-foreground leading-relaxed">
                {feature.description}
              </p>
            </article>
          ))}
        </div>

        <aside className="mt-20 bg-secondary/50 rounded-2xl p-8 md:p-12 text-center" aria-labelledby="join-heading">
          <h3 id="join-heading" className="font-bebas text-4xl md:text-5xl text-foreground tracking-wider mb-4">
            JOIN THE ROX FAMILY
          </h3>
          <p className="font-allura text-xl md:text-2xl text-primary mb-6" role="doc-subtitle">
            Where every meal feels like hanging with friends
          </p>
          <p className="font-montserrat text-muted-foreground max-w-2xl mx-auto mb-8 leading-relaxed">
            Follow us for the latest menu drops, student deals, and behind-the-scenes content. 
            We love hearing from our customers – hit us up with your burger pics and reviews!
          </p>
          
          <div className="flex flex-wrap justify-center gap-4" role="list" aria-label="Restaurant statistics">
            <div className="bg-card rounded-lg p-4 min-w-[120px]" role="listitem">
              <div className="font-bebas text-2xl text-primary" aria-label="Over 500 burgers sold">500+</div>
              <div className="font-montserrat text-sm text-muted-foreground">Burgers Sold</div>
            </div>
            <div className="bg-card rounded-lg p-4 min-w-[120px]" role="listitem">
              <div className="font-bebas text-2xl text-primary" aria-label="4.6 star average rating">4.6★</div>
              <div className="font-montserrat text-sm text-muted-foreground">Average Rating</div>
            </div>
            <div className="bg-card rounded-lg p-4 min-w-[120px]" role="listitem">
              <div className="font-bebas text-2xl text-primary" aria-label="30 minute average delivery time">30MIN</div>
              <div className="font-montserrat text-sm text-muted-foreground">Delivery Time</div>
            </div>
          </div>
        </aside>
      </div>
    </section>
  );
};

export default About;