"use client";

import * as React from "react";
import { ComponentProps, useEffect, useState } from "react";
import {
  AudioWaveform,
  BookOpen,
  Bot,
  Command,
  Frame,
  GalleryVerticalEnd,
  Map,
  PieChart,
  Settings2,
  SquareTerminal,
} from "lucide-react";

import { NavWorkspaces } from "@/components/nav-workspaces";
import { NavUser } from "@/components/nav-user";
import { TeamSwitcher } from "@/components/team-switcher";
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarRail, } from "@/components/ui/sidebar";
import { Row } from "@train360-corp/supasecure";
import { createClient } from "@/lib/supabase/clients/browser";
import { toast } from "sonner";

// This is sample data.
const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  teams: [
    {
      name: "Acme Inc",
      logo: GalleryVerticalEnd,
      plan: "Enterprise",
    },
    {
      name: "Acme Corp.",
      logo: AudioWaveform,
      plan: "Startup",
    },
    {
      name: "Evil Corp.",
      logo: Command,
      plan: "Free",
    },
  ],
  navMain: [
    {
      title: "Playground",
      url: "#",
      icon: SquareTerminal,
      isActive: true,
      items: [
        {
          title: "History",
          url: "#",
        },
        {
          title: "Starred",
          url: "#",
        },
        {
          title: "Settings",
          url: "#",
        },
      ],
    },
    {
      title: "Models",
      url: "#",
      icon: Bot,
      items: [
        {
          title: "Genesis",
          url: "#",
        },
        {
          title: "Explorer",
          url: "#",
        },
        {
          title: "Quantum",
          url: "#",
        },
      ],
    },
    {
      title: "Documentation",
      url: "#",
      icon: BookOpen,
      items: [
        {
          title: "Introduction",
          url: "#",
        },
        {
          title: "Get Started",
          url: "#",
        },
        {
          title: "Tutorials",
          url: "#",
        },
        {
          title: "Changelog",
          url: "#",
        },
      ],
    },
    {
      title: "Settings",
      url: "#",
      icon: Settings2,
      items: [
        {
          title: "General",
          url: "#",
        },
        {
          title: "Team",
          url: "#",
        },
        {
          title: "Billing",
          url: "#",
        },
        {
          title: "Limits",
          url: "#",
        },
      ],
    },
  ],
  projects: [
    {
      name: "Design Engineering",
      url: "#",
      icon: Frame,
    },
    {
      name: "Sales & Marketing",
      url: "#",
      icon: PieChart,
    },
    {
      name: "Travel",
      url: "#",
      icon: Map,
    },
  ],
};

export function AppSidebar({ ..._props }: ComponentProps<typeof Sidebar> & {
  open: boolean;
}) {

  const { open, ...props } = _props;
  const supabase = createClient();
  const [ teams, setTeams ] = useState<readonly Row<"tenants">[]>();
  const [ preferences, setPreferences ] = useState<Row<"preferences">>();
  const [ workspaces, setWorkspaces ] = useState<readonly Row<"workspaces">[]>();
  const [ membership, setMembership ] = useState<Row<"memberships">>();

  useEffect(() => {
    supabase.from("tenants").select().then(({ data, error }) => {
      if (error) toast.error("Unable to Load Teams!", {
        description: error.message,
      });
      else setTeams(data);
    });

    supabase.from("preferences").select().single().then(async ({ data, error }) => {
      if (error) toast.error("Unable to Load Preferences!", {
        description: error.message,
      });
      else {
        setPreferences(data);
        supabase.channel(data.id).on("postgres_changes", {
          schema: "public",
          event: "*",
          table: "preferences",
          filter: `id=eq.${data.id}`
        }, (cb) => {
          setPreferences((!!cb.new && "id" in cb.new && !!cb.new.id) ? cb.new as Row<"preferences"> : undefined);
        }).subscribe();
      }
    });

  }, []);

  useEffect(() => {

    // load membership
    if (preferences && preferences.active_tenant_id) supabase
      .from("memberships")
      .select()
      .eq("tenant_id", preferences.active_tenant_id)
      .eq("user_id", preferences.id)
      .single()
      .then(async ({ data, error }) => {
        if (error || !data) {
          toast.error("Unable to Load Membership!", {
            description: error?.message ?? "No data was returned",
          });
          setMembership(undefined);
        } else setMembership(data);
      });
    else setMembership(undefined);

    const getWorkspaces = (id: string) => supabase
      .from("workspaces")
      .select()
      .eq("tenant_id", id)
      .order("created_at")
      .then(async ({ data, error }) => {
        if (error || !data) {
          toast.error("Unable to Load Workspaces!", {
            description: error?.message ?? "No data was returned",
          });
          setWorkspaces(undefined);
        } else {
          setWorkspaces(data);
        }
      });

    // load workspaces for current/active tenant
    if (!!preferences && !!preferences.active_tenant_id) {
      getWorkspaces(preferences.active_tenant_id).then();
      supabase.channel(`tenant-${preferences.active_tenant_id}-workspaces-${preferences.id}`).on("postgres_changes", {
        schema: "public",
        event: "*",
        table: "workspaces",
        // filter: `tenant_id=eq.${preferences.active_tenant_id}`
      }, () => {
        if (preferences?.active_tenant_id) getWorkspaces(preferences.active_tenant_id).then();
      }).subscribe();
    } else setWorkspaces(undefined);

  }, [ preferences?.id, preferences?.active_tenant_id ]);

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher preferences={preferences} teams={teams} open={open}/>
      </SidebarHeader>
      <SidebarContent>
        <NavWorkspaces membership={membership} workspaces={workspaces} preferences={preferences}/>
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user}/>
      </SidebarFooter>
      <SidebarRail/>
    </Sidebar>
  );
}
