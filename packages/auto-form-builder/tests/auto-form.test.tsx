import type {
	FieldMeta,
	FieldRegistry,
} from "@code2-base-ui/json-schema-toolkit";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { tanstackAdapter } from "../src/adapters/tanstack";
import { AutoForm } from "../src/auto-form";

const testSchema: Record<string, unknown> = {
	type: "object",
	title: "Test Form",
	description: "A test form",
	properties: {
		name: { type: "string", title: "Name" },
	},
};

const mockRegistry = {
	resolve: vi
		.fn<
			(fieldMeta: FieldMeta) => React.ComponentType<Record<string, unknown>>
		>()
		.mockReturnValue(({ value, onChange }: Record<string, unknown>) => (
			<input
				data-testid="auto-input"
				onChange={(e) => (onChange as (v: string) => void)(e.target.value)}
				value={(value as string) ?? ""}
			/>
		)),
} as unknown as FieldRegistry;

describe("AutoForm", () => {
	it("renders form with title and fields", () => {
		render(
			<AutoForm
				adapter={tanstackAdapter}
				defaultValues={{ name: "John" }}
				registry={mockRegistry}
				schema={testSchema}
			/>
		);
		expect(screen.getByText("Test Form")).toBeDefined();
		expect(screen.getByText("A test form")).toBeDefined();
		const input = screen.getByTestId("auto-input") as HTMLInputElement;
		expect(input.value).toBe("John");
	});

	it("renders submit button when no children", () => {
		render(
			<AutoForm
				adapter={tanstackAdapter}
				registry={mockRegistry}
				schema={testSchema}
			/>
		);
		expect(screen.getByText("Envoyer")).toBeDefined();
	});
});
