import { createFileRoute, Link } from "@tanstack/react-router";
import type * as React from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const HomePage: React.FC = () => {
  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold">Welcome to Grill 🍳</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          A modern Solana dApp development platform with React, TypeScript, and
          Tailwind CSS. Explore examples and build your own decentralized
          applications.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto">
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              📊 Simple Dashboard
            </CardTitle>
            <CardDescription>
              Get started with a basic dashboard that shows wallet connection
              and balance
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link to="/examples/dashboard">
              <Button className="w-full">View Dashboard</Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              🔧 Examples
            </CardTitle>
            <CardDescription>
              Explore various Solana dApp patterns including tokens, NFTs, and
              program interactions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link to="/examples">
              <Button className="w-full">Explore Examples</Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              🚀 Get Started
            </CardTitle>
            <CardDescription>
              Learn how to build your own Solana dApp with our comprehensive
              guides
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full" disabled>
              Coming Soon
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="text-center">
        <p className="text-sm text-muted-foreground">
          Built with React, TypeScript, TanStack Router, and shadcn/ui
        </p>
      </div>
    </div>
  );
};

export const Route = createFileRoute("/")({
  component: HomePage,
});
