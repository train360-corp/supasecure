drop function if exists "public"."auth_token_hook"(event jsonb);

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.create_client(environment_id uuid)
 RETURNS uuid
 LANGUAGE plpgsql
AS $function$
DECLARE
  user_id uuid;
  email text;
BEGIN
  -- Generate a new user ID
  user_id := gen_random_uuid();
  email := user_id || '@supasecure.localhost';  -- Concatenate user_id with domain

  -- Insert into auth.users table
  INSERT INTO auth.users
    (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, recovery_sent_at, last_sign_in_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, email_change, email_change_token_new, recovery_token)
  VALUES
    ('00000000-0000-0000-0000-000000000000', user_id, 'client', 'client', email, '', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 
    '{"provider":"email","providers":["email"]}'::jsonb, '{}'::jsonb, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, ''::TEXT, ''::TEXT, ''::TEXT, ''::TEXT);

  -- Insert into auth.identities table
  INSERT INTO auth.identities (id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
  VALUES
    (gen_random_uuid(), user_id, user_id, jsonb_build_object('sub', user_id::TEXT, 'email', email), 'email', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

  -- Return the new user ID
  RETURN user_id;
END;
$function$
;


