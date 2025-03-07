"use client";

import { Folder, Forward, MoreHorizontal, Network, Plus, Trash2, } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { Row } from "@train360-corp/supasecure";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import { createClient } from "@/lib/supabase/clients/browser";
import { toast } from "sonner";



export function NavWorkspaces({ workspaces, preferences, membership }: {
  workspaces: readonly Row<"workspaces">[] | undefined;
  preferences: Row<"preferences"> | undefined;
  membership: Row<"memberships"> | undefined;
}) {

  const { isMobile } = useSidebar();
  const supabase = createClient();

  return (
    <SidebarGroup className="group-data-[collapsible=icon]:hidden">
      <SidebarGroupLabel>{"Workspaces"}</SidebarGroupLabel>
      <SidebarMenu>
        {workspaces === undefined ? (
          <Skeleton/>
        ) : workspaces.map((item) => (
          <SidebarMenuItem key={item.id}>
            <SidebarMenuButton asChild>
              <Link href={`/dashboard/workspaces/${item.id}`}>
                <Network />
                <span>{item.display}</span>
              </Link>
            </SidebarMenuButton>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuAction showOnHover>
                  <MoreHorizontal/>
                  <span className="sr-only">More</span>
                </SidebarMenuAction>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-48 rounded-lg"
                side={isMobile ? "bottom" : "right"}
                align={isMobile ? "end" : "start"}
              >
                {/*<DropdownMenuItem>*/}
                {/*  <Folder className="text-muted-foreground"/>*/}
                {/*  <span>View Project</span>*/}
                {/*</DropdownMenuItem>*/}
                {/*<DropdownMenuItem>*/}
                {/*  <Forward className="text-muted-foreground"/>*/}
                {/*  <span>Share Project</span>*/}
                {/*</DropdownMenuItem>*/}
                {/*<DropdownMenuSeparator/>*/}
                <DropdownMenuItem onClick={() => supabase.from("workspaces").delete().eq("id", item.id).then(({error}) => {
                  if (error) toast.error("Unable to Delete Workspace!", {
                    description: error.message,
                  });
                })}>
                  <Trash2 className="text-muted-foreground"/>
                  <span>{"Delete Workspace"}</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        ))}
        <SidebarMenuItem>
          <SidebarMenuButton
            disabled={membership?.type !== "ADMIN"}
            className="text-sidebar-foreground/70"
            onClick={async () => {
              const {error} = await supabase.from("workspaces").insert({
                display: "New Workspace",
                tenant_id: preferences!.active_tenant_id!
              })
              if (error) toast.error("Unable to Create Workspace!", {
                description: error.message,
              });
            }}
          >
            <Plus className="text-sidebar-foreground/70"/>
            <span>{"New"}</span>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarGroup>
  );
}
