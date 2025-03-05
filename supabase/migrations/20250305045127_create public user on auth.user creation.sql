set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public."auth_users_after_actions"()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$BEGIN

  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.users(id) VALUES (NEW.id);
    INSERT INTO public.preferences(id) VALUES (NEW.id);
  END IF;

  RETURN COALESCE(NEW, OLD);

END;$function$
;

CREATE TRIGGER auth_users_after_actions AFTER INSERT OR DELETE OR UPDATE ON auth.users FOR EACH ROW EXECUTE FUNCTION "auth_users_after_actions"();


