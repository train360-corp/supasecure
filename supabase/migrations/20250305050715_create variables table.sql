create table "public"."variables" (
    "id" uuid not null default gen_random_uuid(),
    "workspace_id" uuid not null,
    "display" text not null
);


alter table "public"."variables" enable row level security;

CREATE UNIQUE INDEX variables_pkey ON public.variables USING btree (id);

alter table "public"."variables" add constraint "variables_pkey" PRIMARY KEY using index "variables_pkey";

alter table "public"."variables" add constraint "variables_workspace_id_fkey" FOREIGN KEY (workspace_id) REFERENCES workspaces(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."variables" validate constraint "variables_workspace_id_fkey";

grant delete on table "public"."variables" to "anon";

grant insert on table "public"."variables" to "anon";

grant references on table "public"."variables" to "anon";

grant select on table "public"."variables" to "anon";

grant trigger on table "public"."variables" to "anon";

grant truncate on table "public"."variables" to "anon";

grant update on table "public"."variables" to "anon";

grant delete on table "public"."variables" to "authenticated";

grant insert on table "public"."variables" to "authenticated";

grant references on table "public"."variables" to "authenticated";

grant select on table "public"."variables" to "authenticated";

grant trigger on table "public"."variables" to "authenticated";

grant truncate on table "public"."variables" to "authenticated";

grant update on table "public"."variables" to "authenticated";

grant delete on table "public"."variables" to "service_role";

grant insert on table "public"."variables" to "service_role";

grant references on table "public"."variables" to "service_role";

grant select on table "public"."variables" to "service_role";

grant trigger on table "public"."variables" to "service_role";

grant truncate on table "public"."variables" to "service_role";

grant update on table "public"."variables" to "service_role";

create policy "all: workspace"
on "public"."variables"
as permissive
for all
to authenticated
using (is_workspace_authorized(workspace_id, 'ADMIN'::membership_type));


create policy "select: workspace"
on "public"."variables"
as permissive
for select
to authenticated
using (is_workspace_authorized(workspace_id, 'USER'::membership_type));



