-- Add database-level validation constraints using triggers (not CHECK constraints for flexibility)

-- Create validation function for profiles table
CREATE OR REPLACE FUNCTION public.validate_profile_data()
RETURNS TRIGGER AS $$
BEGIN
  -- Validate name length (minimum 2 characters)
  IF NEW.name IS NOT NULL AND LENGTH(TRIM(NEW.name)) < 2 THEN
    RAISE EXCEPTION 'Name must be at least 2 characters';
  END IF;
  
  -- Validate WhatsApp number format (exactly 10 digits)
  IF NEW.whatsapp_number IS NOT NULL AND NEW.whatsapp_number !~ '^\d{10}$' THEN
    RAISE EXCEPTION 'WhatsApp number must be exactly 10 digits';
  END IF;
  
  -- Validate area length (minimum 4 characters if provided)
  IF NEW.area IS NOT NULL AND LENGTH(TRIM(NEW.area)) < 4 THEN
    RAISE EXCEPTION 'Area must be at least 4 characters';
  END IF;
  
  -- Trim whitespace from text fields
  NEW.name := TRIM(NEW.name);
  IF NEW.area IS NOT NULL THEN
    NEW.area := TRIM(NEW.area);
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for profile validation
DROP TRIGGER IF EXISTS validate_profile_before_insert_update ON public.profiles;
CREATE TRIGGER validate_profile_before_insert_update
  BEFORE INSERT OR UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_profile_data();

-- Create validation function for orders table
CREATE OR REPLACE FUNCTION public.validate_order_data()
RETURNS TRIGGER AS $$
BEGIN
  -- Validate total_amount is positive
  IF NEW.total_amount <= 0 THEN
    RAISE EXCEPTION 'Total amount must be greater than 0';
  END IF;
  
  -- Validate order_number is not empty
  IF NEW.order_number IS NULL OR LENGTH(TRIM(NEW.order_number)) = 0 THEN
    RAISE EXCEPTION 'Order number is required';
  END IF;
  
  -- Validate payment_method is valid
  IF NEW.payment_method NOT IN ('cod', 'online', 'prepaid') THEN
    RAISE EXCEPTION 'Invalid payment method';
  END IF;
  
  -- Validate customer_whatsapp format if provided
  IF NEW.customer_whatsapp IS NOT NULL AND NEW.customer_whatsapp !~ '^\d{10}$' THEN
    RAISE EXCEPTION 'Customer WhatsApp number must be exactly 10 digits';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for order validation
DROP TRIGGER IF EXISTS validate_order_before_insert_update ON public.orders;
CREATE TRIGGER validate_order_before_insert_update
  BEFORE INSERT OR UPDATE ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_order_data();

-- Add RLS policies for orders table (UPDATE and DELETE)
-- Note: Orders should NOT be deletable by users, only viewable and insertable
-- For updates, we restrict to only payment_status updates by the owner

-- Policy to prevent any DELETE operations on orders by regular users
CREATE POLICY "Orders cannot be deleted by users"
  ON public.orders
  FOR DELETE
  USING (false);

-- Policy to prevent any UPDATE operations on orders by regular users
-- Orders should only be updated by backend/admin processes
CREATE POLICY "Orders cannot be updated by users"
  ON public.orders
  FOR UPDATE
  USING (false);