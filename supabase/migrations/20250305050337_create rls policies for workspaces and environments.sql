drop policy "update: memberships" on "public"."workspaces";

create policy "all: workspace"
on "public"."environment"
as permissive
for all
to authenticated
using (is_workspace_authorized(workspace_id, 'ADMIN'::membership_type));


create policy "select: workspace"
on "public"."environment"
as permissive
for select
to authenticated
using (is_workspace_authorized(workspace_id, 'USER'::membership_type));


create policy "all: memberships"
on "public"."workspaces"
as permissive
for all
to authenticated
using (is_authorized(tenant_id, 'ADMIN'::membership_type));



