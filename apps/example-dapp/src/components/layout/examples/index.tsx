import { Link, Outlet, useLocation } from "@tanstack/react-router";
import {
  ArrowRight,
  Coins,
  Database,
  Grid3x3,
  LayoutDashboard,
  Zap,
} from "lucide-react";
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
    title: "Transfer SOL",
    href: "/examples/transfer-sol",
    icon: ArrowRight,
  },
  {
    title: "Wrapped SOL",
    href: "/examples/wrapped-sol",
    icon: Coins,
  },
  {
    title: "Token Information",
    href: "/examples/tokens",
    icon: Database,
  },
  {
    title: "Multiple Tokens",
    href: "/examples/multiple-tokens",
    icon: Grid3x3,
  },
  {
    title: "Batch Accounts",
    href: "/examples/batch-accounts",
    icon: Zap,
  },
];

export const ExamplesLayout: React.FC<ExamplesLayoutProps> = ({
  className,
}) => {
  const location = useLocation();

  return (
    <SidebarProvider defaultOpen={true}>
      <div className={cn("flex h-full w-full", className)}>
        <Sidebar variant="sidebar" collapsible="icon" className="top-16">
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
