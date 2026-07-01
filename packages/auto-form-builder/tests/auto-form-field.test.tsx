import type {
	FieldMeta,
	FieldRegistry,
} from "@code2-base-ui/json-schema-toolkit";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { tanstackAdapter } from "../src/adapters/tanstack";
import type { FormAPI } from "../src/adapters/types";
import { AutoFormField } from "../src/auto-form-field";
import type { FormLayout } from "../src/layout";
import { FormLayoutCtx } from "../src/layout/context";
import { shadcnLayout } from "../src/layout/shadcn";

const mockResolve = vi
	.fn<(fieldMeta: FieldMeta) => React.ComponentType<Record<string, unknown>>>()
	.mockReturnValue(
		({ disabled, onChange, value, label }: Record<string, unknown>) => (
			<div>
				<label>
					{label as string}
					<input
						data-error=""
						data-testid="field-input"
						disabled={!!disabled}
						onChange={(e) => (onChange as (v: string) => void)(e.target.value)}
						value={(value as string) ?? ""}
					/>
				</label>
			</div>
		)
	);

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

	it("returns null when uiHidden is true", () => {
		const hiddenField: FieldMeta = {
			...textFieldMeta,
			uiHidden: true,
		};
		const { container } = render(
			<FormLayoutCtx.Provider value={shadcnLayout}>
				<tanstackAdapter.FormProvider defaultValues={{ name: "" }}>
					{(_formAPI) => (
						<AutoFormField
							adapter={tanstackAdapter}
							fieldMeta={hiddenField}
							registry={{ resolve: mockResolve } as unknown as FieldRegistry}
						/>
					)}
				</tanstackAdapter.FormProvider>
			</FormLayoutCtx.Provider>
		);
		expect(container.innerHTML).toBe("");
	});

	it("renders with opacity-50 when uiReadonly is true", () => {
		const readonlyField: FieldMeta = {
			...textFieldMeta,
			uiReadonly: true,
		};
		render(
			<FormLayoutCtx.Provider value={shadcnLayout}>
				<tanstackAdapter.FormProvider defaultValues={{ name: "John" }}>
					{(_formAPI) => (
						<AutoFormField
							adapter={tanstackAdapter}
							fieldMeta={readonlyField}
							registry={{ resolve: mockResolve } as unknown as FieldRegistry}
						/>
					)}
				</tanstackAdapter.FormProvider>
			</FormLayoutCtx.Provider>
		);
		const input = screen.getByTestId("field-input") as HTMLInputElement;
		expect(input.disabled).toBe(true);
	});

	it("renders array field with add/remove callbacks", () => {
		const onAppend = vi.fn();
		const onRemove = vi.fn();
		const arrayField: FieldMeta = {
			path: "tags",
			type: "array",
			label: "Tags",
			kind: "array",
			itemMeta: {
				path: "tags[]",
				name: "tag",
				type: "string",
				label: "Tag",
				kind: "primitive",
			},
		};
		const customLayout: FormLayout = {
			...shadcnLayout,
			ArrayField: ({ children, onAdd, onRemove }) => (
				<div data-testid="ctx-arrayfield">
					<div data-testid="items">{children}</div>
					<button data-testid="add-btn" onClick={() => onAdd()} type="button">
						Add
					</button>
					<button
						data-testid="remove-btn"
						onClick={() => onRemove(0)}
						type="button"
					>
						Remove
					</button>
				</div>
			),
		};
		const formWithSpies: FormAPI = {
			appendFieldValue: onAppend,
			handleSubmit: vi.fn(),
			isSubmitting: false,
			removeFieldValue: onRemove,
			reset: vi.fn(),
			values: { tags: [] },
		};
		render(
			<FormLayoutCtx.Provider value={customLayout}>
				<AutoFormField
					adapter={tanstackAdapter}
					fieldMeta={arrayField}
					form={formWithSpies}
					registry={{ resolve: mockResolve } as unknown as FieldRegistry}
				/>
			</FormLayoutCtx.Provider>
		);
		expect(screen.getByTestId("ctx-arrayfield")).toBeDefined();
		fireEvent.click(screen.getByTestId("add-btn"));
		expect(onAppend).toHaveBeenCalledWith("tags", "");
		fireEvent.click(screen.getByTestId("remove-btn"));
		expect(onRemove).toHaveBeenCalledWith("tags", 0);
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

	it("renders array field with items when values exist", () => {
		mockResolve.mockClear();
		const arrayField: FieldMeta = {
			path: "tags",
			type: "array",
			label: "Tags",
			kind: "array",
			itemMeta: {
				path: "tags[]",
				name: "tag",
				type: "string",
				label: "Tag",
				kind: "primitive",
			},
		};
		const customLayout: FormLayout = {
			...shadcnLayout,
			ArrayField: ({ children }) => (
				<div data-testid="ctx-arrayfield">
					<div data-testid="items">{children}</div>
				</div>
			),
		};
		render(
			<FormLayoutCtx.Provider value={customLayout}>
				<tanstackAdapter.FormProvider defaultValues={{ tags: ["a", "b"] }}>
					{(formAPI) => (
						<AutoFormField
							adapter={tanstackAdapter}
							fieldMeta={arrayField}
							form={formAPI}
							registry={{ resolve: mockResolve } as unknown as FieldRegistry}
						/>
					)}
				</tanstackAdapter.FormProvider>
			</FormLayoutCtx.Provider>
		);
		expect(screen.getByTestId("ctx-arrayfield")).toBeDefined();
		expect(screen.getByTestId("items")).toBeDefined();
		expect(mockResolve).toHaveBeenCalled();
	});

	it("calls appendFieldValue with empty string for unknown item type", () => {
		const onAppend = vi.fn();
		const arrayField: FieldMeta = {
			path: "items",
			type: "array",
			label: "Items",
			kind: "array",
			itemMeta: {
				path: "items[]",
				name: "item",
				type: "unknown",
				label: "Item",
				kind: "primitive",
			},
		};
		const customLayout: FormLayout = {
			...shadcnLayout,
			ArrayField: ({ onAdd }) => (
				<div>
					<button data-testid="add-btn" onClick={() => onAdd()} type="button">
						Add
					</button>
				</div>
			),
		};
		render(
			<FormLayoutCtx.Provider value={customLayout}>
				<AutoFormField
					adapter={tanstackAdapter}
					fieldMeta={arrayField}
					form={{
						appendFieldValue: onAppend,
						handleSubmit: vi.fn(),
						isSubmitting: false,
						removeFieldValue: vi.fn(),
						reset: vi.fn(),
						values: { items: [] },
					}}
					registry={{ resolve: mockResolve } as unknown as FieldRegistry}
				/>
			</FormLayoutCtx.Provider>
		);
		fireEvent.click(screen.getByTestId("add-btn"));
		expect(onAppend).toHaveBeenCalledWith("items", "");
	});

	it("renders union field through AutoFormField", () => {
		const unionField: FieldMeta = {
			path: "contact",
			type: "object",
			label: "Contact",
			kind: "union",
			variants: [
				{
					label: "Email",
					meta: {
						path: "contact.email",
						type: "object",
						label: "Email",
						kind: "object",
						children: [],
					},
					children: [
						{
							path: "contact.email.address",
							type: "string",
							label: "Address",
							kind: "primitive",
						},
					],
				},
			],
		};
		render(
			<FormLayoutCtx.Provider value={shadcnLayout}>
				<tanstackAdapter.FormProvider defaultValues={{}}>
					{(formAPI) => (
						<AutoFormField
							adapter={tanstackAdapter}
							fieldMeta={unionField}
							form={formAPI}
							registry={{ resolve: mockResolve } as unknown as FieldRegistry}
						/>
					)}
				</tanstackAdapter.FormProvider>
			</FormLayoutCtx.Provider>
		);
		expect(screen.getByText("Email")).toBeTruthy();
	});
});
