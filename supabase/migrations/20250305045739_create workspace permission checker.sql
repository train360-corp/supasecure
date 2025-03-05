set
check_function_bodies = off;

CREATE
OR REPLACE FUNCTION public.is_workspace_authorized(ws uuid, permission "public"."membership_type")
 RETURNS boolean
 LANGUAGE plpgsql
 STABLE
AS $function$DECLARE
  workspace public.workspaces%rowtype := NULL;
BEGIN

SELECT *
FROM public.workspaces w INTO workspace
where w.id = ws;

IF
workspace IS NULL OR workspace.id IS NULL THEN
    RAISE WARNING 'unable to load workspace';
RETURN FALSE;
END IF;

RETURN is_authorized(workspace.tenant_id, permission);

END;$function$
;


