import { Link, Outlet, useLocation } from "@tanstack/react-router";
import { ArrowRightLeft, Coins, LayoutDashboard, Send } from "lucide-react";
import type * as React from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";

export interface ExamplesLayoutProps {
  className?: string;
}

interface ExampleNavItem {
  title: string;
  href: string;
  icon: React.ComponentType;
}

// Example navigation items - clean and simple for sidebar
const exampleNavItems: ExampleNavItem[] = [
  {
    title: "Dashboard",
    href: "/examples/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Send SOL",
    href: "/examples/send-sol",
    icon: Send,
  },
  {
    title: "Send Token",
    href: "/examples/send-token",
    icon: ArrowRightLeft,
  },
  {
    title: "Wrapped SOL",
    href: "/examples/wrapped-sol",
    icon: Coins,
  },
];

export const ExamplesLayout: React.FC<ExamplesLayoutProps> = ({
  className,
}) => {
  const location = useLocation();

  return (
    <SidebarProvider defaultOpen={true}>
      <div className={cn("flex h-full w-full", className)}>
        <Sidebar variant="sidebar" collapsible="icon" topOffset={64}>
          <SidebarHeader>
            <div className="px-3 py-2">
              <h2 className="text-lg font-semibold">Examples</h2>
              <p className="text-sm text-muted-foreground group-data-[collapsible=icon]:hidden">
                Explore Solana dApp patterns
              </p>
            </div>
          </SidebarHeader>

          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>Getting Started</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {exampleNavItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <SidebarMenuItem key={item.href}>
                        <SidebarMenuButton
                          asChild
                          isActive={location.pathname === item.href}
                        >
                          <Link to={item.href}>
                            <Icon />
                            <span>{item.title}</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
        </Sidebar>

        <SidebarInset className="overflow-auto">
          <div className="p-6">
            <Outlet />
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};
