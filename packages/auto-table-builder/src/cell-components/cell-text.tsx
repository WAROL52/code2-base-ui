import type { CellComponent } from "../registry";

export const CellText: CellComponent = ({ value }) => {
	if (value == null) {
		return <span className="text-muted-foreground">—</span>;
	}
	return <span>{String(value)}</span>;
};
