import { createRootRoute, Link, Outlet } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import { Button } from "@/components/ui/button";

export const Route = createRootRoute({
  component: () => (
    <>
      <nav className="flex gap-4 p-4 border-b">
        <Link to="/">
          {({ isActive }) => (
            <Button variant={isActive ? "default" : "ghost"}>
              Simple Dashboard
            </Button>
          )}
        </Link>
        <Link to="/dashboard">
          {({ isActive }) => (
            <Button variant={isActive ? "default" : "ghost"}>Dashboard</Button>
          )}
        </Link>
      </nav>
      <Outlet />
      <TanStackRouterDevtools position="bottom-left" />
    </>
  ),
});
