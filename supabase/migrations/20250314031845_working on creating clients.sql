drop function if exists "public"."create_client"(environment_id uuid);

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.create_client(environment_id uuid)
 RETURNS TABLE(user_id uuid, email text, secret text)
 LANGUAGE plpgsql
AS $function$
DECLARE
  now_ts timestamp := now();
  user_id uuid := gen_random_uuid();
  email text := user_id || '@supasecure.localhost';
  secret text := gen_random_uuid()::text;
BEGIN
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

  -- Return multiple values
  RETURN QUERY SELECT user_id, email, secret;
END;
$function$
;


