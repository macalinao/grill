import { createRootRoute } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import { MainLayout } from "@/components/layout/main";

export const Route = createRootRoute({
  component: () => (
    <>
      <MainLayout />
      <TanStackRouterDevtools position="bottom-left" />
    </>
  ),
});
