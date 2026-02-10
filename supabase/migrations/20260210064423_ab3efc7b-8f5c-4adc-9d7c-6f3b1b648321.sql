
CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  -- Validate and sanitize inputs from auth metadata
  INSERT INTO public.profiles (user_id, name, whatsapp_number, area)
  VALUES (
    NEW.id,
    COALESCE(
      CASE 
        WHEN LENGTH(TRIM(COALESCE(NEW.raw_user_meta_data->>'name', ''))) >= 2 
        THEN LEFT(TRIM(NEW.raw_user_meta_data->>'name'), 100)
        ELSE 'User'
      END,
      'User'
    ),
    CASE 
      WHEN (NEW.raw_user_meta_data->>'whatsapp_number') ~ '^\d{10}$' 
      THEN NEW.raw_user_meta_data->>'whatsapp_number'
      ELSE NULL
    END,
    CASE 
      WHEN LENGTH(TRIM(COALESCE(NEW.raw_user_meta_data->>'area', ''))) >= 4 
      THEN LEFT(TRIM(NEW.raw_user_meta_data->>'area'), 200)
      ELSE NULL
    END
  );
  RETURN NEW;
END;
$function$;
