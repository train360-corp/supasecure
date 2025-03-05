set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.get_secrets(env_id uuid)
 RETURNS TABLE(id uuid, created_at timestamp with time zone, environment_id uuid, variable_id uuid, workspace_id uuid, uid text, variable text, secret text)
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$DECLARE
  env public.environments%rowtype := null;
BEGIN
    
  SELECT * from public.environments e into env WHERE e.id = env_id LIMIT 1;
  IF env IS NULL OR env.id IS NULL THEN
    RAISE EXCEPTION 'unable to load environment (id="%")', env_id;
  END IF;

  -- Return the secrets along with variable display name and resolved secret value
  RETURN QUERY 
    SELECT 
        s.id,
        s.created_at,
        s.environment_id,
        s.variable_id,
        s.workspace_id,
        s.uid,
        v.display AS variable,
        ds.decrypted_secret AS secret
    FROM public.secrets s
    JOIN public.variables v ON s.variable_id = v.id
    LEFT JOIN vault.decrypted_secrets ds ON s.secret_id = ds.id
    WHERE s.environment_id = env_id;
END;$function$
;


