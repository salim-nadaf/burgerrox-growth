import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Store, Truck } from 'lucide-react';

export type OrderType = 'pickup' | 'delivery';

interface OrderTypeSelectorProps {
  value: OrderType;
  onChange: (value: OrderType) => void;
}

const RESTAURANT_ADDRESS = "Urban Forest, Mamurdi, Saint Tukaram Nagar Road, Kiwale, Pune 412101";

export default function OrderTypeSelector({ value, onChange }: OrderTypeSelectorProps) {
  return (
    <div className="space-y-2">
      <p className="font-montserrat text-xs font-medium text-foreground">How would you like to receive your order?</p>
      <RadioGroup value={value} onValueChange={(v) => onChange(v as OrderType)} className="gap-2">
        <div 
          className={`flex items-center space-x-3 p-3 border rounded-md cursor-pointer transition-colors ${
            value === 'pickup' ? 'border-primary bg-primary/5' : 'border-border/40 hover:border-border'
          }`}
          onClick={() => onChange('pickup')}
        >
          <RadioGroupItem value="pickup" id="pickup" />
          <Label htmlFor="pickup" className="flex items-center space-x-2.5 cursor-pointer flex-1">
            <Store className="h-4 w-4 text-primary shrink-0" />
            <div>
              <p className="font-montserrat font-medium text-sm">Pickup</p>
              <p className="text-[11px] text-muted-foreground">Collect from our store — no minimum</p>
            </div>
          </Label>
        </div>
        
        <div 
          className={`flex items-center space-x-3 p-3 border rounded-md cursor-pointer transition-colors ${
            value === 'delivery' ? 'border-primary bg-primary/5' : 'border-border/40 hover:border-border'
          }`}
          onClick={() => onChange('delivery')}
        >
          <RadioGroupItem value="delivery" id="delivery" />
          <Label htmlFor="delivery" className="flex items-center space-x-2.5 cursor-pointer flex-1">
            <Truck className="h-4 w-4 text-primary shrink-0" />
            <div>
              <p className="font-montserrat font-medium text-sm">Delivery</p>
              <p className="text-[11px] text-muted-foreground">Free within 3km · Min order ₹149 · Up to 12km</p>
            </div>
          </Label>
        </div>
      </RadioGroup>
      
      {value === 'pickup' && (
        <div className="p-2.5 bg-muted/30 rounded-md border border-border/30">
          <p className="font-montserrat text-[11px] text-muted-foreground">
            <Store className="h-3 w-3 inline mr-1 text-primary" />
            {RESTAURANT_ADDRESS}
          </p>
        </div>
      )}
    </div>
  );
}

export { RESTAURANT_ADDRESS };
