"use client";

import type * as React from "react";
import {
  IconDashboard,
  IconArrowsMinimize,
  IconBox,
} from "@tabler/icons-react";
import Link from "next/link";

import { NavMain } from "@/components/nav-main";
import { NavUser } from "@/components/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

const data = {
  user: {
    name: "Danny Gu",
    email: "m@example.com",
  },
  navMain: [
    {
      title: "Inventory",
      url: "/dashboard/inventory",
      icon: IconDashboard,
    },
    {
      title: "Order",
      url: "/dashboard/order",
      icon: IconBox,
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              {/* brand */}
              <Link href="/dashboard" className="!w-fit">
                <IconArrowsMinimize className="!size-5" />
                <span className="text-base font-semibold">Devfit</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
  );
}
