set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.secrets_before_actions_security_definer()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$BEGIN
  -- WARN: security definer

  IF TG_OP = 'INSERT' THEN
    NEW.secret_id := vault.create_secret(' '::text, NEW.id::text, ''::text);
  END IF;

  RETURN COALESCE(NEW, OLD);

END;$function$
;


