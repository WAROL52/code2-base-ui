import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { ColumnRegistry } from "../src/registry";
import { useAutoTable } from "../src/use-auto-table";

const TestCell: any = ({ value }: { value: unknown }) => (
	<span>{String(value)}</span>
);

const mockRegistry: ColumnRegistry = {
	resolve: () => TestCell,
	register: () => undefined,
};

interface TestData {
	age: number;
	email: string;
	name: string;
}

function TestComponent({
	data,
	sorting,
}: {
	data: TestData[];
	sorting?: boolean;
}) {
	const table = useAutoTable<TestData>({
		schema: {
			type: "object",
			properties: {
				name: { type: "string" },
				email: { type: "string" },
				age: { type: "number" },
			},
		},
		data,
		registry: mockRegistry,
		sorting,
	});

	const { rows } = table.getRowModel();

	return (
		<div>
			<span data-testid="row-count">{rows.length}</span>
			{table.getAllColumns().map((col) => (
				<span data-testid={`col-${col.id}`} key={col.id}>
					{col.id}
				</span>
			))}
		</div>
	);
}

describe("useAutoTable", () => {
	const testData: TestData[] = [
		{ name: "Alice", email: "alice@example.com", age: 30 },
		{ name: "Bob", email: "bob@example.com", age: 25 },
	];

	it("returns a table instance with rows", () => {
		render(<TestComponent data={testData} />);
		expect(screen.getByTestId("row-count").textContent).toBe("2");
	});

	it("generates columns from schema", () => {
		render(<TestComponent data={testData} />);
		expect(screen.getByTestId("col-name")).toBeDefined();
		expect(screen.getByTestId("col-email")).toBeDefined();
		expect(screen.getByTestId("col-age")).toBeDefined();
	});

	it("renders without crashing with empty data", () => {
		render(<TestComponent data={[]} />);
		expect(screen.getByTestId("row-count").textContent).toBe("0");
	});
});
