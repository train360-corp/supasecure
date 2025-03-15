INSERT INTO public.workspaces (tenant_id, display)
SELECT tenants.id, display_name
FROM tenants
         CROSS JOIN UNNEST(ARRAY['Mobile', 'Web', 'Internal']) AS display_name;

INSERT INTO public.environments (workspace_id, display)
SELECT w.id, display_name
FROM workspaces w
CROSS JOIN UNNEST(ARRAY['Local', 'Dev', 'Prod']) AS display_name;

