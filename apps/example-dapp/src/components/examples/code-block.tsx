import type * as React from "react";

export interface CodeBlockProps {
  children: string;
}

/** Renders a usage snippet for an example page. */
export const CodeBlock: React.FC<CodeBlockProps> = ({ children }) => (
  <pre className="overflow-x-auto rounded-lg bg-muted p-4 text-sm">
    <code>{children}</code>
  </pre>
);
