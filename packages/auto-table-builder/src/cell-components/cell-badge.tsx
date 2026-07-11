import type { CellComponent } from "../registry";

const badgeColors: Record<string, string> = {
	active: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
	inactive: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200",
	pending:
		"bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
	error: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
	success: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
	warning:
		"bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
	info: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
};

function getBadgeColor(value: string): string {
	return (
		badgeColors[value.toLowerCase()] ??
		"bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
	);
}

export const CellBadge: CellComponent = ({ value }) => {
	if (value == null) {
		return <span className="text-muted-foreground">—</span>;
	}

	const text = String(value);

	return (
		<span
			className={`inline-flex items-center rounded-full px-2.5 py-0.5 font-medium text-xs ${getBadgeColor(text)}`}
		>
			{text}
		</span>
	);
};
