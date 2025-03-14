# use supabase as base image
FROM ghcr.io/train360-corp/supabase:6f5c1fc AS supabase

# mount migrations
COPY supabase/migrations /supabase/migrations
ENV AUTO_MIGRATIONS_MODE=mounted

# mount auth functions
ENV GOTRUE_HOOK_CUSTOM_ACCESS_TOKEN_ENABLED="true"
ENV GOTRUE_HOOK_CUSTOM_ACCESS_TOKEN_URI="pg-functions://postgres/public/auth_token_hook"

SHELL ["/bin/bash", "-ec"]