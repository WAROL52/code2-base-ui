import {
	type FieldMeta,
	FieldRegistry,
} from "@code2-base-ui/json-schema-toolkit";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { FormAPI } from "../src/adapters/types";
import { AutoFormField } from "../src/auto-form-field";
import type { FormLayout } from "../src/layout";
import { FormLayoutCtx } from "../src/layout/context";
import { shadcnLayout } from "../src/layout/shadcn";
import { mockAdapter } from "./test-utils";

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

const mockForm: FormAPI = {
	values: {},
	isSubmitting: false,
	handleSubmit: vi.fn(),
	reset: vi.fn(),
	appendFieldValue: vi.fn(),
	removeFieldValue: vi.fn(),
};

const registry = new FieldRegistry();
vi.spyOn(registry, "resolve").mockImplementation(
	(field) => mockResolve(field) as React.ComponentType<Record<string, unknown>>
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
				<mockAdapter.FormProvider defaultValues={{ name: "John" }}>
					{(_formAPI) => (
						<AutoFormField
							adapter={mockAdapter}
							fieldMeta={textFieldMeta}
							form={mockForm}
							registry={registry}
						/>
					)}
				</mockAdapter.FormProvider>
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
				<mockAdapter.FormProvider defaultValues={{ name: "" }}>
					{(_formAPI) => (
						<AutoFormField
							adapter={mockAdapter}
							fieldMeta={hiddenField}
							form={mockForm}
							registry={registry}
						/>
					)}
				</mockAdapter.FormProvider>
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
				<mockAdapter.FormProvider defaultValues={{ name: "John" }}>
					{(_formAPI) => (
						<AutoFormField
							adapter={mockAdapter}
							fieldMeta={readonlyField}
							form={mockForm}
							registry={registry}
						/>
					)}
				</mockAdapter.FormProvider>
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
				<mockAdapter.FormProvider defaultValues={{ tags: [] }}>
					{(_formAPI) => (
						<AutoFormField
							adapter={mockAdapter}
							fieldMeta={arrayField}
							form={formWithSpies}
							registry={registry}
						/>
					)}
				</mockAdapter.FormProvider>
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
			...shadcnLayout,
			ObjectField: ({ fieldMeta, children }) => (
				<div data-testid="ctx-objectfield">
					{fieldMeta.label && (
						<div data-testid="ctx-object-label">{fieldMeta.label}</div>
					)}
					{children}
				</div>
			),
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
				<mockAdapter.FormProvider defaultValues={{}}>
					{(_formAPI) => (
						<AutoFormField
							adapter={mockAdapter}
							fieldMeta={objectFieldMeta}
							form={mockForm}
							registry={registry}
						/>
					)}
				</mockAdapter.FormProvider>
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
				<mockAdapter.FormProvider defaultValues={{ tags: ["a", "b"] }}>
					{(formAPI) => (
						<AutoFormField
							adapter={mockAdapter}
							fieldMeta={arrayField}
							form={formAPI}
							registry={registry}
						/>
					)}
				</mockAdapter.FormProvider>
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
		const mockForm = {
			appendFieldValue: onAppend,
			handleSubmit: vi.fn(),
			isSubmitting: false,
			removeFieldValue: vi.fn(),
			reset: vi.fn(),
			values: { items: [] },
		};
		render(
			<FormLayoutCtx.Provider value={customLayout}>
				<mockAdapter.FormProvider defaultValues={{ items: [] }}>
					{(_formAPI) => (
						<AutoFormField
							adapter={mockAdapter}
							fieldMeta={arrayField}
							form={mockForm}
							registry={registry}
						/>
					)}
				</mockAdapter.FormProvider>
			</FormLayoutCtx.Provider>
		);
		fireEvent.click(screen.getByTestId("add-btn"));
		expect(onAppend).toHaveBeenCalledWith("items", "");
	});

	it("calls appendFieldValue with 0 for number item type", () => {
		const onAppend = vi.fn();
		const field = {
			path: "nums",
			type: "array",
			label: "Nums",
			kind: "array" as const,
			itemMeta: {
				path: "nums[]",
				name: "n",
				type: "number",
				label: "N",
				kind: "primitive" as const,
			},
		};
		const layout = {
			...shadcnLayout,
			ArrayField: ({ onAdd }: { onAdd: () => void }) => (
				<button data-testid="add-btn" onClick={() => onAdd()} type="button">
					Add
				</button>
			),
		};
		const mockForm = {
			appendFieldValue: onAppend,
			handleSubmit: vi.fn(),
			isSubmitting: false,
			removeFieldValue: vi.fn(),
			reset: vi.fn(),
			values: { nums: [] },
		};
		render(
			<FormLayoutCtx.Provider value={layout}>
				<mockAdapter.FormProvider defaultValues={{ nums: [] }}>
					{(_formAPI) => (
						<AutoFormField
							adapter={mockAdapter}
							fieldMeta={field}
							form={mockForm}
							registry={registry}
						/>
					)}
				</mockAdapter.FormProvider>
			</FormLayoutCtx.Provider>
		);
		fireEvent.click(screen.getByTestId("add-btn"));
		expect(onAppend).toHaveBeenCalledWith("nums", 0);
	});

	it("calls appendFieldValue with false for boolean item type", () => {
		const onAppend = vi.fn();
		const field = {
			path: "flags",
			type: "array",
			label: "Flags",
			kind: "array" as const,
			itemMeta: {
				path: "flags[]",
				name: "f",
				type: "boolean",
				label: "F",
				kind: "primitive" as const,
			},
		};
		const layout = {
			...shadcnLayout,
			ArrayField: ({ onAdd }: { onAdd: () => void }) => (
				<button data-testid="add-btn2" onClick={() => onAdd()} type="button">
					Add
				</button>
			),
		};
		const mockForm = {
			appendFieldValue: onAppend,
			handleSubmit: vi.fn(),
			isSubmitting: false,
			removeFieldValue: vi.fn(),
			reset: vi.fn(),
			values: { flags: [] },
		};
		render(
			<FormLayoutCtx.Provider value={layout}>
				<mockAdapter.FormProvider defaultValues={{ flags: [] }}>
					{(_formAPI) => (
						<AutoFormField
							adapter={mockAdapter}
							fieldMeta={field}
							form={mockForm}
							registry={registry}
						/>
					)}
				</mockAdapter.FormProvider>
			</FormLayoutCtx.Provider>
		);
		fireEvent.click(screen.getByTestId("add-btn2"));
		expect(onAppend).toHaveBeenCalledWith("flags", false);
	});

	it("calls appendFieldValue with {} for object item type", () => {
		const onAppend = vi.fn();
		const field = {
			path: "objs",
			type: "array",
			label: "Objs",
			kind: "array" as const,
			itemMeta: {
				path: "objs[]",
				name: "o",
				type: "object",
				label: "O",
				kind: "primitive" as const,
			},
		};
		const layout = {
			...shadcnLayout,
			ArrayField: ({ onAdd }: { onAdd: () => void }) => (
				<button data-testid="add-btn3" onClick={() => onAdd()} type="button">
					Add
				</button>
			),
		};
		const mockForm = {
			appendFieldValue: onAppend,
			handleSubmit: vi.fn(),
			isSubmitting: false,
			removeFieldValue: vi.fn(),
			reset: vi.fn(),
			values: { objs: [] },
		};
		render(
			<FormLayoutCtx.Provider value={layout}>
				<mockAdapter.FormProvider defaultValues={{ objs: [] }}>
					{(_formAPI) => (
						<AutoFormField
							adapter={mockAdapter}
							fieldMeta={field}
							form={mockForm}
							registry={registry}
						/>
					)}
				</mockAdapter.FormProvider>
			</FormLayoutCtx.Provider>
		);
		fireEvent.click(screen.getByTestId("add-btn3"));
		expect(onAppend).toHaveBeenCalledWith("objs", {});
	});

	it("calls appendFieldValue with [] for array item type", () => {
		const onAppend = vi.fn();
		const field = {
			path: "arrs",
			type: "array",
			label: "Arrs",
			kind: "array" as const,
			itemMeta: {
				path: "arrs[]",
				name: "a",
				type: "array",
				label: "A",
				kind: "primitive" as const,
			},
		};
		const layout = {
			...shadcnLayout,
			ArrayField: ({ onAdd }: { onAdd: () => void }) => (
				<button data-testid="add-btn4" onClick={() => onAdd()} type="button">
					Add
				</button>
			),
		};
		const mockForm = {
			appendFieldValue: onAppend,
			handleSubmit: vi.fn(),
			isSubmitting: false,
			removeFieldValue: vi.fn(),
			reset: vi.fn(),
			values: { arrs: [] },
		};
		render(
			<FormLayoutCtx.Provider value={layout}>
				<mockAdapter.FormProvider defaultValues={{ arrs: [] }}>
					{(_formAPI) => (
						<AutoFormField
							adapter={mockAdapter}
							fieldMeta={field}
							form={mockForm}
							registry={registry}
						/>
					)}
				</mockAdapter.FormProvider>
			</FormLayoutCtx.Provider>
		);
		fireEvent.click(screen.getByTestId("add-btn4"));
		expect(onAppend).toHaveBeenCalledWith("arrs", []);
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
				<mockAdapter.FormProvider defaultValues={{}}>
					{(formAPI) => (
						<AutoFormField
							adapter={mockAdapter}
							fieldMeta={unionField}
							form={formAPI}
							registry={registry}
						/>
					)}
				</mockAdapter.FormProvider>
			</FormLayoutCtx.Provider>
		);
		expect(screen.getByText("Email")).toBeTruthy();
	});

	it("renders array field with form prop", () => {
		const field: FieldMeta = {
			path: "items",
			type: "array",
			label: "Items",
			kind: "array",
			itemMeta: {
				path: "items[]",
				name: "i",
				type: "string",
				label: "I",
				kind: "primitive",
			},
		};
		const layout = {
			...shadcnLayout,
			ArrayField: ({ children }: { children: React.ReactNode }) => (
				<div data-testid="noform-array">{children}</div>
			),
		};
		render(
			<FormLayoutCtx.Provider value={layout}>
				<mockAdapter.FormProvider defaultValues={{}}>
					{(_formAPI) => (
						<AutoFormField
							adapter={mockAdapter}
							fieldMeta={field}
							form={mockForm}
							registry={registry}
						/>
					)}
				</mockAdapter.FormProvider>
			</FormLayoutCtx.Provider>
		);
		expect(screen.getByTestId("noform-array")).toBeDefined();
	});
});
