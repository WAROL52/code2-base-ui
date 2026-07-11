import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { AutoTablePagination } from "../src/auto-table-pagination";
import { AutoTableToolbar } from "../src/auto-table-toolbar";
import { AutoTableViewOptions } from "../src/auto-table-view-options";

const pagePattern = /Page 1 of 5/;

describe("AutoTablePagination", () => {
	const mockTable = {
		getState: () => ({ pagination: { pageIndex: 0 } }),
		getPageCount: () => 5,
		getCanPreviousPage: () => false,
		getCanNextPage: () => true,
		previousPage: () => undefined,
		nextPage: () => undefined,
		getFilteredSelectedRowModel: () => ({ rows: [] }),
		getFilteredRowModel: () => ({ rows: [] }),
	} as never;

	it("renders pagination controls", () => {
		render(<AutoTablePagination table={mockTable} />);
		expect(screen.getByText("Previous")).toBeDefined();
		expect(screen.getByText("Next")).toBeDefined();
		expect(screen.getByText(pagePattern)).toBeDefined();
	});

	it("disables Previous button on first page", () => {
		render(<AutoTablePagination table={mockTable} />);
		expect((screen.getByText("Previous") as HTMLButtonElement).disabled).toBe(
			true
		);
	});
});

describe("AutoTableViewOptions", () => {
	const columns = [
		{
			id: "name",
			getIsVisible: () => true,
			getToggleVisibilityHandler: () => () => undefined,
		},
		{
			id: "email",
			getIsVisible: () => false,
			getToggleVisibilityHandler: () => () => undefined,
		},
	];

	it("renders toggle button", () => {
		render(
			<AutoTableViewOptions
				getAllColumns={() => columns}
				getIsVisible={() => true}
			/>
		);
		expect(screen.getByText("Columns")).toBeDefined();
	});
});

describe("AutoTableToolbar", () => {
	it("renders children", () => {
		render(
			<AutoTableToolbar>
				<button type="button">Filter</button>
			</AutoTableToolbar>
		);
		expect(screen.getByText("Filter")).toBeDefined();
	});

	it("renders empty toolbar", () => {
		const { container } = render(<AutoTableToolbar />);
		expect(container.querySelector("div")).toBeDefined();
	});
});
