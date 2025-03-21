"use client";

import * as React from "react";
import { ComponentProps } from "react";

import { NavWorkspaces } from "@/components/nav-workspaces";
import { NavUser } from "@/components/nav-user";
import { TeamSwitcher } from "@/components/team-switcher";
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarRail, } from "@/components/ui/sidebar";
import { useRealtimeData } from "@/lib/supabase/realtime";
import { NIL } from "uuid";
import { useUserContext } from "@/contexts/user";



export function AppSidebar({ ..._props }: ComponentProps<typeof Sidebar> & {
  open: boolean;
}) {

  const { open, ...props } = _props;
  const { user, preferences, auth } = useUserContext();

  const teams = useRealtimeData.Many({ table: "tenants" });

  const workspaces = useRealtimeData.Many({
    table: "workspaces",
    filter: q => q.eq("tenant_id", preferences.active_tenant_id ?? NIL)
  }, [ preferences.active_tenant_id ]);

  const membership = useRealtimeData.Single({
    table: "memberships",
    filter: query => query.eq("user_id", user.id).eq("tenant_id", preferences.active_tenant_id ?? NIL)
  }, [ user.id, preferences.active_tenant_id ]);

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher preferences={preferences} teams={teams.result?.data} open={open}/>
      </SidebarHeader>
      <SidebarContent>
        <NavWorkspaces membership={membership.result?.data} workspaces={workspaces.result?.data}
                       preferences={preferences}/>
      </SidebarContent>
      <SidebarFooter>
        <NavUser authUser={auth.user} preferences={preferences}/>
      </SidebarFooter>
      <SidebarRail/>
    </Sidebar>
  );
}
