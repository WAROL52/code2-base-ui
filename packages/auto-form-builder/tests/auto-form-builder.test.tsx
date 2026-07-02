import type {
	FieldMeta,
	JsonSchemaDraft,
	ResolvedSchema,
} from "@code2-base-ui/json-schema-toolkit";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { FormAPI } from "../src/adapters/types";
import { AutoFormBuilder } from "../src/auto-form-builder";
import { mockAdapter } from "./test-utils";

const testSchema: Record<string, unknown> = {
	type: "object",
	properties: {
		name: { type: "string", title: "Name" },
	},
};

const mockResolvedSchema: ResolvedSchema = {
	definitions: {},
	draft: "draft-7",
	root: { type: "object", properties: {} },
};

const mockFields: FieldMeta[] = [
	{
		path: "custom",
		type: "string",
		label: "Custom Field",
		kind: "primitive",
	},
];

describe("AutoFormBuilder", () => {
	it("renders children with form, fields and resolvedSchema", () => {
		let form: FormAPI | undefined;
		let fields: unknown;
		let resolvedSchema: unknown;

		render(
			<AutoFormBuilder
				adapter={mockAdapter}
				defaultValues={{ name: "" }}
				schema={testSchema}
			>
				{(props) => {
					form = props.form as FormAPI;
					fields = props.fields;
					resolvedSchema = props.resolvedSchema;
					return <div data-testid="content">rendered</div>;
				}}
			</AutoFormBuilder>
		);
		expect(screen.getByTestId("content")).toBeDefined();
		expect(form).toBeDefined();
		expect(typeof (form as FormAPI).handleSubmit).toBe("function");
		expect(Array.isArray(fields)).toBe(true);
		expect(resolvedSchema).toBeDefined();
	});

	it("uses custom resolveSchema prop", () => {
		const customResolve = vi.fn(
			(_raw: unknown, _draft?: JsonSchemaDraft): ResolvedSchema =>
				mockResolvedSchema
		);

		render(
			<AutoFormBuilder
				adapter={mockAdapter}
				resolveSchema={customResolve}
				schema={testSchema}
			>
				{({ fields }) => (
					<div data-testid="custom-resolve">
						{fields.map((f) => (
							<span key={f.path}>{f.label}</span>
						))}
					</div>
				)}
			</AutoFormBuilder>
		);

		expect(customResolve).toHaveBeenCalledTimes(1);
	});

	it("uses custom traverseSchema prop", () => {
		const customTraverse = vi.fn(
			(_resolved: ResolvedSchema): FieldMeta[] => mockFields
		);

		render(
			<AutoFormBuilder
				adapter={mockAdapter}
				schema={testSchema}
				traverseSchema={customTraverse}
			>
				{({ fields }) => (
					<div data-testid="custom-traverse">
						{fields.map((f) => (
							<span key={f.path}>{f.label}</span>
						))}
					</div>
				)}
			</AutoFormBuilder>
		);

		expect(customTraverse).toHaveBeenCalledTimes(1);
		expect(screen.getByText("Custom Field")).toBeDefined();
	});

	it("falls back to default resolveSchema when not provided", () => {
		render(
			<AutoFormBuilder adapter={mockAdapter} schema={testSchema}>
				{({ fields, resolvedSchema }) => (
					<div data-testid="fallback">
						<span>{resolvedSchema.draft}</span>
						<span>{fields.length}</span>
					</div>
				)}
			</AutoFormBuilder>
		);

		expect(screen.getByTestId("fallback")).toBeDefined();
	});
});
