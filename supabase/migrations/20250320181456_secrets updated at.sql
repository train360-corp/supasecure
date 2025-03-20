alter table "public"."secrets" add column "updated_at" timestamp with time zone not null default (now() AT TIME ZONE 'utc'::text);

create extension if not exists moddatetime schema extensions;

create trigger secrets_handle_updated_at before update on secrets
    for each row execute procedure moddatetime (updated_at);