import {
	type FieldMeta,
	resolveSchema,
	traverseSchema,
} from "@code2-base-ui/json-schema-toolkit";
import {
	type ColumnDef,
	getCoreRowModel,
	getExpandedRowModel,
	getPaginationRowModel,
	getSortedRowModel,
	type Table,
	useReactTable,
} from "@tanstack/react-table";
import { useMemo } from "react";
import { buildColumns } from "./build-columns";
import {
	columnPinningFeature,
	columnResizingFeature,
	columnVisibilityFeature,
	expandFeature,
	paginationFeature,
	rowSelectionFeature,
	sortingFeature,
} from "./features";
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

export interface UseAutoTableConfig<TData> {
	columnOverrides?: Partial<Record<string, Partial<ColumnDef<TData>>>>;
	columnPinning?: FeatureValue<ColumnPinningOptions>;
	columnResizing?: FeatureValue<ColumnResizingOptions>;
	columns?: ColumnDef<TData>[];
	columnVisibility?: FeatureValue<ColumnVisibilityOptions>;
	data: TData[];
	expand?: FeatureValue<ExpandOptions>;
	pagination?: FeatureValue<PaginationOptions>;
	registry: ColumnRegistry;
	rowSelection?: FeatureValue<RowSelectionOptions>;
	schema: Record<string, unknown>;
	sorting?: FeatureValue<SortingOptions>;
}

function getFeatureOptions<T>(value: FeatureValue<T> | undefined): T | null {
	if (value === false || value === undefined) {
		return null;
	}
	if (value === true) {
		// Return empty object = enabled with defaults
		return {} as T;
	}
	return value;
}

export function useAutoTable<TData>(
	config: UseAutoTableConfig<TData>
): Table<TData> {
	const {
		schema,
		data,
		registry,
		columns: prefixColumns,
		columnOverrides,
	} = config;

	const sortingOpts = getFeatureOptions(config.sorting);
	const paginationOpts = getFeatureOptions(config.pagination);
	const rowSelectionOpts = getFeatureOptions(config.rowSelection);
	const columnVisibilityOpts = getFeatureOptions(config.columnVisibility);
	const columnResizingOpts = getFeatureOptions(config.columnResizing);
	const columnPinningOpts = getFeatureOptions(config.columnPinning);
	const expandOpts = getFeatureOptions(config.expand);

	const fields: FieldMeta[] = useMemo(() => {
		const resolved = resolveSchema(schema);
		return traverseSchema(resolved);
	}, [schema]);

	const columns: ColumnDef<TData>[] = useMemo(
		() =>
			buildColumns({
				fields,
				registry,
				prefix: prefixColumns,
				overrides: columnOverrides,
			}),
		[fields, registry, prefixColumns, columnOverrides]
	);

	const tableOptions: Record<string, unknown> = useMemo(() => {
		const opts: Record<string, unknown> = {};

		if (sortingOpts) {
			Object.assign(opts, sortingFeature.getTableOptions(sortingOpts));
		}

		if (paginationOpts) {
			Object.assign(opts, paginationFeature.getTableOptions(paginationOpts));
		}

		if (rowSelectionOpts) {
			Object.assign(
				opts,
				rowSelectionFeature.getTableOptions(rowSelectionOpts)
			);
		}

		if (columnVisibilityOpts) {
			Object.assign(
				opts,
				columnVisibilityFeature.getTableOptions(columnVisibilityOpts)
			);
		}

		if (columnResizingOpts) {
			Object.assign(
				opts,
				columnResizingFeature.getTableOptions(columnResizingOpts)
			);
		}

		if (columnPinningOpts) {
			Object.assign(
				opts,
				columnPinningFeature.getTableOptions(columnPinningOpts)
			);
		}

		if (expandOpts) {
			Object.assign(opts, expandFeature.getTableOptions(expandOpts));
		}

		return opts;
	}, [
		sortingOpts,
		paginationOpts,
		rowSelectionOpts,
		columnVisibilityOpts,
		columnResizingOpts,
		columnPinningOpts,
		expandOpts,
	]);

	const table = useReactTable<TData>({
		data,
		columns,
		getCoreRowModel: getCoreRowModel(),
		...(sortingOpts ? { getSortedRowModel: getSortedRowModel() } : {}),
		...(paginationOpts && !paginationOpts.manualPagination
			? { getPaginationRowModel: getPaginationRowModel() }
			: {}),
		...(expandOpts ? { getExpandedRowModel: getExpandedRowModel() } : {}),
		...(tableOptions as Record<string, unknown>),
	});

	return table;
}
