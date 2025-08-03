import { Card, CardContent } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { useEffect, useState } from 'react';

export default function WelcomeMessage() {
  const { user, profile, loading } = useAuth();
  const [isNewUser, setIsNewUser] = useState(false);

  useEffect(() => {
    if (user && profile) {
      // Check if user was created recently (within last 5 minutes) to determine if they're new
      const userCreatedAt = new Date(user.created_at);
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
      setIsNewUser(userCreatedAt > fiveMinutesAgo);
    }
  }, [user, profile]);

  // Debug logging
  console.log('WelcomeMessage - User:', user?.id);
  console.log('WelcomeMessage - Profile:', profile);
  console.log('WelcomeMessage - Loading:', loading);
  console.log('WelcomeMessage - IsNewUser:', isNewUser);

  if (loading) {
    return null;
  }

  if (!user) {
    return null;
  }

  const getWelcomeMessage = () => {
    const name = profile?.name || 'there';
    
    if (isNewUser) {
      return {
        title: `Welcome to Burger Rox, ${name}! 🎉`,
        message: "Thanks for joining us! Get ready to experience some rockin' homemade flavor. Browse our menu and start your first order!"
      };
    } else {
      return {
        title: `Welcome back, ${name}! 🍔`,
        message: "Ready to enjoy some more rockin' homemade flavor? Browse our menu and add items to your cart!"
      };
    }
  };

  const { title, message } = getWelcomeMessage();

  return (
    <Card className="mx-6 lg:mx-8 mb-8 bg-gradient-to-r from-primary/10 to-secondary/10 border-primary/20">
      <CardContent className="p-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-primary mb-2">
            {title}
          </h2>
          <p className="text-muted-foreground">
            {message}
          </p>
          {profile?.area && (
            <p className="text-sm text-muted-foreground mt-2">
              Delivering to: {profile.area}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}