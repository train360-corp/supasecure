create policy "select: own memberships"
on "public"."memberships"
as permissive
for select
to authenticated
using ((auth.uid() = user_id));


create policy "select: self"
on "public"."users"
as permissive
for select
to authenticated
using ((auth.uid() = id));



