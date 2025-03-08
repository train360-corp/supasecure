create policy "all: workspace"
on "public"."secrets"
as permissive
for all
to authenticated
using (is_workspace_authorized(workspace_id, 'ADMIN'::membership_type));



