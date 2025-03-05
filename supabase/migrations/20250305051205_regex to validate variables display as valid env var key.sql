alter table "public"."variables" add constraint "variables_display_check" CHECK ((display ~ '^[A-Z_][A-Z0-9_]*$'::text)) not valid;

alter table "public"."variables" validate constraint "variables_display_check";


