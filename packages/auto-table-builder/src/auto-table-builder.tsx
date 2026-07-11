"use client";

import type { ColumnDef, Table } from "@tanstack/react-table";
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

export interface AutoTableBuilderChildrenProps<TData> {
	columns: ColumnDef<TData>[];
	table: Table<TData>;
}

export interface AutoTableBuilderProps<TData> {
	children: (props: AutoTableBuilderChildrenProps<TData>) => ReactNode;
	columnOverrides?: Partial<Record<string, Partial<ColumnDef<TData>>>>;
	columnPinning?: FeatureValue<ColumnPinningOptions>;
	columnResizing?: FeatureValue<ColumnResizingOptions>;
	columns?: ColumnDef<TData>[];
	columnVisibility?: FeatureValue<ColumnVisibilityOptions>;
	data: TData[];
	expand?: FeatureValue<ExpandOptions>;
	features?: Record<string, unknown>;
	pagination?: FeatureValue<PaginationOptions>;
	registry: ColumnRegistry;
	rowSelection?: FeatureValue<RowSelectionOptions>;
	schema: Record<string, unknown>;
	sorting?: FeatureValue<SortingOptions>;
}

export function AutoTableBuilder<TData>({
	schema,
	data,
	registry,
	columns: prefixColumns,
	columnOverrides,
	children,
	sorting,
	pagination,
	rowSelection,
	columnVisibility,
	columnResizing,
	columnPinning,
	expand,
}: AutoTableBuilderProps<TData>) {
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

	return children({
		table,
		columns: table.getAllColumns() as ColumnDef<TData>[],
	});
}
