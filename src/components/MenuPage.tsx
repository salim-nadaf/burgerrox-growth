import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import burgerTrio from "@/assets/burger-trio.jpg";
import { useCart } from "@/hooks/useCart";
import { useAuth } from "@/hooks/useAuth";

const allMenuItems = [
  {
    name: "Paneer Tikka Burger",
    description: "Spiced paneer tikka with mint chutney, onions, and fresh vegetables",
    price: 180,
    popular: true,
    category: "Vegetarian"
  },
  {
    name: "Chicken Tikka Burger", 
    description: "Tender chicken tikka with special sauce, lettuce, and tomato",
    price: 200,
    popular: true,
    category: "Non-Vegetarian"
  },
  {
    name: "Veg Patty Burger",
    description: "Crispy vegetable patty with lettuce, tomato, and tangy sauce", 
    price: 140,
    popular: false,
    category: "Vegetarian"
  },
  {
    name: "Chicken Cheese Burger",
    description: "Juicy chicken patty with melted cheese and special mayo",
    price: 220,
    popular: true,
    category: "Non-Vegetarian"
  },
  {
    name: "Aloo Tikki Burger",
    description: "Traditional potato patty with chutneys and fresh vegetables",
    price: 120,
    popular: false,
    category: "Vegetarian"
  },
  {
    name: "Egg Burger", 
    description: "Fried egg with vegetables and special burger sauce",
    price: 100,
    popular: false,
    category: "Vegetarian"
  },
  {
    name: "Chicken Crispy Burger",
    description: "Crispy fried chicken with lettuce and special mayo",
    price: 190,
    popular: false,
    category: "Non-Vegetarian"
  },
  {
    name: "Veg Cheese Burger",
    description: "Vegetable patty with melted cheese and fresh vegetables",
    price: 160,
    popular: false,
    category: "Vegetarian"
  },
  {
    name: "Chicken BBQ Burger",
    description: "Grilled chicken with BBQ sauce and onions",
    price: 210,
    popular: false,
    category: "Non-Vegetarian"
  },
  {
    name: "Mushroom Swiss Burger",
    description: "Grilled mushrooms with Swiss cheese and herbs",
    price: 170,
    popular: false,
    category: "Vegetarian"
  }
];

interface MenuPageProps {
  showAll?: boolean;
}

const MenuPage = ({ showAll = false }: MenuPageProps) => {
  const { addToCart } = useCart();
  const { user } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const displayItems = showAll ? allMenuItems : allMenuItems.slice(0, 6);
  const categories = ['All', 'Vegetarian', 'Non-Vegetarian'];
  
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
                STARTS AT ₹100!
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default MenuPage;