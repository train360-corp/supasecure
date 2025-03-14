INSERT INTO public.workspaces (tenant_id, display)
SELECT tenants.id, display_name
FROM tenants
         CROSS JOIN UNNEST(ARRAY['Local', 'Sandbox', 'Production']) AS display_name;