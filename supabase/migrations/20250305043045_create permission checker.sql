set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.is_authorized(tenant uuid, permission "public"."membership_type")
 RETURNS boolean
 LANGUAGE plpgsql
 STABLE
AS $function$DECLARE
  membership public.memberships%rowtype := NULL;
BEGIN

  SELECT * FROM public.memberships m INTO membership where m.user_id = auth.uid() AND m.tenant_id = tenant;

  IF membership IS NULL OR membership.id IS NULL THEN
    RAISE WARNING 'unable to load membership';
    RETURN FALSE;
  END IF;

  CASE permission::text
    WHEN 'ADMIN' THEN
      RETURN m.type = 'ADMIN'::"public"."membership_type";
    WHEN 'USER' THEN
      RETURN m.type = 'USER'::"public"."membership_type" OR m.type = 'ADMIN'::"public"."membership_type";
    ELSE
      RAISE WARNING 'permission type "%" unhandled', permission::text;
      RETURN FALSE;
  END CASE;

END;$function$
;


