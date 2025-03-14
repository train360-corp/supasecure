set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.auth_token_hook(event jsonb)
 RETURNS jsonb
 LANGUAGE plpgsql
AS $function$BEGIN

  -- Return the modified or original event
  return event;

END;$function$;


-- Grant access to function to supabase_auth_admin
grant execute
  on function public.auth_token_hook
  to supabase_auth_admin;

-- Grant access to schema to supabase_auth_admin
grant usage on schema public to supabase_auth_admin;

-- Revoke function permissions from authenticated, anon and public
revoke execute
  on function public.auth_token_hook
  from authenticated, anon, public;

