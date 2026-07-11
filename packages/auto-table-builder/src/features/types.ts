import type {
	ColumnPinningState,
	ColumnSizingState,
	ExpandedState,
	OnChangeFn,
	PaginationState,
	RowSelectionState,
	SortingState,
	Table,
	VisibilityState,
} from "@tanstack/react-table";
import type { ComponentType } from "react";

export type FeatureValue<TOptions> = true | false | TOptions;

export interface SortingOptions {
	enable?: boolean;
	enableMultiSort?: boolean;
	onSortingChange?: OnChangeFn<SortingState>;
	state?: SortingState;
}

export interface PaginationOptions {
	enable?: boolean;
	manualPagination?: boolean;
	onPaginationChange?: OnChangeFn<PaginationState>;
	pageCount?: number;
	state?: PaginationState;
}

export interface RowSelectionOptions {
	enable?: boolean;
	enableMultiRowSelection?: boolean;
	onRowSelectionChange?: OnChangeFn<RowSelectionState>;
	state?: RowSelectionState;
}

export interface ColumnVisibilityOptions {
	enable?: boolean;
	initialState?: VisibilityState;
	onColumnVisibilityChange?: OnChangeFn<VisibilityState>;
	state?: VisibilityState;
}

export interface ColumnResizingOptions {
	enable?: boolean;
	onColumnSizingChange?: OnChangeFn<ColumnSizingState>;
	resizeMode?: "onChange" | "onEnd";
	state?: ColumnSizingState;
}

export interface ColumnPinningOptions {
	enable?: boolean;
	onColumnPinningChange?: OnChangeFn<ColumnPinningState>;
	state?: ColumnPinningState;
}

export interface ExpandOptions {
	enable?: boolean;
	onExpandedChange?: OnChangeFn<ExpandedState>;
	state?: ExpandedState;
}

export type TableSlot =
	| "toolbar"
	| "header"
	| "pagination"
	| "selection-info"
	| "body";

export interface FeatureContract<TData, TOptions = Record<string, never>> {
	Component: ComponentType<{ table: Table<TData>; options: TOptions }>;
	getTableOptions: (options: TOptions) => Record<string, unknown>;
	key: string;
	slot: TableSlot;
}
