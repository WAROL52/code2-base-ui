import type { CellComponent } from "../registry";

export const CellUrl: CellComponent = ({ value }) => {
	if (value == null) {
		return <span className="text-muted-foreground">—</span>;
	}
	const url = String(value);
	return (
		<a
			className="text-primary underline-offset-4 hover:underline"
			href={url}
			rel="noopener noreferrer"
			target="_blank"
		>
			{url}
		</a>
	);
};
