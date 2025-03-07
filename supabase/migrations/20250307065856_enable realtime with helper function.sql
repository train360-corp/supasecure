set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.enable_realtime_on_all_public_tables()
 RETURNS void
 LANGUAGE plpgsql
AS $function$
DECLARE
  _schema text := 'public';
  _query text := 'ALTER PUBLICATION supabase_realtime ADD TABLE %I.%I;';
  tablename text;
BEGIN
  -- Drop publication if it exists
  IF EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
    DROP PUBLICATION supabase_realtime;
  END IF;

  -- Create the publication
  CREATE PUBLICATION supabase_realtime;

  -- Iterate over all public tables
  FOR tablename IN
    SELECT t.tablename
    FROM pg_tables AS t
    WHERE t.schemaname = _schema
  LOOP
    -- Run the query to add the table to the publication
    EXECUTE format(_query, _schema, tablename);
  END LOOP;
END;
$function$
;


DO $$
BEGIN
  PERFORM public.enable_realtime_on_all_public_tables();
END $$;
