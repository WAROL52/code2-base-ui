import { useCallback, useState } from "react";

export interface AutoTableViewOptionsProps {
	children?: React.ReactNode;
	getAllColumns: () => {
		id: string;
		getIsVisible: () => boolean;
		getToggleVisibilityHandler: () => () => void;
	}[];
	getIsVisible: (columnId: string) => boolean;
}

export function AutoTableViewOptions({
	getAllColumns,
}: AutoTableViewOptionsProps) {
	const [open, setOpen] = useState(false);

	const toggle = useCallback(() => {
		setOpen((prev) => !prev);
	}, []);

	const columns = getAllColumns();

	return (
		<div className="relative">
			<button
				className="rounded border px-3 py-1 text-sm"
				onClick={toggle}
				type="button"
			>
				Columns
			</button>
			{open && (
				<div className="absolute top-full right-0 z-10 mt-1 w-48 rounded-md border bg-background p-2 shadow-lg">
					{columns.map((column) => (
						<label
							className="flex items-center gap-2 rounded px-2 py-1 text-sm hover:bg-muted"
							key={column.id}
						>
							<input
								checked={column.getIsVisible()}
								className="h-4 w-4"
								onChange={column.getToggleVisibilityHandler()}
								type="checkbox"
							/>
							{column.id}
						</label>
					))}
				</div>
			)}
		</div>
	);
}
