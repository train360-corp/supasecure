drop policy "all: workspace" on "public"."environment";

drop policy "select: workspace" on "public"."environment";

revoke delete on table "public"."environment" from "anon";

revoke insert on table "public"."environment" from "anon";

revoke references on table "public"."environment" from "anon";

revoke select on table "public"."environment" from "anon";

revoke trigger on table "public"."environment" from "anon";

revoke truncate on table "public"."environment" from "anon";

revoke update on table "public"."environment" from "anon";

revoke delete on table "public"."environment" from "authenticated";

revoke insert on table "public"."environment" from "authenticated";

revoke references on table "public"."environment" from "authenticated";

revoke select on table "public"."environment" from "authenticated";

revoke trigger on table "public"."environment" from "authenticated";

revoke truncate on table "public"."environment" from "authenticated";

revoke update on table "public"."environment" from "authenticated";

revoke delete on table "public"."environment" from "service_role";

revoke insert on table "public"."environment" from "service_role";

revoke references on table "public"."environment" from "service_role";

revoke select on table "public"."environment" from "service_role";

revoke trigger on table "public"."environment" from "service_role";

revoke truncate on table "public"."environment" from "service_role";

revoke update on table "public"."environment" from "service_role";

alter table "public"."environment" drop constraint "environment_workspace_id_fkey";

alter table "public"."environment" drop constraint "environment_pkey";

drop index if exists "public"."environment_pkey";

drop table "public"."environment";

create table "public"."environments" (
    "id" uuid not null default gen_random_uuid(),
    "workspace_id" uuid not null,
    "display" text not null
);


alter table "public"."environments" enable row level security;

CREATE UNIQUE INDEX environment_pkey ON public.environments USING btree (id);

alter table "public"."environments" add constraint "environment_pkey" PRIMARY KEY using index "environment_pkey";

alter table "public"."environments" add constraint "environment_workspace_id_fkey" FOREIGN KEY (workspace_id) REFERENCES workspaces(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."environments" validate constraint "environment_workspace_id_fkey";

grant delete on table "public"."environments" to "anon";

grant insert on table "public"."environments" to "anon";

grant references on table "public"."environments" to "anon";

grant select on table "public"."environments" to "anon";

grant trigger on table "public"."environments" to "anon";

grant truncate on table "public"."environments" to "anon";

grant update on table "public"."environments" to "anon";

grant delete on table "public"."environments" to "authenticated";

grant insert on table "public"."environments" to "authenticated";

grant references on table "public"."environments" to "authenticated";

grant select on table "public"."environments" to "authenticated";

grant trigger on table "public"."environments" to "authenticated";

grant truncate on table "public"."environments" to "authenticated";

grant update on table "public"."environments" to "authenticated";

grant delete on table "public"."environments" to "service_role";

grant insert on table "public"."environments" to "service_role";

grant references on table "public"."environments" to "service_role";

grant select on table "public"."environments" to "service_role";

grant trigger on table "public"."environments" to "service_role";

grant truncate on table "public"."environments" to "service_role";

grant update on table "public"."environments" to "service_role";

create policy "all: workspace"
on "public"."environments"
as permissive
for all
to authenticated
using (is_workspace_authorized(workspace_id, 'ADMIN'::membership_type));


create policy "select: workspace"
on "public"."environments"
as permissive
for select
to authenticated
using (is_workspace_authorized(workspace_id, 'USER'::membership_type));



