import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { AutoTable } from "../src/auto-table";
import type { ColumnRegistry } from "../src/registry";

const TestCell: any = ({ value }: { value: unknown }) => (
	<span>{String(value)}</span>
);

const mockRegistry: ColumnRegistry = {
	resolve: () => TestCell,
	register: () => undefined,
};

interface TestData {
	email: string;
	name: string;
}

describe("AutoTable", () => {
	const testData: TestData[] = [
		{ name: "Alice", email: "alice@example.com" },
		{ name: "Bob", email: "bob@example.com" },
	];

	it("renders table with data", () => {
		render(
			<AutoTable<TestData>
				data={testData}
				registry={mockRegistry}
				schema={{
					type: "object",
					properties: {
						name: { type: "string" },
						email: { type: "string" },
					},
				}}
			/>
		);

		expect(screen.getByText("Alice")).toBeDefined();
		expect(screen.getByText("Bob")).toBeDefined();
		expect(screen.getByText("Name")).toBeDefined();
		expect(screen.getByText("Email")).toBeDefined();
	});

	it("renders empty state message", () => {
		render(
			<AutoTable<TestData>
				data={[]}
				registry={mockRegistry}
				schema={{
					type: "object",
					properties: { name: { type: "string" } },
				}}
			/>
		);

		expect(screen.getByText("No results.")).toBeDefined();
	});

	it("renders custom empty message", () => {
		render(
			<AutoTable<TestData>
				data={[]}
				emptyMessage="Nothing here"
				registry={mockRegistry}
				schema={{
					type: "object",
					properties: { name: { type: "string" } },
				}}
			/>
		);

		expect(screen.getByText("Nothing here")).toBeDefined();
	});

	it("renders toolbar when provided", () => {
		render(
			<AutoTable<TestData>
				data={testData}
				registry={mockRegistry}
				schema={{
					type: "object",
					properties: { name: { type: "string" } },
				}}
				toolbar={<button type="button">Export</button>}
			/>
		);

		expect(screen.getByText("Export")).toBeDefined();
	});

	it("renders pagination controls when pagination is enabled", () => {
		render(
			<AutoTable<TestData>
				data={testData}
				pagination
				registry={mockRegistry}
				schema={{
					type: "object",
					properties: { name: { type: "string" } },
				}}
			/>
		);

		expect(screen.getByText("Previous")).toBeDefined();
		expect(screen.getByText("Next")).toBeDefined();
	});
});
