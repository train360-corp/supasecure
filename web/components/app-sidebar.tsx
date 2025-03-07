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

import { NavMain } from "@/components/nav-main";
import { NavProjects } from "@/components/nav-projects";
import { NavUser } from "@/components/nav-user";
import { TeamSwitcher } from "@/components/team-switcher";
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarRail, } from "@/components/ui/sidebar";
import { Row } from "@train360-corp/supasecure";
import { createClient } from "@/lib/supabase/clients/browser";
import { toast } from "sonner";
import { RealtimeChannel } from "@supabase/realtime-js";

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
  const [workspaces, setWorkspaces] = useState<readonly (Row<"workspaces"> & {
    environments: readonly Row<"environments">[]
  })[]>();

  useEffect(() => {

    let prefSub: RealtimeChannel | null = null;

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
        prefSub = supabase.channel(data.id).on("postgres_changes", {
          schema: "public",
          event: "*"
        }, (cb) => {
          setPreferences((!!cb.new && "id" in cb.new && !!cb.new.id) ? cb.new as Row<"preferences"> : undefined);
        }).subscribe();
      }
    });

    return () => {
      prefSub?.unsubscribe();
    };

  }, []);

  // load workspaces for current/active tenant
  useEffect(() => {
    if(preferences && preferences.active_tenant_id) supabase.from("workspaces").select().eq("")
    else setWorkspaces(undefined);
  }, [preferences?.id]);

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher preferences={preferences} teams={teams} open={open}/>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain}/>
        <NavProjects projects={data.projects}/>
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user}/>
      </SidebarFooter>
      <SidebarRail/>
    </Sidebar>
  );
}
