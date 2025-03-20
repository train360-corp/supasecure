set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.vault_secrets_after_actions()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$BEGIN

    IF TG_OP = 'UPDATE' THEN
        UPDATE public.secrets
        SET updated_at = NOW() AT TIME ZONE 'UTC'
        WHERE secret_id = NEW.id;
    END IF;

    RETURN coalesce(NEW, OLD);
END;$function$
;

CREATE TRIGGER vault_secrets_after_actions AFTER INSERT OR DELETE OR UPDATE ON vault.secrets FOR EACH ROW EXECUTE FUNCTION vault_secrets_after_actions();


