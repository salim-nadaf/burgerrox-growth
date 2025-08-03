import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import burgerTrio from "@/assets/burger-trio.jpg";
import { useCart } from "@/hooks/useCart";
import { useAuth } from "@/hooks/useAuth";

const allMenuItems = [
  // Fries
  { name: "French Fries (Small)", description: "Golden crispy potato fries", price: 59, popular: true, category: "Fries" },
  { name: "French Fries (Medium)", description: "Golden crispy potato fries", price: 109, popular: false, category: "Fries" },
  { name: "French Fries (Large)", description: "Golden crispy potato fries", price: 129, popular: false, category: "Fries" },
  { name: "Peri Peri French Fries (Small)", description: "Spicy peri peri seasoned fries", price: 69, popular: true, category: "Fries" },
  { name: "Peri Peri French Fries (Medium)", description: "Spicy peri peri seasoned fries", price: 119, popular: false, category: "Fries" },
  { name: "Peri Peri French Fries (Large)", description: "Spicy peri peri seasoned fries", price: 149, popular: false, category: "Fries" },
  
  // Sides
  { name: "Nuggests", description: "Crispy chicken nuggets", price: 89, popular: true, category: "Sides" },
  
  // Burgers
  { name: "Burger Rox Zinger", description: "Spicy zinger burger with crispy chicken", price: 259, popular: true, category: "Chicken" },
  { name: "Chicken Classic", description: "Classic chicken burger", price: 89, popular: true, category: "Chicken" },
  { name: "Chicken Blaze Crisp Single Patty", description: "Crispy chicken patty with spicy sauce", price: 99, popular: false, category: "Chicken" },
  { name: "Chicken Blaze Crisp Double Patty", description: "Double crispy chicken patties with spicy sauce", price: 139, popular: false, category: "Chicken" },
  { name: "Egg-cellent Fusion", description: "Delicious egg burger with special fusion", price: 169, popular: false, category: "Egg" },
  { name: "Aloo Tikki", description: "Spiced potato patty burger", price: 79, popular: true, category: "Vegetarian" },
  { name: "Veggie Blaze Crisp Single Patty", description: "Crispy veggie patty with spicy sauce", price: 79, popular: false, category: "Vegetarian" },
  { name: "Veggie Blaze Crisp Double Patty", description: "Double crispy veggie patties with spicy sauce", price: 119, popular: false, category: "Vegetarian" },
  
  // Combos
  { name: "Claasic Delight", description: "Classic combo meal", price: 199, popular: true, category: "Combos" },
  { name: "Veggie Crisp Duo", description: "Veggie crisp combo meal", price: 249, popular: false, category: "Combos" },
  { name: "Double Egg-stravagance", description: "Double egg special combo", price: 299, popular: false, category: "Combos" },
  { name: "Crispy Chaos", description: "Ultimate crispy combo", price: 449, popular: true, category: "Combos" },
  { name: "Rox Zinger Blast", description: "Zinger special blast combo", price: 499, popular: true, category: "Combos" },
  { name: "Aloo Tikki Fiesta", description: "Aloo tikki special combo", price: 349, popular: false, category: "Combos" },
  { name: "Classic Blaze Box", description: "Classic blaze combo box", price: 499, popular: false, category: "Combos" },
  { name: "Rox Family Fiesta", description: "Family pack combo", price: 449, popular: true, category: "Combos" },
  { name: "Rox Veggie Twist", description: "Veggie special twist combo", price: 274, popular: false, category: "Combos" },
  { name: "Zinger Value meal", description: "Zinger value combo meal", price: 379, popular: false, category: "Combos" },
  
  // Beverages
  { name: "Coke (Medium)", description: "Refreshing coca cola", price: 69, popular: true, category: "Beverages" },
  { name: "Coke (Large)", description: "Refreshing coca cola large", price: 99, popular: false, category: "Beverages" },
  
  // Desserts
  { name: "Molten Choco Lava Cake", description: "Hot chocolate lava cake", price: 79, popular: true, category: "Desserts" },
];

interface MenuPageProps {
  showAll?: boolean;
}

const MenuPage = ({ showAll = false }: MenuPageProps) => {
  const { addToCart } = useCart();
  const { user } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const displayItems = showAll ? allMenuItems : allMenuItems.slice(0, 6);
  const categories = ["All", "Fries", "Sides", "Chicken", "Egg", "Vegetarian", "Combos", "Beverages", "Desserts"];
  
  const filteredItems = selectedCategory === 'All' 
    ? displayItems 
    : displayItems.filter(item => item.category === selectedCategory);

  const handleAddToCart = async (itemName: string, itemPrice: number) => {
    console.log('Adding to cart:', itemName, itemPrice, 'User:', user?.id);
    await addToCart(itemName, itemPrice);
  };

  console.log('MenuPage - User authenticated:', !!user);

  return (
    <section id="menu" className="py-20 bg-secondary/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="font-bebas text-6xl md:text-7xl text-foreground tracking-wider mb-4">
            {showAll ? 'FULL MENU' : 'MENU FAVORITES'}
          </h2>
          <p className="font-allura text-2xl md:text-3xl text-primary mb-6">
            Rockin' homemade flavor
          </p>
          <p className="font-montserrat text-lg text-muted-foreground max-w-2xl mx-auto">
            We keep it simple with burgers that actually slap. No weird ingredients, 
            no pretentious names – just good food that won't break your budget.
          </p>
        </div>

        {showAll && (
          <div className="flex justify-center mb-8">
            <div className="flex space-x-2">
              {categories.map((category) => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? "default" : "outline"}
                  onClick={() => setSelectedCategory(category)}
                >
                  {category}
                </Button>
              ))}
            </div>
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-12 items-start">
          <div className="space-y-6">
            {filteredItems.map((burger, index) => (
              <Card key={index} className="border-2 border-border hover:border-primary transition-all duration-300 hover:shadow-brand">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center space-x-3">
                      <h3 className="font-bebas text-2xl text-foreground tracking-wide">
                        {burger.name}
                      </h3>
                      {burger.popular && (
                        <Badge variant="default" className="bg-primary text-primary-foreground">
                          POPULAR
                        </Badge>
                      )}
                    </div>
                    <span className="font-bebas text-2xl text-primary">
                      ₹{burger.price}
                    </span>
                  </div>
                  <p className="font-montserrat text-muted-foreground leading-relaxed mb-4">
                    {burger.description}
                  </p>
                  <Button 
                    onClick={() => handleAddToCart(burger.name, burger.price)}
                    className="w-full"
                    disabled={!user}
                  >
                    {user ? 'Add to Cart' : 'Login to Add'}
                  </Button>
                </CardContent>
              </Card>
            ))}
            
            <div className="pt-6 space-y-4">
              {!showAll && (
                <Link to="/menu">
                  <Button 
                    variant="outline" 
                    size="lg" 
                    className="w-full sm:w-auto mr-4"
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
              >
                Order on WhatsApp
              </Button>
            </div>
          </div>

          {!showAll && (
            <div className="relative">
              <img 
                src={burgerTrio} 
                alt="Burger Rox menu favorites" 
                className="w-full rounded-2xl shadow-brand"
              />
               <div className="absolute -bottom-4 -right-4 bg-primary text-primary-foreground p-4 rounded-full font-bebas text-xl tracking-wider shadow-lg">
                STARTS AT ₹59!
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default MenuPage;