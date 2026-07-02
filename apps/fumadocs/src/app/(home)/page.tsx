import Link from "next/link";

export default function HomePage() {
	return (
		<div className="flex flex-1 flex-col items-center justify-center px-6 text-center">
			<h1 className="mb-4 font-bold text-4xl">code2-base-ui</h1>
			<p className="mb-8 max-w-xl text-lg text-muted-foreground">
				Toolkit de composants UI modulaire — shadcn/ui, JSON Schema tools,
				FieldRegistry, et plus.
			</p>
			<div className="flex gap-4">
				<Link
					className="inline-flex items-center rounded-lg bg-primary px-6 py-3 font-medium text-primary-foreground text-sm hover:bg-primary/90"
					href="/docs"
				>
					Documentation
				</Link>
				<Link
					className="inline-flex items-center rounded-lg border border-input bg-background px-6 py-3 font-medium text-sm hover:bg-accent"
					href="https://github.com/WAROL52/code2-base-ui"
				>
					GitHub
				</Link>
			</div>

			<div className="mt-16 grid w-full max-w-3xl grid-cols-1 gap-6 md:grid-cols-3">
				<div className="rounded-lg border bg-card p-6 text-left">
					<h3 className="mb-2 font-semibold">Composants UI</h3>
					<p className="text-muted-foreground text-sm">
						Boutons, cartes, inputs, menus déroulants — style base-lyra.
					</p>
				</div>
				<div className="rounded-lg border bg-card p-6 text-left">
					<h3 className="mb-2 font-semibold">JSON Schema Toolkit</h3>
					<p className="text-muted-foreground text-sm">
						Standard Schema, TypeBox, FieldRegistry, SchemaAdapter.
					</p>
				</div>
				<div className="rounded-lg border bg-card p-6 text-left">
					<h3 className="mb-2 font-semibold">GitHub Registry</h3>
					<p className="text-muted-foreground text-sm">
						Installation via{" "}
						<code className="text-xs">
							npx shadcn@latest add WAROL52/code2-base-ui/...
						</code>
					</p>
				</div>
			</div>
		</div>
	);
}
