import Header from "@/components/Header";
import Hero from "@/components/Hero";
import MenuHighlights from "@/components/MenuHighlights";
import About from "@/components/About";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";
import WelcomeMessage from "@/components/WelcomeMessage";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <Hero />
        <WelcomeMessage />
        <MenuHighlights />
        <About />
        <Contact />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
