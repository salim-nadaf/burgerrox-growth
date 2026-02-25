
-- Create customers table
CREATE TABLE public.customers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  whatsapp TEXT NOT NULL UNIQUE,
  address TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;

-- No public RLS needed - managed via service role in edge functions only

-- Add customer_id to orders (nullable for backward compatibility)
ALTER TABLE public.orders ADD COLUMN customer_id UUID REFERENCES public.customers(id);

-- Create sequence for atomic order numbering
CREATE SEQUENCE IF NOT EXISTS public.order_number_seq;

-- Sync sequence with existing orders
DO $$
DECLARE
  max_num INTEGER;
BEGIN
  SELECT COALESCE(MAX(
    CASE 
      WHEN order_number ~ '^BRX-\d+$' 
      THEN CAST(SUBSTRING(order_number FROM 'BRX-(\d+)') AS INTEGER)
      ELSE 0
    END
  ), 0) INTO max_num FROM public.orders;
  
  PERFORM setval('public.order_number_seq', GREATEST(max_num, 1));
END $$;

-- Atomic order number generator function
CREATE OR REPLACE FUNCTION public.next_order_number()
RETURNS TEXT
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 'BRX-' || LPAD(nextval('public.order_number_seq')::text, 3, '0');
$$;

-- Update trigger for customers
CREATE TRIGGER update_customers_updated_at
BEFORE UPDATE ON public.customers
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
