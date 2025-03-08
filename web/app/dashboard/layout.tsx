"use client";

import { AppSidebar } from "@/components/app-sidebar";
import { Separator } from "@/components/ui/separator";
import { SidebarInset, SidebarProvider, SidebarTrigger, } from "@/components/ui/sidebar";
import { ReactNode } from "react";
import { useLocalStorage } from "@uidotdev/usehooks";
import { ModeToggle } from "@/components/mode-toggle";



export default function Page({ children }: {
  children: ReactNode
}) {

  const [ open, setOpen ] = useLocalStorage<boolean>("SIDEBAR_OPEN", true);

  return (
    <SidebarProvider open={open} onOpenChange={setOpen}>
      <AppSidebar open={open} />
      <SidebarInset>
        <header
          className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1"/>
            <Separator
              orientation="vertical"
              className="data-[orientation=vertical]:h-4"
            />
            <ModeToggle />
            <Separator
              orientation="vertical"
              className="data-[orientation=vertical]:h-4"
            />
          </div>
        </header>
        <div className="w-full max-w-full overflow-y-auto">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
