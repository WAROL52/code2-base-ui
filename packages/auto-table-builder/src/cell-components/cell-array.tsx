import type { CellComponent } from "../registry";

function renderBadge(item: unknown, idx: number) {
	return (
		<span
			className="inline-flex items-center rounded-md bg-gray-100 px-2 py-0.5 font-medium text-gray-600 text-xs dark:bg-gray-800 dark:text-gray-300"
			key={idx}
		>
			{String(item)}
		</span>
	);
}

export const CellArray: CellComponent = ({ value }) => {
	if (value == null) {
		return <span className="text-muted-foreground">—</span>;
	}

	if (!Array.isArray(value)) {
		return <span>{String(value)}</span>;
	}

	if (value.length === 0) {
		return <span className="text-muted-foreground">Empty</span>;
	}

	if (value.length <= 3) {
		return (
			<div className="flex flex-wrap gap-1">
				{value.map((item, i) => renderBadge(item, i))}
			</div>
		);
	}

	return (
		<div className="flex items-center gap-1">
			{value.slice(0, 2).map((item, i) => renderBadge(item, i))}
			<span className="text-muted-foreground text-xs">
				+{value.length - 2} more
			</span>
		</div>
	);
};
