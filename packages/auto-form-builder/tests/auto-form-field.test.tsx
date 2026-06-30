import type {
	FieldMeta,
	FieldRegistry,
} from "@code2-base-ui/json-schema-toolkit";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { tanstackAdapter } from "../src/adapters/tanstack";
import { AutoFormField } from "../src/auto-form-field";
import type { FormLayout } from "../src/layout";
import { FormLayoutCtx } from "../src/layout/context";
import { shadcnLayout } from "../src/layout/shadcn";

const mockResolve = vi
	.fn<(fieldMeta: FieldMeta) => React.ComponentType<Record<string, unknown>>>()
	.mockReturnValue(({ value, onChange, label }: Record<string, unknown>) => (
		<div>
			<label>
				{label as string}
				<input
					data-error=""
					data-testid="field-input"
					onChange={(e) => (onChange as (v: string) => void)(e.target.value)}
					value={(value as string) ?? ""}
				/>
			</label>
		</div>
	));

const textFieldMeta: FieldMeta = {
	path: "name",
	type: "string",
	label: "Name",
	kind: "primitive",
};

describe("AutoFormField", () => {
	it("renders a primitive field using adapter.Field", () => {
		render(
			<FormLayoutCtx.Provider value={shadcnLayout}>
				<tanstackAdapter.FormProvider defaultValues={{ name: "John" }}>
					{(_formAPI) => (
						<AutoFormField
							adapter={tanstackAdapter}
							fieldMeta={textFieldMeta}
							registry={{ resolve: mockResolve } as unknown as FieldRegistry}
						/>
					)}
				</tanstackAdapter.FormProvider>
			</FormLayoutCtx.Provider>
		);

		expect(screen.getByText("Name")).toBeDefined();
		const input = screen.getByTestId("field-input") as HTMLInputElement;
		expect(input.value).toBe("John");
	});

	it("renders object field with custom ObjectField from context", () => {
		const customLayout: FormLayout = {
			ArrayField: ({ children }) => (
				<div data-testid="ctx-arrayfield">{children}</div>
			),
			CompositionsField: ({ children }) => (
				<div data-testid="ctx-compositions">{children}</div>
			),
			FieldSet: ({ children }) => (
				<div data-testid="ctx-fieldset">{children}</div>
			),
			FieldGroup: ({ children }) => (
				<div data-testid="ctx-group">{children}</div>
			),
			FieldLegend: ({ children }) => (
				<div data-testid="ctx-legend">{children}</div>
			),
			FieldDescription: ({ children }) => (
				<div data-testid="ctx-desc">{children}</div>
			),
			ObjectField: ({ fieldMeta, children }) => (
				<div data-testid="ctx-objectfield">
					{fieldMeta.label && (
						<div data-testid="ctx-object-label">{fieldMeta.label}</div>
					)}
					{children}
				</div>
			),
			SubmitButton: () => null,
		};

		const objectFieldMeta: FieldMeta = {
			path: "address",
			type: "object",
			label: "Address",
			description: "Your address",
			kind: "object",
			children: [
				{
					path: "address.street",
					type: "string",
					label: "Street",
					kind: "primitive",
				},
			],
		};

		render(
			<FormLayoutCtx.Provider value={customLayout}>
				<tanstackAdapter.FormProvider defaultValues={{}}>
					{(_formAPI) => (
						<AutoFormField
							adapter={tanstackAdapter}
							fieldMeta={objectFieldMeta}
							registry={{ resolve: mockResolve } as unknown as FieldRegistry}
						/>
					)}
				</tanstackAdapter.FormProvider>
			</FormLayoutCtx.Provider>
		);

		expect(screen.getByTestId("ctx-objectfield")).toBeDefined();
		expect(screen.getByTestId("ctx-object-label")).toBeDefined();
		expect(screen.getByText("Address")).toBeDefined();
	});
});
