import type * as React from "react";
import { Link, Outlet, useLocation } from "@tanstack/react-router";
import {
  Activity,
  ArrowRight,
  BellOff,
  Boxes,
  Coins,
  Database,
  Factory,
  FileText,
  KeyRound,
  LayoutDashboard,
  Radio,
  Wallet,
  Zap,
} from "lucide-react";
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

interface ExampleNavGroup {
  label: string;
  items: ExampleNavItem[];
}

// Example navigation - grouped for the sidebar.
const exampleNavGroups: ExampleNavGroup[] = [
  {
    label: "Getting Started",
    items: [
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
        title: "Token Balances",
        href: "/examples/token-balances",
        icon: Wallet,
      },
      {
        title: "Batch Accounts",
        href: "/examples/batch-accounts",
        icon: Zap,
      },
      {
        title: "Pool Subscription",
        href: "/examples/pool-subscription",
        icon: Activity,
      },
    ],
  },
  {
    label: "Accounts & PDAs",
    items: [
      {
        title: "Account Hooks",
        href: "/examples/account-hooks",
        icon: Database,
      },
      {
        title: "PDA Hooks",
        href: "/examples/pdas",
        icon: KeyRound,
      },
      {
        title: "Token Metadata",
        href: "/examples/token-metadata",
        icon: FileText,
      },
      {
        title: "Token Info & Balances",
        href: "/examples/token-infos",
        icon: Coins,
      },
      {
        title: "Hook Factories",
        href: "/examples/hook-factories",
        icon: Factory,
      },
    ],
  },
  {
    label: "Providers & Internals",
    items: [
      {
        title: "Subscriptions",
        href: "/examples/subscriptions",
        icon: Radio,
      },
      {
        title: "Context & Cache",
        href: "/examples/grill-context",
        icon: Boxes,
      },
      {
        title: "Wallet Access",
        href: "/examples/wallet",
        icon: Wallet,
      },
      {
        title: "Headless Provider",
        href: "/examples/headless-provider",
        icon: BellOff,
      },
    ],
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
            {exampleNavGroups.map((group) => (
              <SidebarGroup key={group.label}>
                <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {group.items.map((item) => {
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
            ))}
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
