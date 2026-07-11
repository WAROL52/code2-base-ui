import { describe, expect, it } from "vitest";
import { columnPinningFeature } from "../src/features/column-pinning";
import { columnResizingFeature } from "../src/features/column-resizing";
import { columnVisibilityFeature } from "../src/features/column-visibility";
import { expandFeature } from "../src/features/expand";
import { paginationFeature } from "../src/features/pagination";
import { rowSelectionFeature } from "../src/features/row-selection";
import { sortingFeature } from "../src/features/sorting";

function getOpts<T>(
	feature: { getTableOptions?: (opts: T) => Record<string, unknown> },
	opts: T
) {
	return feature.getTableOptions?.(opts) ?? {};
}

describe("sortingFeature", () => {
	it("returns enableSorting by default", () => {
		const opts = getOpts(sortingFeature, {});
		expect(opts.enableSorting).toBe(true);
	});

	it("passes state to table options", () => {
		const state = [{ id: "name", desc: false }];
		const opts = getOpts(sortingFeature, { state });
		expect((opts.state as Record<string, unknown>)?.sorting).toBe(state);
	});

	it("disables when enable=false", () => {
		const opts = getOpts(sortingFeature, { enable: false });
		expect(opts.enableSorting).toBe(false);
	});
});

describe("paginationFeature", () => {
	it("sets manualPagination when manualPagination option", () => {
		const opts = getOpts(paginationFeature, {
			manualPagination: true,
			pageCount: 5,
		});
		expect(opts.manualPagination).toBe(true);
		expect(opts.pageCount).toBe(5);
	});

	it("passes state", () => {
		const state = { pageIndex: 0, pageSize: 20 };
		const opts = getOpts(paginationFeature, { state });
		expect((opts.state as Record<string, unknown>)?.pagination).toBe(state);
	});
});

describe("rowSelectionFeature", () => {
	it("returns enableRowSelection by default", () => {
		const opts = getOpts(rowSelectionFeature, {});
		expect(opts.enableRowSelection).toBe(true);
	});

	it("passes state", () => {
		const state = { 1: true };
		const opts = getOpts(rowSelectionFeature, { state });
		expect((opts.state as Record<string, unknown>)?.rowSelection).toBe(state);
	});
});

describe("columnVisibilityFeature", () => {
	it("returns enableHiding by default", () => {
		const opts = getOpts(columnVisibilityFeature, {});
		expect(opts.enableHiding).toBe(true);
	});

	it("passes initialState", () => {
		const initialState = { email: false };
		const opts = getOpts(columnVisibilityFeature, {
			initialState,
		});
		expect(
			(opts.initialState as Record<string, unknown>)?.columnVisibility
		).toBe(initialState);
	});
});

describe("columnResizingFeature", () => {
	it("returns enableColumnResizing by default", () => {
		const opts = getOpts(columnResizingFeature, {});
		expect(opts.enableColumnResizing).toBe(true);
	});

	it("uses onChange resize mode by default", () => {
		const opts = getOpts(columnResizingFeature, {});
		expect(opts.columnResizeMode).toBe("onChange");
	});
});

describe("columnPinningFeature", () => {
	it("returns enableColumnPinning by default", () => {
		const opts = getOpts(columnPinningFeature, {});
		expect(opts.enableColumnPinning).toBe(true);
	});
});

describe("expandFeature", () => {
	it("returns enableExpanding by default", () => {
		const opts = getOpts(expandFeature, {});
		expect(opts.enableExpanding).toBe(true);
	});
});
