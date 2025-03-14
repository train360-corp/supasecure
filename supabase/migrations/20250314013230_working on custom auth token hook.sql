set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.auth_users_after_actions()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$BEGIN

  IF TG_OP = 'INSERT' THEN

    IF NEW.email LIKE '%@supasecure.localhost' THEN
      -- create client profile
    ELSE
      -- create user profile
      INSERT INTO public.users(id) VALUES (NEW.id);
      INSERT INTO public.preferences(id) VALUES (NEW.id);
    END IF;
  END IF;

  RETURN COALESCE(NEW, OLD);

END;$function$
;


