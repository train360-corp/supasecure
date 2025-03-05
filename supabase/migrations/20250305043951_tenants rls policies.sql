create policy "select: memberships"
on "public"."tenants"
as permissive
for select
to authenticated
using (is_authorized(id, 'USER'::membership_type));


create policy "update: memberships"
on "public"."tenants"
as permissive
for update
to public
using (is_authorized(id, 'ADMIN'::membership_type));



