import Header from "@/components/Header";
import Footer from "@/components/Footer";
import MenuPage from "@/components/MenuPage";

const Menu = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <MenuPage showAll={true} />
      </main>
      <Footer />
    </div>
  );
};

export default Menu;