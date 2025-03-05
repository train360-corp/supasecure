alter table "public"."secrets" drop constraint "secrets_pkey";

drop index if exists "public"."secrets_pkey";

alter table "public"."secrets" add column "uid" text not null generated always as (((((workspace_id || ':'::text) || environment_id) || ':'::text) || variable_id)) stored;

CREATE UNIQUE INDEX secrets_uid_key ON public.secrets USING btree (uid);

CREATE UNIQUE INDEX secrets_pkey ON public.secrets USING btree (id, uid);

alter table "public"."secrets" add constraint "secrets_pkey" PRIMARY KEY using index "secrets_pkey";

alter table "public"."secrets" add constraint "secrets_uid_key" UNIQUE using index "secrets_uid_key";


