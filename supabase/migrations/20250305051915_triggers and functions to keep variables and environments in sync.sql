set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.environments_after_actions()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$DECLARE
  variable public.variables%rowtype := NULL;
BEGIN

  IF TG_OP = 'INSERT' THEN
    FOR variable IN SELECT * FROM public.variables v WHERE v.workspace_id = NEW.workspace_id LOOP
      INSERT INTO public.secrets(
        workspace_id, 
        environment_id, 
        variable_id
      ) VALUES (
        NEW.workspace_id,
        NEW.id,
        variable.id
      );
    END LOOP;
  END IF;

  RETURN COALESCE (NEW, OLD);

END;$function$
;

CREATE OR REPLACE FUNCTION public.variables_after_actions()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$DECLARE
  environment public.environments%rowtype := NULL;
BEGIN

  IF TG_OP = 'INSERT' THEN
    FOR environment IN SELECT * FROM public.environments e WHERE e.workspace_id = NEW.workspace_id LOOP
      INSERT INTO public.secrets(
        workspace_id, 
        environment_id, 
        variable_id
      ) VALUES (
        NEW.workspace_id,
        environment.id,
        NEW.id
      );
    END LOOP;
  END IF;

  RETURN COALESCE (NEW, OLD);

END;$function$
;

CREATE TRIGGER environments_after_actions AFTER INSERT OR DELETE OR UPDATE ON public.environments FOR EACH ROW EXECUTE FUNCTION environments_after_actions();

CREATE TRIGGER variables_after_actions AFTER INSERT OR DELETE OR UPDATE ON public.variables FOR EACH ROW EXECUTE FUNCTION variables_after_actions();


