alter table "public"."users" add column "is_instance_admin" boolean not null default false;

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.tenants_after_actions_security_definer()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$BEGIN

  IF TG_OP = 'INSERT' AND auth.uid() != NULL THEN
    INSERT INTO public.memberships(tenant_id, user_id) VALUES (NEW.id, auth.uid());
  END IF;

  RETURN COALESCE(NEW,OLD);

END;$function$
;

create policy "insert: user"
on "public"."tenants"
as permissive
for select
to public
using ((EXISTS ( SELECT 1
   FROM users
  WHERE ((users.id = auth.uid()) AND (users.is_instance_admin = true)))));


CREATE TRIGGER tenants_after_actions_security_definer AFTER INSERT OR DELETE OR UPDATE ON public.tenants FOR EACH ROW EXECUTE FUNCTION tenants_after_actions_security_definer();


