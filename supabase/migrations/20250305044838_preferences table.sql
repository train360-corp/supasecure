create table "public"."preferences" (
    "id" uuid not null
);


alter table "public"."preferences" enable row level security;

CREATE UNIQUE INDEX preferences_pkey ON public.preferences USING btree (id);

alter table "public"."preferences" add constraint "preferences_pkey" PRIMARY KEY using index "preferences_pkey";

alter table "public"."preferences" add constraint "preferences_id_fkey" FOREIGN KEY (id) REFERENCES users(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."preferences" validate constraint "preferences_id_fkey";

grant delete on table "public"."preferences" to "anon";

grant insert on table "public"."preferences" to "anon";

grant references on table "public"."preferences" to "anon";

grant select on table "public"."preferences" to "anon";

grant trigger on table "public"."preferences" to "anon";

grant truncate on table "public"."preferences" to "anon";

grant update on table "public"."preferences" to "anon";

grant delete on table "public"."preferences" to "authenticated";

grant insert on table "public"."preferences" to "authenticated";

grant references on table "public"."preferences" to "authenticated";

grant select on table "public"."preferences" to "authenticated";

grant trigger on table "public"."preferences" to "authenticated";

grant truncate on table "public"."preferences" to "authenticated";

grant update on table "public"."preferences" to "authenticated";

grant delete on table "public"."preferences" to "service_role";

grant insert on table "public"."preferences" to "service_role";

grant references on table "public"."preferences" to "service_role";

grant select on table "public"."preferences" to "service_role";

grant trigger on table "public"."preferences" to "service_role";

grant truncate on table "public"."preferences" to "service_role";

grant update on table "public"."preferences" to "service_role";

create policy "select: self"
on "public"."preferences"
as permissive
for select
to authenticated
using ((auth.uid() = id));


create policy "update: self"
on "public"."preferences"
as permissive
for update
to authenticated
using ((auth.uid() = id));



