import type * as React from "react";
import { createRootRoute } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import { MainLayout } from "@/components/layout/main";

const RootComponent: React.FC = () => (
  <>
    <MainLayout />
    <TanStackRouterDevtools position="bottom-left" />
  </>
);

export const Route = createRootRoute({
  component: RootComponent,
});
