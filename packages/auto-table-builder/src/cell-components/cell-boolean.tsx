import { Check, X } from "lucide-react";
import type { CellComponent } from "../registry";

export const CellBoolean: CellComponent = ({ value }) => {
	if (value === true) {
		return (
			<span className="flex items-center gap-1 text-green-600 dark:text-green-400">
				<Check className="h-4 w-4" />
				<span className="sr-only">true</span>
			</span>
		);
	}

	if (value === false) {
		return (
			<span className="flex items-center gap-1 text-red-600 dark:text-red-400">
				<X className="h-4 w-4" />
				<span className="sr-only">false</span>
			</span>
		);
	}

	return <span className="text-muted-foreground">—</span>;
};
