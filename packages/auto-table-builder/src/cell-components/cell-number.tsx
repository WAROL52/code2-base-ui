import type { CellComponent } from "../registry";

export const CellNumber: CellComponent = ({ value }) => {
	if (value == null) {
		return <span className="text-muted-foreground">—</span>;
	}

	const num = Number(value);

	if (Number.isNaN(num)) {
		return <span>{String(value)}</span>;
	}

	return (
		<span
			className="text-right tabular-nums"
			style={{ fontVariantNumeric: "tabular-nums" }}
		>
			{num.toLocaleString(undefined, {
				minimumFractionDigits: 0,
				maximumFractionDigits: 2,
			})}
		</span>
	);
};
