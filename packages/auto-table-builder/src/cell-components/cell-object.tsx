import type { CellComponent } from "../registry";

export const CellObject: CellComponent = ({ value }) => {
	if (value == null) {
		return <span className="text-muted-foreground">—</span>;
	}

	if (typeof value !== "object") {
		return <span>{String(value)}</span>;
	}

	const entries = Object.entries(value as Record<string, unknown>);

	if (entries.length === 0) {
		return <span className="text-muted-foreground">{"{}"}</span>;
	}

	return (
		<span className="text-muted-foreground text-xs">
			{`{${entries
				.slice(0, 2)
				.map(([k, v]) => `${k}: ${String(v).slice(0, 20)}`)
				.join(", ")}`}
			{entries.length > 2 ? ", ..." : ""}
			{"}"}
		</span>
	);
};
