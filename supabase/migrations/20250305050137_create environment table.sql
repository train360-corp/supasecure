create table "public"."environment" (
    "id" uuid not null default gen_random_uuid(),
    "workspace_id" uuid not null,
    "display" text not null
);


alter table "public"."environment" enable row level security;

CREATE UNIQUE INDEX environment_pkey ON public.environment USING btree (id);

alter table "public"."environment" add constraint "environment_pkey" PRIMARY KEY using index "environment_pkey";

alter table "public"."environment" add constraint "environment_workspace_id_fkey" FOREIGN KEY (workspace_id) REFERENCES workspaces(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."environment" validate constraint "environment_workspace_id_fkey";

grant delete on table "public"."environment" to "anon";

grant insert on table "public"."environment" to "anon";

grant references on table "public"."environment" to "anon";

grant select on table "public"."environment" to "anon";

grant trigger on table "public"."environment" to "anon";

grant truncate on table "public"."environment" to "anon";

grant update on table "public"."environment" to "anon";

grant delete on table "public"."environment" to "authenticated";

grant insert on table "public"."environment" to "authenticated";

grant references on table "public"."environment" to "authenticated";

grant select on table "public"."environment" to "authenticated";

grant trigger on table "public"."environment" to "authenticated";

grant truncate on table "public"."environment" to "authenticated";

grant update on table "public"."environment" to "authenticated";

grant delete on table "public"."environment" to "service_role";

grant insert on table "public"."environment" to "service_role";

grant references on table "public"."environment" to "service_role";

grant select on table "public"."environment" to "service_role";

grant trigger on table "public"."environment" to "service_role";

grant truncate on table "public"."environment" to "service_role";

grant update on table "public"."environment" to "service_role";


