import { Card, CardContent } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';

export default function WelcomeMessage() {
  const { user, profile } = useAuth();

  if (!user || !profile) return null;

  return (
    <Card className="mx-6 lg:mx-8 mb-8 bg-gradient-to-r from-primary/10 to-secondary/10 border-primary/20">
      <CardContent className="p-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-primary mb-2">
            Welcome back, {profile.name}! 🍔
          </h2>
          <p className="text-muted-foreground">
            Ready to enjoy some rockin' homemade flavor? Browse our menu and add items to your cart!
          </p>
        </div>
      </CardContent>
    </Card>
  );
}