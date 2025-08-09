import { createFileRoute } from "@tanstack/react-router";
import { SimpleDashboard } from "@/components/SimpleDashboard";

export const Route = createFileRoute("/dashboard")({
  component: SimpleDashboard,
});
