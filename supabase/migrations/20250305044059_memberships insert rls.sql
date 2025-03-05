create policy "insert: memberships"
on "public"."memberships"
as permissive
for insert
to authenticated
with check (is_authorized(tenant_id, 'ADMIN'::membership_type));



