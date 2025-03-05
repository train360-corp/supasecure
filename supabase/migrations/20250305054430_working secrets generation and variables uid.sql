alter table "public"."secrets" add column "secret_id" uuid not null;

alter table "public"."variables" add column "uid" text not null generated always as (((workspace_id || ':'::text) || display)) stored;

CREATE UNIQUE INDEX secrets_secret_id_key ON public.secrets USING btree (secret_id);

CREATE UNIQUE INDEX variables_uid_key ON public.variables USING btree (uid);

alter table "public"."secrets" add constraint "secrets_secret_id_key" UNIQUE using index "secrets_secret_id_key";

alter table "public"."variables" add constraint "variables_uid_key" UNIQUE using index "variables_uid_key";

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.secrets_before_actions_security_definer()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$BEGIN
  -- WARN: security definer

  IF TG_OP = 'INSERT' THEN
    NEW.secret_id := vault.create_secret(''::text, NEW.id::text, ''::text);
  END IF;

  RETURN COALESCE(NEW, OLD);

END;$function$
;

CREATE TRIGGER secrets_before_actions_security_definer BEFORE INSERT OR DELETE OR UPDATE ON public.secrets FOR EACH ROW EXECUTE FUNCTION secrets_before_actions_security_definer();


