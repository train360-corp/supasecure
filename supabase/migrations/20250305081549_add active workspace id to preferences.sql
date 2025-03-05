alter table "public"."preferences" add column "active_workspace_id" uuid;

alter table "public"."preferences" add constraint "preferences_active_workspace_id_fkey" FOREIGN KEY (active_workspace_id) REFERENCES workspaces(id) ON UPDATE CASCADE ON DELETE SET NULL not valid;

alter table "public"."preferences" validate constraint "preferences_active_workspace_id_fkey";


