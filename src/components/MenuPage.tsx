import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogTrigger, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import burgerTrio from "@/assets/burger-trio.jpg";
import friesImage from "@/assets/fries.jpg";
import nuggetsImage from "@/assets/nuggets.jpg";
import chickenBurgerImage from "@/assets/chicken-burger.jpg";
import eggBurgerImage from "@/assets/egg-burger.jpg";
import veggieBurgerImage from "@/assets/veggie-burger.jpg";
import comboMealImage from "@/assets/combo-meal.jpg";
import cokeImage from "@/assets/coca-cola.jpg";
import lavaCakeImage from "@/assets/lava-cake.jpg";
import restaurantGuruCertificate from "@/assets/RestaurantGuru_Certificate1 (1).png";
import { useCart } from "@/hooks/useCart";
import { useAuth } from "@/hooks/useAuth";
import AuthForm from "./AuthForm";

const getItemImage = (name: string, category: string) => {
  if (name.includes("Fries")) return friesImage;
  if (name.includes("Nuggets")) return nuggetsImage;
  if (category === "Chicken") return chickenBurgerImage;
  if (category === "Egg") return eggBurgerImage;
  if (category === "Vegetarian") return veggieBurgerImage;
  if (category === "Combos") return comboMealImage;
  if (name.includes("Coke")) return cokeImage;
  if (name.includes("Lava Cake")) return lavaCakeImage;
  return chickenBurgerImage; // default
};

const allMenuItems = [
  // Fries
  { name: "Salted Fries", description: "Hot, crunchy and irresistibly delicious.", price: 59, popular: true, category: "Fries", variants: [
    { size: "Small", price: 59 },
    { size: "Medium", price: 109 },
    { size: "Large", price: 129 }
  ]},
  { name: "Peri Peri Fries", description: "Golden crisp fries tossed in a flavorful blend of herbs and spices.", price: 69, popular: true, category: "Fries", variants: [
    { size: "Small", price: 69 },
    { size: "Medium", price: 119 },
    { size: "Large", price: 149 }
  ]},
  
  // Sides
  { name: "Chicken Nuggets [4 Pcs]", description: "Crispy fried chicken nuggets, perfect for a quick bite.", price: 89, popular: true, category: "Sides" },
  
  // Burgers
  { name: "Burger Rox Zinger", description: "Premium chicken breast fried to perfection with signature sauce and liquid cheese.", price: 259, popular: true, category: "Chicken" },
  { name: "Chicken Classic", description: "Classic chicken burger with fresh toppings and signature sauce.", price: 99, popular: true, category: "Chicken" },
  { name: "Chicken Blaze Crisp", description: "Crispy chicken with signature sauce, fresh onion, tomato and lettuce.", price: 109, popular: false, category: "Chicken" },
  { name: "Egg Cellent Fusion", description: "Aloo tikki with scrambled eggs, onion, tomato, lettuce and signature sauce.", price: 169, popular: false, category: "Egg" },
  { name: "Aloo Tikki", description: "Crispy aloo tikki patty with onion, tomato, lettuce and signature sauce.", price: 89, popular: true, category: "Vegetarian" },
  { name: "Veggie Blaze Crisp", description: "Veg crispy burger with onion, tomato, lettuce and crispy patty.", price: 89, popular: false, category: "Vegetarian" },
  
  // Combos
  { name: "Classic Delight [Serves 2]", description: "2 Chicken Classic Burgers + Coke [250 ml].", price: 239, popular: true, category: "Combos" },
  { name: "Veggie Crisp Duo [Serves 2]", description: "2 Veg Crispy Burgers + Golden Medium Fries.", price: 299, popular: false, category: "Combos" },
  { name: "Double Egg Stravagance [Serves 2]", description: "2 Aloo Tikki Egg Burgers + Chicken Nuggets [2 Pcs].", price: 339, popular: false, category: "Combos" },
  { name: "Rox Veggie Twist [Serves 2]", description: "2 Aloo Tikki burgers, medium fries and molten lava cake.", price: 369, popular: false, category: "Combos" },
  { name: "Zinger Value Meal [Serves 2]", description: "2 Zinger Burgers + Medium Fries + Coke [250 ml] + Nuggets [2 Pcs].", price: 459, popular: false, category: "Combos" },
  { name: "Aloo Tikki Fiesta [Serves 4]", description: "4x the flavor with Indian spices and crispy texture, served with large Coke.", price: 399, popular: false, category: "Combos" },
  { name: "Crispy Chaos [Serves 4]", description: "2 Veg Crispy + 2 Chicken Crispy Patties + Large Fries.", price: 529, popular: true, category: "Combos" },
  { name: "Rox Family Fiesta [Serves 4]", description: "4 Crispy Veg Burgers + Large Fries + Coke [350 ml].", price: 539, popular: true, category: "Combos" },
  { name: "Rox Zinger Blast [Serves 4]", description: "2 Zinger + 2 Classic Burgers + 2 Choco Lava Cakes.", price: 599, popular: true, category: "Combos" },
  { name: "Classic Blaze Box [Serves 4]", description: "4 Chicken Classic + Nuggets [4 Pcs] + 2 Lava Cakes.", price: 629, popular: false, category: "Combos" },
  
  // Beverages
  { name: "Coke", description: "Refreshing coca cola.", price: 69, popular: true, category: "Beverages", variants: [
    { size: "Medium", price: 69 },
    { size: "Large", price: 99 }
  ]},
  
  // Desserts
  { name: "Molten Lava Cake [80g]", description: "Rich, decadent cake oozing with warm, velvety chocolate center.", price: 79, popular: true, category: "Desserts" },
];

