import type * as React from "react";

export interface ExampleHeaderProps {
  title: string;
  /** Which `@macalinao/grill` exports this page demonstrates. */
  exports: string[];
  children: React.ReactNode;
}

/**
 * Standard header for an example page: title, prose description, and the list
 * of grill exports the page demonstrates.
 */
export const ExampleHeader: React.FC<ExampleHeaderProps> = ({
  title,
  exports,
  children,
}) => (
  <div className="mb-6">
    <h1 className="text-3xl font-bold">{title}</h1>
    <p className="mt-2 text-muted-foreground">{children}</p>
    <div className="mt-3 flex flex-wrap gap-1.5">
      {exports.map((name) => (
        <code
          key={name}
          className="rounded border bg-muted px-1.5 py-0.5 font-mono text-xs"
        >
          {name}
        </code>
      ))}
    </div>
  </div>
);
