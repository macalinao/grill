import type * as React from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const ExamplesIndexPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Welcome to Grill Examples</h1>
        <p className="text-muted-foreground mt-2">
          Explore different Solana dApp patterns and implementations. Choose an
          example from the sidebar to get started.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Simple Dashboard</CardTitle>
            <CardDescription>
              Basic dashboard with wallet connection and balance display
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link to="/examples/dashboard">
              <Button className="w-full">View Example</Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Wrapped SOL</CardTitle>
            <CardDescription>
              Wrap and unwrap SOL tokens for use in SPL programs
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link to="/examples/wrapped-sol">
              <Button className="w-full">View Example</Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Static Token Info</CardTitle>
            <CardDescription>
              Preload token metadata for instant display without chain fetching
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link to="/examples/static-tokens">
              <Button className="w-full">View Example</Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>All Tokens</CardTitle>
            <CardDescription>
              View comprehensive token information including supply and decimals
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link to="/examples/tokens">
              <Button className="w-full">View Example</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export const Route = createFileRoute("/examples/")({
  component: ExamplesIndexPage,
});