interface MenuPageProps {
  showAll?: boolean;
}

const MenuPage = ({ showAll = false }: MenuPageProps) => {
  const { addToCart } = useCart();
  const { user } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [authDialogOpen, setAuthDialogOpen] = useState(false);

  const displayItems = showAll ? allMenuItems : allMenuItems.slice(0, 6);
  const categories = ["All", "Fries", "Sides", "Chicken", "Egg", "Vegetarian", "Combos", "Beverages", "Desserts"];
  
  const filteredItems = selectedCategory === 'All' 
    ? displayItems 
    : displayItems.filter(item => item.category === selectedCategory);

  const handleAddToCart = async (itemName: string, itemPrice: number) => {
    await addToCart(itemName, itemPrice);
  };

  return (
    <section id="menu" className="py-12 sm:py-20 bg-secondary/30" aria-labelledby="menu-heading">
      <div className="container mx-auto px-4">
        <header className="text-center mb-12 sm:mb-16">
          <h2 id="menu-heading" className="font-bebas text-5xl sm:text-6xl md:text-7xl text-foreground tracking-wider mb-4">
            {showAll ? 'FULL MENU' : 'MENU FAVORITES'}
          </h2>
          <p className="font-allura text-2xl md:text-3xl text-primary mb-6" role="doc-subtitle">
            Rockin' homemade flavor
          </p>
          <p className="font-montserrat text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto">
            We keep it simple with burgers that actually slap. No weird ingredients, 
            no pretentious names – just good food that won't break your budget.
          </p>
        </header>

        {showAll && (
          <nav className="flex justify-center mb-8 px-4" aria-label="Menu category filter">
            <div className="flex flex-wrap gap-2 justify-center max-w-4xl" role="group">
              {categories.map((category) => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? "default" : "outline"}
                  onClick={() => setSelectedCategory(category)}
                  className="text-sm px-3 py-2"
                  aria-pressed={selectedCategory === category}
                  aria-label={`Filter by ${category}`}
                >
                  {category}
                </Button>
              ))}
            </div>
          </nav>
        )}

        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Main Menu Grid */}
            <div className="flex-1">
              <div className={showAll ? "grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3" : "grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"} role="list" aria-label="Menu items">
                {filteredItems.map((burger, index) => (
                  <article key={`${burger.name}-${index}`} role="listitem">
                    <Card className="border-2 border-border hover:border-primary transition-all duration-300 hover:shadow-brand h-full">
                      <CardContent className="p-4">
                    <div className="flex gap-3 mb-4">
                      <img 
                        src={getItemImage(burger.name, burger.category)} 
                        alt={`${burger.name} - ${burger.description}`}
                        className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
                        width="64"
                        height="64"
                        loading="lazy"
                        decoding="async"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col gap-1 mb-2">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <h3 className="font-bebas text-lg sm:text-xl text-foreground tracking-wide leading-tight">
                                {burger.name}
                              </h3>
                              {burger.popular && (
                                <Badge variant="default" className="bg-primary text-primary-foreground text-xs mt-1" aria-label="Popular item">
                                  POPULAR
                                </Badge>
                              )}
                            </div>
                            {!(burger as any).variants && (
                              <span className="font-bebas text-lg sm:text-xl text-primary flex-shrink-0" aria-label={`Price ${burger.price} rupees`}>
                                ₹{burger.price}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                    <p className="font-montserrat text-sm text-muted-foreground leading-relaxed mb-4">
                      {burger.description}
                    </p>
                   
                    {(burger as any).variants ? (
                      <div className="space-y-2" role="group" aria-label={`${burger.name} size options`}>
                        {(burger as any).variants.map((variant: any, variantIndex: number) => (
                          <div key={variantIndex} className="flex justify-between items-center p-2 border rounded-lg">
                            <span className="font-montserrat text-sm text-foreground">{variant.size}</span>
                            <div className="flex items-center space-x-2">
                              <span className="font-bebas text-base text-primary" aria-label={`${variant.size} price ${variant.price} rupees`}>₹{variant.price}</span>
                              {user ? (
                                <Button 
                                  onClick={() => handleAddToCart(`${burger.name} (${variant.size})`, variant.price)}
                                  size="sm"
                                  className="text-xs px-2 py-1"
                                  aria-label={`Add ${burger.name} ${variant.size} to cart`}
                                >
                                  Add
                                </Button>
                              ) : (
                                <Dialog open={authDialogOpen} onOpenChange={setAuthDialogOpen}>
                                  <DialogTrigger asChild>
                                    <Button size="sm" className="text-xs px-2 py-1" aria-label={`Add ${burger.name} ${variant.size} to cart - login required`}>
                                      Add to Cart
                                    </Button>
                                  </DialogTrigger>
                                  <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
                                    <DialogTitle className="sr-only">Authentication</DialogTitle>
                                    <DialogDescription className="sr-only">Login or create an account to add items to cart</DialogDescription>
                                    <AuthForm onClose={() => setAuthDialogOpen(false)} />
                                  </DialogContent>
                                </Dialog>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      user ? (
                        <Button 
                          onClick={() => handleAddToCart(burger.name, burger.price)}
                          className="w-full"
                          size="sm"
                          aria-label={`Add ${burger.name} to cart for ${burger.price} rupees`}
                        >
                          Add to Cart
                        </Button>
                      ) : (
                        <Dialog open={authDialogOpen} onOpenChange={setAuthDialogOpen}>
                          <DialogTrigger asChild>
                            <Button className="w-full" size="sm" aria-label={`Add ${burger.name} to cart - login required`}>
                              Add to Cart
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto" role="dialog" aria-labelledby="auth-title">
                            <DialogTitle id="auth-title" className="sr-only">Authentication</DialogTitle>
                            <DialogDescription className="sr-only">Login or create an account to add items to cart</DialogDescription>
                            <AuthForm onClose={() => setAuthDialogOpen(false)} />
                          </DialogContent>
                        </Dialog>
                      )
                    )}
                  </CardContent>
                </Card>
              </article>
                ))}
              </div>
            </div>
            
            {/* Side Certificate Section - Only on full menu page */}
            {showAll && (
              <aside className="lg:w-64 xl:w-72 flex-shrink-0">
                <div className="lg:sticky lg:top-24 space-y-4">
                  <Card className="border-2 border-primary/20 bg-card/50 backdrop-blur-sm">
                    <CardContent className="p-4 text-center">
                      <p className="font-bebas text-lg text-foreground mb-3 tracking-wide">CERTIFIED QUALITY</p>
                      <a 
                        href="https://restaurant-guru.in/Burger-Rox-Pimpri-Chinchwad" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="block hover:opacity-90 transition-opacity"
                        aria-label="View our Restaurant Guru certification"
                      >
                        <img 
                          src={restaurantGuruCertificate} 
                          alt="Restaurant Guru Certificate - Burger Rox Recommended 2025"
                          className="w-full max-w-[200px] mx-auto rounded-lg shadow-md"
                          loading="lazy"
                          decoding="async"
                        />
                      </a>
                      <p className="font-montserrat text-xs text-muted-foreground mt-3">
                        Recommended by Restaurant Guru
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </aside>
            )}
          </div>
            
          <nav className="pt-6 sm:pt-8 space-y-4 flex flex-col sm:flex-row sm:space-y-0 sm:space-x-4 justify-center items-center" aria-label="Menu actions">
            {!showAll && (
              <Link to="/menu">
                <Button 
                  variant="outline" 
                  size="lg" 
                  className="w-full sm:w-auto"
                  aria-label="View complete menu"
                >
                  View Full Menu
                </Button>
              </Link>
            )}
            <Button 
              variant="brand" 
              size="lg" 
              className="w-full sm:w-auto"
              onClick={() => window.open('https://wa.me/919970078688', '_blank')}
              aria-label="Order via WhatsApp"
            >
              Order on WhatsApp
            </Button>
          </nav>
        </div>
      </div>
    </section>
  );
};

export default MenuPage;