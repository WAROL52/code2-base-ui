import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { AutoTableBuilder } from "../src/auto-table-builder";
import type { ColumnRegistry } from "../src/registry";

const TestCell: any = ({ value }: { value: unknown }) => (
	<span>{String(value)}</span>
);

const mockRegistry: ColumnRegistry = {
	resolve: () => TestCell,
	register: () => undefined,
	setFallback: () => undefined,
};

interface TestData {
	name: string;
}

describe("AutoTableBuilder", () => {
	const testData: TestData[] = [{ name: "Alice" }];

	it("passes table and columns to children", () => {
		render(
			<AutoTableBuilder<TestData>
				data={testData}
				registry={mockRegistry}
				schema={{
					type: "object",
					properties: { name: { type: "string" } },
				}}
			>
				{({ table, columns }) => (
					<div>
						<span data-testid="col-count">{columns.length}</span>
						<span data-testid="row-count">
							{table.getRowModel().rows.length}
						</span>
					</div>
				)}
			</AutoTableBuilder>
		);

		expect(screen.getByTestId("col-count").textContent).toBe("1");
		expect(screen.getByTestId("row-count").textContent).toBe("1");
	});

	it("works with empty data", () => {
		render(
			<AutoTableBuilder<TestData>
				data={[]}
				registry={mockRegistry}
				schema={{
					type: "object",
					properties: { name: { type: "string" } },
				}}
			>
				{({ table }) => (
					<span data-testid="row-count">{table.getRowModel().rows.length}</span>
				)}
			</AutoTableBuilder>
		);

		expect(screen.getByTestId("row-count").textContent).toBe("0");
	});
});
