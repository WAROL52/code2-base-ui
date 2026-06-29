"use client";

import React from "react";

export function ViewResult({
  children,
  title,
  description,
}: {
  title: string;
  description?: string;
  children: (props: {
    onSubmit: (opt: { value: any }) => void;
  }) => React.ReactNode;
}) {
  const [results, setResults] = React.useState<any>(null);
  return (
    <section className="space-y-4">
      <h2 className="text-2xl font-semibold border-b pb-2">{title}</h2>
      {description && (
        <p className="text-sm text-muted-foreground">{description}</p>
      )}
      <div className="p-6 border rounded-lg shadow-sm bg-background">
        {children({
          onSubmit: (opt) => {
            setResults(opt.value);
          },
        })}
      </div>
      {results && (
        <div className="p-4 bg-primary/10 text-primary border border-primary/20 rounded-md text-sm">
          <pre>{JSON.stringify(results, null, 2)}</pre>
        </div>
      )}
    </section>
  );
}
