"use client";

import { type ColumnDef, flexRender, type Table } from "@tanstack/react-table";
import type { ReactNode } from "react";
import type {
	ColumnPinningOptions,
	ColumnResizingOptions,
	ColumnVisibilityOptions,
	ExpandOptions,
	FeatureValue,
	PaginationOptions,
	RowSelectionOptions,
	SortingOptions,
} from "./features/types";
import type { ColumnRegistry } from "./registry";
import { useAutoTable } from "./use-auto-table";

export interface AutoTableProps<TData> {
	className?: string;
	columnOverrides?: Partial<Record<string, Partial<ColumnDef<TData>>>>;
	columnPinning?: FeatureValue<ColumnPinningOptions>;
	columnResizing?: FeatureValue<ColumnResizingOptions>;
	columns?: ColumnDef<TData>[];
	columnVisibility?: FeatureValue<ColumnVisibilityOptions>;
	data: TData[];
	emptyMessage?: string;
	expand?: FeatureValue<ExpandOptions>;
	pagination?: FeatureValue<PaginationOptions>;
	registry: ColumnRegistry;
	rowSelection?: FeatureValue<RowSelectionOptions>;
	schema: Record<string, unknown>;
	sorting?: FeatureValue<SortingOptions>;
	toolbar?: ReactNode;
}

function DefaultPagination<TData>({ table }: { table: Table<TData> }) {
	return (
		<div className="flex items-center justify-between px-2">
			<div className="flex-1 text-muted-foreground text-sm">
				{table.getFilteredSelectedRowModel().rows.length > 0 && (
					<span>
						{table.getFilteredSelectedRowModel().rows.length} of{" "}
						{table.getFilteredRowModel().rows.length} row(s) selected.
					</span>
				)}
			</div>
			<div className="flex items-center space-x-2">
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

export function AutoTable<TData>({
	schema,
	data,
	registry,
	columns: prefixColumns,
	columnOverrides,
	toolbar,
	emptyMessage = "No results.",
	className,
	sorting,
	pagination,
	rowSelection,
	columnVisibility,
	columnResizing,
	columnPinning,
	expand,
}: AutoTableProps<TData>) {
	const table = useAutoTable<TData>({
		schema,
		data,
		registry,
		columns: prefixColumns,
		columnOverrides,
		sorting,
		pagination,
		rowSelection,
		columnVisibility,
		columnResizing,
		columnPinning,
		expand,
	});

	const { rows } = table.getRowModel();
	const headerGroups = table.getHeaderGroups();

	return (
		<div className={className}>
			{toolbar && <div className="flex items-center py-2">{toolbar}</div>}
			<div className="overflow-x-auto rounded-md border">
				<table className="w-full caption-bottom text-sm">
					<thead>
						{headerGroups.map((headerGroup) => (
							<tr key={headerGroup.id}>
								{headerGroup.headers.map((header) => (
									<th
										className="h-12 px-4 text-left align-middle font-medium text-muted-foreground"
										key={header.id}
										onClick={
											header.column.getCanSort()
												? header.column.getToggleSortingHandler()
												: undefined
										}
										style={{
											width: header.getSize(),
											...(header.column.getCanSort() && sorting
												? { cursor: "pointer", userSelect: "none" as const }
												: {}),
										}}
									>
										{header.isPlaceholder
											? null
											: flexRender(
													header.column.columnDef.header,
													header.getContext()
												)}
									</th>
								))}
							</tr>
						))}
					</thead>
					<tbody>
						{rows.length > 0 ? (
							rows.map((row) => (
								<tr
									className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted"
									data-state={row.getIsSelected() ? "selected" : undefined}
									key={row.id}
								>
									{row.getVisibleCells().map((cell) => (
										<td className="p-4 align-middle" key={cell.id}>
											{flexRender(
												cell.column.columnDef.cell,
												cell.getContext()
											)}
										</td>
									))}
								</tr>
							))
						) : (
							<tr>
								<td
									className="h-24 text-center text-muted-foreground"
									colSpan={headerGroups[0]?.headers.length ?? 1}
								>
									{emptyMessage}
								</td>
							</tr>
						)}
					</tbody>
				</table>
			</div>
			{pagination && <DefaultPagination table={table} />}
		</div>
	);
}
