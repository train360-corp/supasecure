create table "public"."memberships" (
    "id" uuid not null default gen_random_uuid(),
    "created_at" timestamp with time zone not null default (now() AT TIME ZONE 'utc'::text),
    "tenant_id" uuid not null
);


alter table "public"."memberships" enable row level security;

CREATE UNIQUE INDEX memberships_pkey ON public.memberships USING btree (id);

alter table "public"."memberships" add constraint "memberships_pkey" PRIMARY KEY using index "memberships_pkey";

alter table "public"."memberships" add constraint "memberships_tenant_id_fkey" FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."memberships" validate constraint "memberships_tenant_id_fkey";

grant delete on table "public"."memberships" to "anon";

grant insert on table "public"."memberships" to "anon";

grant references on table "public"."memberships" to "anon";

grant select on table "public"."memberships" to "anon";

grant trigger on table "public"."memberships" to "anon";

grant truncate on table "public"."memberships" to "anon";

grant update on table "public"."memberships" to "anon";

grant delete on table "public"."memberships" to "authenticated";

grant insert on table "public"."memberships" to "authenticated";

grant references on table "public"."memberships" to "authenticated";

grant select on table "public"."memberships" to "authenticated";

grant trigger on table "public"."memberships" to "authenticated";

grant truncate on table "public"."memberships" to "authenticated";

grant update on table "public"."memberships" to "authenticated";

grant delete on table "public"."memberships" to "service_role";

grant insert on table "public"."memberships" to "service_role";

grant references on table "public"."memberships" to "service_role";

grant select on table "public"."memberships" to "service_role";

grant trigger on table "public"."memberships" to "service_role";

grant truncate on table "public"."memberships" to "service_role";

grant update on table "public"."memberships" to "service_role";


