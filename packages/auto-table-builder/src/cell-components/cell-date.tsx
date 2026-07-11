import type { CellComponent } from "../registry";

export const CellDate: CellComponent = ({ value }) => {
	if (value == null) {
		return <span className="text-muted-foreground">—</span>;
	}

	const date = new Date(String(value));

	if (Number.isNaN(date.getTime())) {
		return <span>{String(value)}</span>;
	}

	return (
		<span suppressHydrationWarning>
			{date.toLocaleDateString(undefined, {
				year: "numeric",
				month: "short",
				day: "numeric",
			})}
		</span>
	);
};
