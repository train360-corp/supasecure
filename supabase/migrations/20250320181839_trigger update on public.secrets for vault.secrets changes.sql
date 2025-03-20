set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.secrets_after_actions()
    RETURNS trigger
    LANGUAGE plpgsql
AS
$function$
BEGIN

    IF TG_OP = 'UPDATE' THEN
        UPDATE public.secrets s SET s.updated_at = (NOW at time zone 'utc') WHERE s.secret_id = NEW.id;
    END IF;

    RETURN coalesce(NEW, OLD);

END;
$function$
;

CREATE TRIGGER secrets_after_actions
    AFTER INSERT OR DELETE OR UPDATE
    ON vault.secrets
    FOR EACH ROW
EXECUTE FUNCTION secrets_after_actions();


