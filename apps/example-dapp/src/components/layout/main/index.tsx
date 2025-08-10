import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { Link, Outlet } from "@tanstack/react-router";
import type { FC } from "react";
import { ThemeToggle } from "@/components/theme-toggle";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from "@/components/ui/navigation-menu";
import { cn } from "@/lib/utils";

export interface MainLayoutProps {
  className?: string;
}

export const MainLayout: FC<MainLayoutProps> = ({ className }) => {
  return (
    <div className={cn("flex min-h-screen flex-col bg-background", className)}>
      <header className="fixed top-0 z-50 flex h-16 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex flex-1 items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Logo and Navigation */}
          <div className="flex items-center gap-6">
            <Link
              to="/"
              className="flex items-center gap-2 text-lg font-semibold"
            >
              <span className="text-2xl">🍳</span>
              <span>Grill</span>
            </Link>

            <NavigationMenu>
              <NavigationMenuList>
                <NavigationMenuItem>
                  <Link to="/examples">
                    <NavigationMenuLink className="group inline-flex h-9 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground disabled:pointer-events-none disabled:opacity-50">
                      Examples
                    </NavigationMenuLink>
                  </Link>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>
          </div>

          {/* Theme Toggle and Wallet Connection */}
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <WalletMultiButton />
          </div>
        </div>
      </header>

      <main className="flex-1 pt-16">
        <Outlet />
      </main>
    </div>
  );
};
