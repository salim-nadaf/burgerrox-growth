import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { ClipboardList } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import OrderHistory from './OrderHistory';

export default function OrdersSheet() {
  const { user } = useAuth();

  if (!user) {
    return (
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline" size="icon" aria-label="View orders">
            <ClipboardList className="h-4 w-4" />
          </Button>
        </SheetTrigger>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>My Orders</SheetTitle>
            <SheetDescription>
              Please login to view your orders
            </SheetDescription>
          </SheetHeader>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="icon" aria-label="View orders">
          <ClipboardList className="h-4 w-4" />
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-lg">
        <SheetHeader>
          <SheetTitle>My Orders</SheetTitle>
          <SheetDescription>
            Track your order history and status
          </SheetDescription>
        </SheetHeader>
        <div className="mt-4">
          <OrderHistory />
        </div>
      </SheetContent>
    </Sheet>
  );
}
