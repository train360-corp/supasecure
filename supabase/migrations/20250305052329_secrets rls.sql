create policy "select: workspace"
on "public"."secrets"
as permissive
for select
to authenticated
using (is_workspace_authorized(workspace_id, 'USER'::membership_type));



