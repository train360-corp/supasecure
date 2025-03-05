set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.update_secret(secret_id uuid, new_value text)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$DECLARE
  secret public.secrets%rowtype;
BEGIN

  SELECT * FROM public.secrets s INTO secret WHERE s.id = secret_id LIMIT 1;
  IF secret IS NULL OR secret.id IS NULL THEN
    RAISE EXCEPTION 'unable to load secret (id="%")', secret_id;
  END IF;

  IF NOT is_workspace_authorized(secret.workspace_id, 'ADMIN'::public.user_type) THEN
    RAISE EXCEPTION 'unauthorized for secret (id="%")', secret_id;
  END IF;

  select
  vault.update_secret(secret.secret_id, COALESCE(new_value, ''));

END;$function$
;


