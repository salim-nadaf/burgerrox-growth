import { useEffect } from "react";
import { Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";

const CANONICAL = "https://burgerrox.lovable.app/blog/best-burgers-mamurdi-ravet";
const TITLE = "Best Burgers in Mamurdi & Ravet — Why Burger Rox Leads | Burger Rox";
const DESCRIPTION =
  "Hunting the best burgers in Mamurdi, Ravet, Punawale & Kiwale? See why Burger Rox tops the list — flame-grilled patties, homemade signature sauce, and ₹0 delivery within 3 km.";

const setMeta = (name: string, content: string, attr: "name" | "property" = "name") => {
  let el = document.querySelector(`meta[${attr}="${name}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, name);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
};

const setLink = (rel: string, href: string) => {
  let el = document.querySelector(`link[rel="${rel}"]`);
  if (!el) {
    el = document.createElement("link");
    el.setAttribute("rel", rel);
    document.head.appendChild(el);
  }
  el.setAttribute("href", href);
};

const BlogBestBurgersMamurdiRavet = () => {
  useEffect(() => {
    document.title = TITLE;
    setMeta("description", DESCRIPTION);
    setLink("canonical", CANONICAL);
    setMeta("og:title", TITLE, "property");
    setMeta("og:description", DESCRIPTION, "property");
    setMeta("og:url", CANONICAL, "property");
    setMeta("og:type", "article", "property");

    const ldId = "ld-blog-best-burgers";
    let ld = document.getElementById(ldId) as HTMLScriptElement | null;
    if (!ld) {
      ld = document.createElement("script");
      ld.id = ldId;
      ld.type = "application/ld+json";
      document.head.appendChild(ld);
    }
    ld.text = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "Article",
      headline: "The Best Burgers in Mamurdi & Ravet: Why Burger Rox Leads the Pack",
      description: DESCRIPTION,
      mainEntityOfPage: CANONICAL,
      author: { "@type": "Organization", name: "Burger Rox" },
      publisher: {
        "@type": "Organization",
        name: "Burger Rox",
        logo: { "@type": "ImageObject", url: "https://burgerrox.lovable.app/favicon-sm.png" },
      },
      datePublished: "2026-06-18",
      dateModified: "2026-06-18",
      image: "https://burgerrox.lovable.app/zinger-hero.webp",
      about: ["Mamurdi", "Ravet", "Punawale", "Kiwale", "Pune", "Best burgers in Pune"],
    });

    return () => {
      // leave meta in place; SPA next route will overwrite
    };
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main id="main-content" role="main" className="py-12 sm:py-16">
        <article className="container mx-auto px-4 max-w-3xl">
          <nav className="font-montserrat text-xs text-muted-foreground mb-4" aria-label="Breadcrumb">
            <Link to="/" className="hover:text-primary">Home</Link>
            <span aria-hidden="true"> / </span>
            <span>Blog</span>
            <span aria-hidden="true"> / </span>
            <span>Best Burgers in Mamurdi & Ravet</span>
          </nav>

          <h1 className="font-bebas text-4xl sm:text-5xl md:text-6xl tracking-wider text-foreground mb-3 leading-tight">
            THE BEST BURGERS IN MAMURDI & RAVET: WHY BURGER ROX LEADS THE PACK
          </h1>
          <p className="font-allura text-2xl text-primary mb-8">A local guide for Pune burger fans</p>

          <div className="font-montserrat text-sm sm:text-base text-muted-foreground space-y-6 leading-relaxed">
            <p>
              If you've been searching for the <strong>best burgers in Pune</strong> — especially around the
              fast-growing belt of Mamurdi, Ravet, Punawale and Kiwale — you already know the area has exploded
              with food options. But when locals want a burger that's freshly made, flame-grilled and built
              around a real homemade sauce (not a generic packet), one name keeps coming up: <strong>Burger Rox</strong>.
            </p>

            <p>
              This guide breaks down what actually makes a great neighbourhood burger, what's available nearby,
              and why Burger Rox has become the go-to choice for Mamurdi and Ravet families, students and
              late-evening cravings alike.
            </p>

            <section>
              <h2 className="font-bebas text-2xl tracking-wide text-foreground mb-2">What makes a great burger in Mamurdi & Ravet?</h2>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Freshly grilled patties</strong> — not pre-fried, not microwaved.</li>
                <li><strong>A real signature sauce</strong> — most chains rely on mayo + ketchup; the difference is huge.</li>
                <li><strong>Soft, fresh buns</strong> baked the same day.</li>
                <li><strong>Honest portion size</strong> for the price you pay.</li>
                <li><strong>Fast, reliable delivery</strong> within Mamurdi–Ravet–Punawale–Kiwale.</li>
              </ul>
            </section>

            <section>
              <h2 className="font-bebas text-2xl tracking-wide text-foreground mb-2">Why Burger Rox leads the pack</h2>
              <p>
                Burger Rox is a small, owner-run kitchen (a brother-sister duo) based right in Urban Forest,
                Mamurdi. Because the team cooks each order to dispatch — not in bulk — every burger that
                reaches Ravet, Punawale or Kiwale is hot, juicy and properly assembled.
              </p>
              <ol className="list-decimal pl-6 space-y-2 mt-3">
                <li><strong>Flame-grilled patties:</strong> chicken and veg patties hit the grill the moment your order is placed — never pre-cooked trays.</li>
                <li><strong>Homemade Blaze sauce:</strong> the signature sauce is made in-house, not bought. It's the single biggest thing regulars mention in reviews.</li>
                <li><strong>Local, fast delivery:</strong> ₹0 delivery within 3 km of Urban Forest (covers most of Mamurdi & Kiwale), and we deliver up to 12 km — reaching Ravet, Punawale and parts of Wakad.</li>
                <li><strong>Direct prices beat aggregators:</strong> ordering on burgerrox.com (or WhatsApp) is cheaper than Zomato — plus an extra ₹10 off on online payment.</li>
                <li><strong>Real WhatsApp confirmation:</strong> every order is confirmed by a human on WhatsApp, with live status — no black-box tracking.</li>
              </ol>
            </section>

            <section>
              <h2 className="font-bebas text-2xl tracking-wide text-foreground mb-2">Most-loved burgers to try first</h2>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Blaze Chicken Burger</strong> — the flagship. Flame-grilled chicken, lettuce, cheese, signature Blaze sauce.</li>
                <li><strong>Zinger Burger</strong> — crispy fried chicken for the spicy-crunch crowd.</li>
                <li><strong>Aloo Tikki Burger</strong> — a proper veg option that doesn't taste like an afterthought.</li>
                <li><strong>Combo + Potato Wedges</strong> — add the ₹69 wedges; it's the most-added item in carts for a reason.</li>
              </ul>
              <p className="mt-3">
                See the full lineup with prices on the{" "}
                <Link to="/menu" className="text-primary hover:underline font-semibold">Burger Rox menu</Link>.
              </p>
            </section>

            <section>
              <h2 className="font-bebas text-2xl tracking-wide text-foreground mb-2">Delivery in Mamurdi, Ravet, Punawale & Kiwale</h2>
              <p>
                We deliver daily from <strong>7 PM to 10 PM</strong> within 12 km of Urban Forest, Mamurdi (Kiwale).
                Free delivery up to 3 km; distance-based charges beyond that — full breakdown on the{" "}
                <Link to="/delivery-area" className="text-primary hover:underline font-semibold">delivery area page</Link>.
              </p>
              <p>
                Minimum order for delivery is ₹149. Pickup has no minimum — order on WhatsApp and grab it
                straight from the kitchen.
              </p>
            </section>

            <section>
              <h2 className="font-bebas text-2xl tracking-wide text-foreground mb-2">How to order</h2>
              <ul className="list-disc pl-6 space-y-2">
                <li>Order online at <Link to="/menu" className="text-primary hover:underline font-semibold">burgerrox.com/menu</Link> — pay online for ₹10 off, or choose Cash on Delivery.</li>
                <li>Or WhatsApp <a href="https://wa.me/919321389985" className="text-primary hover:underline font-semibold" target="_blank" rel="noopener noreferrer">+91 93213 89985</a> directly.</li>
              </ul>
            </section>

            <section>
              <h2 className="font-bebas text-2xl tracking-wide text-foreground mb-2">The bottom line</h2>
              <p>
                For Mamurdi, Ravet, Punawale and Kiwale, the <strong>best burger near you</strong> isn't a global
                chain — it's the small kitchen down the road that's actually grilling your patty when you tap order.
                Try Burger Rox once on a Friday night — that's how most of our regulars started.
              </p>
            </section>
          </div>

          <div className="mt-10 flex flex-col sm:flex-row gap-3">
            <Button variant="brand" className="font-montserrat font-bold" asChild>
              <Link to="/menu">Order Now</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link to="/">Back to Home</Link>
            </Button>
          </div>
        </article>
      </main>
      <Footer />
    </div>
  );
};

export default BlogBestBurgersMamurdiRavet;