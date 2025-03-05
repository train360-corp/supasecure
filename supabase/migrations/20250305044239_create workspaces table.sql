create table "public"."workspaces" (
    "id" uuid not null default gen_random_uuid(),
    "created_at" timestamp with time zone not null default (now() AT TIME ZONE 'utc'::text),
    "tenant_id" uuid not null,
    "display" text not null
);

create policy "select: memberships"
on "public"."workspaces"
as permissive
for select
to authenticated
using (is_authorized(tenant_id, 'USER'::membership_type));

create policy "update: memberships"
on "public"."workspaces"
as permissive
for update
to public
using (is_authorized(tenant_id, 'ADMIN'::membership_type));

alter table "public"."workspaces" enable row level security;

CREATE UNIQUE INDEX workspaces_pkey ON public.workspaces USING btree (id);

alter table "public"."workspaces" add constraint "workspaces_pkey" PRIMARY KEY using index "workspaces_pkey";

alter table "public"."workspaces" add constraint "workspaces_tenant_id_fkey" FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."workspaces" validate constraint "workspaces_tenant_id_fkey";

grant delete on table "public"."workspaces" to "anon";

grant insert on table "public"."workspaces" to "anon";

grant references on table "public"."workspaces" to "anon";

grant select on table "public"."workspaces" to "anon";

grant trigger on table "public"."workspaces" to "anon";

grant truncate on table "public"."workspaces" to "anon";

grant update on table "public"."workspaces" to "anon";

grant delete on table "public"."workspaces" to "authenticated";

grant insert on table "public"."workspaces" to "authenticated";

grant references on table "public"."workspaces" to "authenticated";

grant select on table "public"."workspaces" to "authenticated";

grant trigger on table "public"."workspaces" to "authenticated";

grant truncate on table "public"."workspaces" to "authenticated";

grant update on table "public"."workspaces" to "authenticated";

grant delete on table "public"."workspaces" to "service_role";

grant insert on table "public"."workspaces" to "service_role";

grant references on table "public"."workspaces" to "service_role";

grant select on table "public"."workspaces" to "service_role";

grant trigger on table "public"."workspaces" to "service_role";

grant truncate on table "public"."workspaces" to "service_role";

grant update on table "public"."workspaces" to "service_role";


