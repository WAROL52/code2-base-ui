import type { Table } from "@tanstack/react-table";

export interface AutoTablePaginationProps<TData> {
	table: Table<TData>;
}

export function AutoTablePagination<TData>({
	table,
}: AutoTablePaginationProps<TData>) {
	return (
		<div className="flex items-center justify-between px-2 py-4">
			<div className="flex-1 text-muted-foreground text-sm">
				{table.getFilteredSelectedRowModel().rows.length > 0 && (
					<span>
						{table.getFilteredSelectedRowModel().rows.length} of{" "}
						{table.getFilteredRowModel().rows.length} row(s) selected.
					</span>
				)}
			</div>
			<div className="flex items-center space-x-2">
				<span className="text-muted-foreground text-sm">
					Page {table.getState().pagination.pageIndex + 1} of{" "}
					{table.getPageCount()}
				</span>
				<button
					className="rounded border px-3 py-1 text-sm disabled:opacity-50"
					disabled={!table.getCanPreviousPage()}
					onClick={() => table.previousPage()}
					type="button"
				>
					Previous
				</button>
				<button
					className="rounded border px-3 py-1 text-sm disabled:opacity-50"
					disabled={!table.getCanNextPage()}
					onClick={() => table.nextPage()}
					type="button"
				>
					Next
				</button>
			</div>
		</div>
	);
}
