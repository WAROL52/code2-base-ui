import Link from "next/link";

export default function HomePage() {
  return (
    <div className="flex flex-col items-center justify-center text-center flex-1 px-6">
      <h1 className="text-4xl font-bold mb-4">code2-base-ui</h1>
      <p className="text-lg text-muted-foreground max-w-xl mb-8">
        Toolkit de composants UI modulaire — shadcn/ui, JSON Schema tools,
        FieldRegistry, et plus.
      </p>
      <div className="flex gap-4">
        <Link
          href="/docs"
          className="inline-flex items-center rounded-lg bg-primary px-6 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          Documentation
        </Link>
        <Link
          href="https://github.com/WAROL52/code2-base-ui"
          className="inline-flex items-center rounded-lg border border-input bg-background px-6 py-3 text-sm font-medium hover:bg-accent"
        >
          GitHub
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16 max-w-3xl w-full">
        <div className="rounded-lg border bg-card p-6 text-left">
          <h3 className="font-semibold mb-2">Composants UI</h3>
          <p className="text-sm text-muted-foreground">
            Boutons, cartes, inputs, menus déroulants — style base-lyra.
          </p>
        </div>
        <div className="rounded-lg border bg-card p-6 text-left">
          <h3 className="font-semibold mb-2">JSON Schema Toolkit</h3>
          <p className="text-sm text-muted-foreground">
            Standard Schema, TypeBox, FieldRegistry, SchemaAdapter.
          </p>
        </div>
        <div className="rounded-lg border bg-card p-6 text-left">
          <h3 className="font-semibold mb-2">GitHub Registry</h3>
          <p className="text-sm text-muted-foreground">
            Installation via <code className="text-xs">npx shadcn@latest add WAROL52/code2-base-ui/...</code>
          </p>
        </div>
      </div>
    </div>
  );
}
