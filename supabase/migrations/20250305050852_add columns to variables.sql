create type "public"."generator_type" as enum ('NONE');

alter table "public"."variables" add column "description" text not null default ''::text;

alter table "public"."variables" add column "generator" generator_type not null default 'NONE'::generator_type;


