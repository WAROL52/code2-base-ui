import type {
	FieldMeta,
	FieldRegistry,
	ResolvedSchema,
} from "@code2-base-ui/json-schema-toolkit";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { createAutoForm } from "../src/create-auto-form";
import type { FormLayout } from "../src/layout";
import { mockAdapter } from "./test-utils";

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

const TestForm = createAutoForm({
	adapter: mockAdapter,
	registry: mockRegistry,
});

describe("createAutoForm", () => {
	it("renders form with title and fields", () => {
		render(<TestForm defaultValues={{ name: "John" }} schema={testSchema} />);
		expect(screen.getByText("Test Form")).toBeDefined();
		expect(screen.getByText("A test form")).toBeDefined();
		const input = screen.getByTestId("auto-input") as HTMLInputElement;
		expect(input.value).toBe("John");
	});

	it("renders submit button when no children", () => {
		render(<TestForm schema={testSchema} />);
		expect(screen.getByText("Envoyer")).toBeDefined();
	});

	it("renders with custom layout", () => {
		const customLayout: Partial<FormLayout> = {
			FieldSet: ({ children }) => (
				<div data-testid="custom-fieldset">{children}</div>
			),
			FieldGroup: ({ children }) => (
				<div data-testid="custom-group">{children}</div>
			),
			FieldLegend: ({ children }) => (
				<div data-testid="custom-legend">{children}</div>
			),
			FieldDescription: ({ children }) => (
				<div data-testid="custom-desc">{children}</div>
			),
			SubmitButton: () => (
				<button data-testid="custom-submit" type="submit">
					Save
				</button>
			),
		};

		const CustomForm = createAutoForm({
			adapter: mockAdapter,
			layout: customLayout,
			registry: mockRegistry,
		});

		render(<CustomForm schema={testSchema} />);

		expect(screen.getByTestId("custom-fieldset")).toBeDefined();
		expect(screen.getByTestId("custom-legend")).toBeDefined();
		expect(screen.getByTestId("custom-desc")).toBeDefined();
		expect(screen.getByTestId("custom-group")).toBeDefined();
		expect(screen.getByTestId("custom-submit")).toBeDefined();
	});

	it("passes resolveSchema to AutoFormBuilder", () => {
		const customResolve = vi.fn(
			(_raw: unknown): ResolvedSchema => ({
				definitions: {},
				draft: "draft-7",
				root: {
					type: "object",
					properties: {
						mockField: { type: "string" },
					},
				},
			})
		);

		const ResolveForm = createAutoForm({
			adapter: mockAdapter,
			registry: mockRegistry,
			resolveSchema: customResolve,
		});

		render(<ResolveForm schema={testSchema} />);

		expect(customResolve).toHaveBeenCalledTimes(1);
	});

	it("calls handleSubmit on form submission", async () => {
		const onSubmit = vi.fn();
		const { container } = render(
			<TestForm
				defaultValues={{ name: "John" }}
				onSubmit={onSubmit}
				schema={testSchema}
			/>
		);

		const form = container.querySelector("form");
		expect(form).toBeTruthy();
		fireEvent.submit(form as HTMLFormElement);
		await waitFor(() => {
			expect(onSubmit).toHaveBeenCalledWith({ name: "John" });
		});
	});
});
