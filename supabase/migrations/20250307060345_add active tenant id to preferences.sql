alter table "public"."preferences" add column "active_tenant_id" uuid;

alter table "public"."preferences" add constraint "preferences_active_tenant_id_fkey" FOREIGN KEY (active_tenant_id) REFERENCES tenants(id) ON UPDATE CASCADE ON DELETE SET NULL not valid;

alter table "public"."preferences" validate constraint "preferences_active_tenant_id_fkey";


