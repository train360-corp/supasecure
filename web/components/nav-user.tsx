"use client";

import { ChevronsUpDown, LogOut, } from "lucide-react";

import { Avatar, AvatarFallback, } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar, } from "@/components/ui/sidebar";
import { Row } from "@train360-corp/supasecure";
import { User } from "@supabase/auth-js";
import { createClient } from "@/lib/supabase/clients/browser";



export function NavUser({ preferences, authUser }: {
  preferences: Row<"preferences">;
  authUser: User;
}) {

  const supabase = createClient();
  const { isMobile } = useSidebar();
  const fullname = (!preferences.first_name.trim() || !preferences.last_name.trim()) ? "Unnamed User" : `${preferences.first_name.trim()} ${preferences.last_name.trim()}`;
  const initials = (!preferences.first_name.trim() || !preferences.last_name.trim()) ? "UU" : (`${preferences.first_name.trim()[0]}${preferences.last_name.trim()[0]}`).toUpperCase();

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <Avatar className="h-8 w-8 rounded-lg">
                {/*<AvatarImage src={user.avatar} alt={fullname}/>*/}
                <AvatarFallback className="rounded-lg">{initials}</AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span
                  className="truncate font-medium">{fullname}</span>
                <span className="truncate text-xs">{authUser.email ?? authUser.phone ?? authUser.id}</span>
              </div>
              <ChevronsUpDown className="ml-auto size-4"/>
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <Avatar className="h-8 w-8 rounded-lg">
                  {/*<AvatarImage src={user.avatar} alt={fullname}/>*/}
                  <AvatarFallback className="rounded-lg">{initials}</AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">{fullname}</span>
                  <span className="truncate text-xs">{authUser.email ?? authUser.phone ?? authUser.id}</span>
                </div>
              </div>
            </DropdownMenuLabel>
            {/*<DropdownMenuSeparator/>*/}
            {/*<DropdownMenuGroup>*/}
            {/*  <DropdownMenuItem>*/}
            {/*    <Sparkles/>*/}
            {/*    Upgrade to Pro*/}
            {/*  </DropdownMenuItem>*/}
            {/*</DropdownMenuGroup>*/}
            {/*<DropdownMenuSeparator/>*/}
            {/*<DropdownMenuGroup>*/}
            {/*  <DropdownMenuItem>*/}
            {/*    <BadgeCheck/>*/}
            {/*    Account*/}
            {/*  </DropdownMenuItem>*/}
            {/*  <DropdownMenuItem>*/}
            {/*    <CreditCard/>*/}
            {/*    Billing*/}
            {/*  </DropdownMenuItem>*/}
            {/*  <DropdownMenuItem>*/}
            {/*    <Bell/>*/}
            {/*    Notifications*/}
            {/*  </DropdownMenuItem>*/}
            {/*</DropdownMenuGroup>*/}
            <DropdownMenuSeparator/>
            <DropdownMenuItem onClick={async () => await supabase.auth.signOut()}>
              <LogOut/>
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
