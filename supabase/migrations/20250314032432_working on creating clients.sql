create table "public"."clients" (
    "id" uuid not null,
    "created_at" timestamp with time zone not null default (now() AT TIME ZONE 'utc'::text),
    "environment_id" uuid not null,
    "workspace_id" uuid not null
);


alter table "public"."clients" enable row level security;

CREATE UNIQUE INDEX clients_pkey ON public.clients USING btree (id);

alter table "public"."clients" add constraint "clients_pkey" PRIMARY KEY using index "clients_pkey";

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.create_client(environment_id uuid)
 RETURNS TABLE(user_id uuid, email text, secret text)
 LANGUAGE plpgsql
AS $function$DECLARE
  now_ts timestamp := now();
  user_id uuid := gen_random_uuid();
  email text := user_id || '@supasecure.localhost';
  secret text := gen_random_uuid()::text;
  environment public.environments%rowtype := NULL;
BEGIN

  -- load the environment
  SELECT * FROM public.environments e INTO environment WHERE e.id = environment_id LIMIT 1;
  IF environment.id IS NULL THEN
    RAISE EXCEPTION 'unable to load environment';
  END IF;

  -- Insert into auth.users table
  INSERT INTO auth.users
    (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, recovery_sent_at, last_sign_in_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, email_change, email_change_token_new, recovery_token)
  VALUES
    ('00000000-0000-0000-0000-000000000000', user_id, 'client', 'client', email, crypt(secret, gen_salt('bf', 14)), now_ts, now_ts, now_ts, 
    '{"provider":"email","providers":["email"]}'::jsonb, '{}'::jsonb, now_ts, now_ts, ''::TEXT, ''::TEXT, ''::TEXT, ''::TEXT);

  -- Insert into auth.identities table
  INSERT INTO auth.identities (id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
  VALUES
    (gen_random_uuid(), user_id, user_id, jsonb_build_object('sub', user_id::TEXT, 'email', email), 'email', now_ts, now_ts, now_ts);

  -- Create the client
  INSERT INTO public.clients(
    id,
    workspace_id, 
    environment_id
  ) VALUES (
    user_id,
    NEW.workspace_id,
    environment.id
  );

  -- Return multiple values
  RETURN QUERY SELECT user_id, email, secret;
END;$function$
;

grant delete on table "public"."clients" to "anon";

grant insert on table "public"."clients" to "anon";

grant references on table "public"."clients" to "anon";

grant select on table "public"."clients" to "anon";

grant trigger on table "public"."clients" to "anon";

grant truncate on table "public"."clients" to "anon";

grant update on table "public"."clients" to "anon";

grant delete on table "public"."clients" to "authenticated";

grant insert on table "public"."clients" to "authenticated";

grant references on table "public"."clients" to "authenticated";

grant select on table "public"."clients" to "authenticated";

grant trigger on table "public"."clients" to "authenticated";

grant truncate on table "public"."clients" to "authenticated";

grant update on table "public"."clients" to "authenticated";

grant delete on table "public"."clients" to "service_role";

grant insert on table "public"."clients" to "service_role";

grant references on table "public"."clients" to "service_role";

grant select on table "public"."clients" to "service_role";

grant trigger on table "public"."clients" to "service_role";

grant truncate on table "public"."clients" to "service_role";

grant update on table "public"."clients" to "service_role";


