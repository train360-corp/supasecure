# use supabase as base image
FROM ghcr.io/train360-corp/supabase:6f5c1fc AS supabase

# mount migrations
COPY supabase/migrations /supabase/migrations
ENV AUTO_MIGRATIONS_MODE=mounted

SHELL ["/bin/bash", "-ec"]