import type { ErrorInfo, ReactNode } from "react";
import { Component } from "react";

export interface ErrorBoundaryProps {
  /** Rendered with the caught error instead of `children`. */
  fallback: (error: Error) => ReactNode;
  children: ReactNode;
}

interface ErrorBoundaryState {
  error: Error | null;
}

/**
 * Catches render-time throws so an example can show what a throwing hook
 * actually does, rather than describing it.
 */
export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  override state: ErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error };
  }

  override componentDidCatch(error: Error, info: ErrorInfo): void {
    // Expected in the examples that demonstrate throwing hooks.
    console.debug("ErrorBoundary caught:", error.message, info.componentStack);
  }

  override render(): ReactNode {
    const { error } = this.state;
    const { children, fallback } = this.props;
    return error ? fallback(error) : children;
  }
}
