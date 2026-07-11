import type { CellComponent } from "../registry";

export const CellEmail: CellComponent = ({ value }) => {
	if (value == null) {
		return <span className="text-muted-foreground">—</span>;
	}
	const email = String(value);
	return (
		<a
			className="text-primary underline-offset-4 hover:underline"
			href={`mailto:${email}`}
		>
			{email}
		</a>
	);
};
