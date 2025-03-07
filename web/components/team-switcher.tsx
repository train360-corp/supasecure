"use client";

import * as React from "react";
import { Building, ChevronsUpDown, CloudAlert, Plus } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem, } from "@/components/ui/sidebar";
import { Row } from "@train360-corp/supasecure";
import { Skeleton } from "@/components/ui/skeleton";
import { useIsMobile } from "@/hooks/use-mobile";
import { createClient } from "@/lib/supabase/clients/browser";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";



const TeamSwitcherSkeleton = (props: {
  sidebarOpen: boolean;
}) => {

  if (!props.sidebarOpen) return (
    <div>
      <Skeleton className={"w-8 h-8"}/>
    </div>
  );

  return (
    <div className={"py-2 pl-2 pr-1 w-full flex flex-row justify-between items-center"}>
      <div className={"flex flex-row"}>
        <Skeleton className={"w-8 h-8"}/>
        <div className={"flex flex-col ml-2"}>
          <Skeleton className={"w-36 h-3"}/>
          <Skeleton className={"w-20 h-3 mt-2"}/>
        </div>
      </div>
      <ChevronsUpDown className="ml-auto h-4 text-muted-foreground"/>
    </div>
  );

};

export function TeamSwitcher({ teams, open, preferences }: {
  teams: readonly Row<"tenants">[] | undefined;
  preferences: Row<"preferences"> | undefined;
  open: boolean;
}) {

  const isMobile = useIsMobile();
  const supabase = createClient();
  const activeTeam = teams?.find(team => team.id === preferences?.active_tenant_id);

  if (teams === undefined) return (
    <TeamSwitcherSkeleton sidebarOpen={open}/>
  );

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            {!activeTeam ? (
              <SidebarMenuButton
                size="lg"
                className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
              >
                <div
                  className="flex aspect-square size-8 items-center justify-center rounded-lg bg-red-500 text-sidebar-primary-foreground">
                  <CloudAlert className="size-5"/>
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">
                    {"No Team Selected"}
                  </span>
                  <span className="truncate text-xs">
                    {"Select a team to continue"}
                  </span>
                </div>
                <ChevronsUpDown className="ml-auto"/>
              </SidebarMenuButton>
            ) : (
              <SidebarMenuButton
                size="lg"
                className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
              >
                <div
                  className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                  <Building />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">{activeTeam.display}</span>
                  <span className="truncate text-xs">{activeTeam.id}</span>
                </div>
                <ChevronsUpDown className="ml-auto"/>
              </SidebarMenuButton>
            )}
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
            align="start"
            side={isMobile ? "bottom" : "right"}
            sideOffset={4}
          >
            <DropdownMenuLabel className="text-muted-foreground text-xs">
              Teams
            </DropdownMenuLabel>
            {teams.map((team) => (
              <DropdownMenuItem
                disabled={team.id === activeTeam?.id}
                key={team.id}
                onClick={async () => await supabase.from("preferences").update({ active_tenant_id: team.id }).eq("id", preferences!.id).single()}
                className="gap-2 p-2"
              >
                {/*<div className="flex size-6 items-center justify-center rounded-xs border">*/}
                {/*  <team.logo className="size-4 shrink-0"/>*/}
                {/*</div>*/}
                {team.display}
                {/*<DropdownMenuShortcut>⌘{index + 1}</DropdownMenuShortcut>*/}
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator/>
            <DropdownMenuItem className="gap-2 p-2">
              <div className="bg-background flex size-6 items-center justify-center rounded-md border">
                <Plus className="size-4"/>
              </div>
              <div className="text-muted-foreground font-medium">Add team</div>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
