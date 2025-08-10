import { createFileRoute } from "@tanstack/react-router";
import { ExamplesLayout } from "@/components/layout/examples";

export const Route = createFileRoute("/examples")({
  component: ExamplesLayout,
});
