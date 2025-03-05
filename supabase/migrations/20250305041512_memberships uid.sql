alter table "public"."memberships" drop constraint "memberships_pkey";

drop index if exists "public"."memberships_pkey";

alter table "public"."memberships" add column "user_id" uuid not null;

alter table "public"."memberships" add column "uid" text not null generated always as (((tenant_id || ':'::text) || user_id)) stored;

CREATE UNIQUE INDEX memberships_uid_key ON public.memberships USING btree (uid);

CREATE UNIQUE INDEX memberships_pkey ON public.memberships USING btree (id, uid);

alter table "public"."memberships" add constraint "memberships_pkey" PRIMARY KEY using index "memberships_pkey";

alter table "public"."memberships" add constraint "memberships_uid_key" UNIQUE using index "memberships_uid_key";

alter table "public"."memberships" add constraint "memberships_user_id_fkey" FOREIGN KEY (user_id) REFERENCES users(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."memberships" validate constraint "memberships_user_id_fkey";


