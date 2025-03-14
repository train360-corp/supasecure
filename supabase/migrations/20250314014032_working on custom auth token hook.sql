set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.auth_token_hook(event jsonb)
 RETURNS jsonb
 LANGUAGE plpgsql
AS $function$BEGIN

  IF (event->'claims'->>'email') LIKE '%@supasecure.localhost' THEN
    event := jsonb_set(
      jsonb_set(
        jsonb_set(event, '{claims,aud}', '"client"'::jsonb),
        '{claims,role}', '"client"'::jsonb
      ),
      '{claims,roles}', '["client"]'::jsonb
    );
  END IF;

  -- Return the modified or original event
  RETURN event;

END;$function$
;


