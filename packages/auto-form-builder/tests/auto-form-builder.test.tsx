import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { tanstackAdapter } from "../src/adapters/tanstack";
import type { FormAPI } from "../src/adapters/types";
import { AutoFormBuilder } from "../src/auto-form-builder";

const testSchema: Record<string, unknown> = {
	type: "object",
	properties: {
		name: { type: "string", title: "Name" },
	},
};

describe("AutoFormBuilder", () => {
	it("renders children with form, fields and resolvedSchema", () => {
		let form: FormAPI | undefined;
		let fields: unknown;
		let resolvedSchema: unknown;

		render(
			<AutoFormBuilder
				adapter={tanstackAdapter}
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
});
