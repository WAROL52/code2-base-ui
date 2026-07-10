import {
	type FieldMeta,
	FieldRegistry,
} from "@code2-base-ui/json-schema-toolkit";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { FormAPI } from "../src/adapters/types";
import { AutoFormField } from "../src/auto-form-field";
import { createAutoForm } from "../src/create-auto-form";
import type { FormLayout } from "../src/layout";
import { FormLayoutCtx } from "../src/layout/context";
import { shadcnLayout } from "../src/layout/shadcn";
import { mockAdapter } from "./test-utils";

const mockForm: FormAPI = {
	values: {},
	isSubmitting: false,
	handleSubmit: vi.fn(),
	reset: vi.fn(),
	appendFieldValue: vi.fn(),
	removeFieldValue: vi.fn(),
};

const mockResolve = vi
	.fn<(fieldMeta: FieldMeta) => React.ComponentType<Record<string, unknown>>>()
	.mockReturnValue(({ value, onChange, label }: Record<string, unknown>) => (
		<div>
			<label>
				{label as string}
				<input
					data-testid="field-input"
					onChange={(e) => (onChange as (v: string) => void)(e.target.value)}
					value={(value as string) ?? ""}
				/>
			</label>
		</div>
	));

const registry = new FieldRegistry();
vi.spyOn(registry, "resolve").mockImplementation(
	(field) => mockResolve(field) as React.ComponentType<Record<string, unknown>>
);

const unionFieldMeta: FieldMeta = {
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
					label: "Email Address",
					kind: "primitive",
				},
			],
		},
		{
			label: "Phone",
			meta: {
				path: "contact.phone",
				type: "object",
				label: "Phone",
				kind: "object",
				children: [],
			},
			children: [],
		},
	],
};

describe("AutoFormField — union", () => {
	it("renders CompositionsField with variant options", () => {
		const onSelectSpy = vi.fn();
		const captureLayout: FormLayout = {
			...shadcnLayout,
			CompositionsField: ({ options, selectedIndex, children }) => {
				onSelectSpy(options, selectedIndex);
				return (
					<div data-testid="mock-compositions">
						{options.map((o) => (
							<span key={o.label}>{o.label}</span>
						))}
						<div>{children}</div>
					</div>
				);
			},
		};

		render(
			<FormLayoutCtx.Provider value={captureLayout}>
				<mockAdapter.FormProvider defaultValues={{}}>
					{(_formAPI) => (
						<AutoFormField
							adapter={mockAdapter}
							fieldMeta={unionFieldMeta}
							form={mockForm}
							registry={registry}
						/>
					)}
				</mockAdapter.FormProvider>
			</FormLayoutCtx.Provider>
		);

		expect(screen.getByTestId("mock-compositions")).toBeDefined();
		expect(screen.getByText("Email")).toBeDefined();
		expect(screen.getByText("Phone")).toBeDefined();
		expect(onSelectSpy).toHaveBeenCalledWith(
			[{ label: "Email" }, { label: "Phone" }],
			0
		);
	});

	it("renders children of the selected variant", () => {
		render(
			<FormLayoutCtx.Provider value={shadcnLayout}>
				<mockAdapter.FormProvider defaultValues={{}}>
					{(_formAPI) => (
						<AutoFormField
							adapter={mockAdapter}
							fieldMeta={unionFieldMeta}
							form={mockForm}
							registry={registry}
						/>
					)}
				</mockAdapter.FormProvider>
			</FormLayoutCtx.Provider>
		);

		expect(screen.getByText("Email Address")).toBeDefined();
	});

	it("returns null when variants is empty", () => {
		const emptyVariants: FieldMeta = {
			path: "empty",
			type: "object",
			label: "Empty",
			kind: "union",
			variants: [],
		};

		const { container } = render(
			<FormLayoutCtx.Provider value={shadcnLayout}>
				<mockAdapter.FormProvider defaultValues={{}}>
					{(_formAPI) => (
						<AutoFormField
							adapter={mockAdapter}
							fieldMeta={emptyVariants}
							form={mockForm}
							registry={registry}
						/>
					)}
				</mockAdapter.FormProvider>
			</FormLayoutCtx.Provider>
		);

		expect(container.textContent).toBe("");
	});

	it("renders with default selectedIndex of 0", () => {
		const layoutWithSpy: FormLayout = {
			...shadcnLayout,
			CompositionsField: ({ selectedIndex, options }) => (
				<div>
					<span data-testid="selected">{selectedIndex}</span>
					{options.map((o) => (
						<span key={o.label}>{o.label}</span>
					))}
				</div>
			),
		};

		render(
			<FormLayoutCtx.Provider value={layoutWithSpy}>
				<mockAdapter.FormProvider defaultValues={{}}>
					{(_formAPI) => (
						<AutoFormField
							adapter={mockAdapter}
							fieldMeta={{
								path: "test",
								type: "object",
								label: "Test",
								kind: "union",
								variants: [
									{
										label: "Only",
										meta: {
											path: "test.a",
											type: "object",
											label: "A",
											kind: "object",
											children: [],
										},
										children: [],
									},
								],
							}}
							form={mockForm}
							registry={registry}
						/>
					)}
				</mockAdapter.FormProvider>
			</FormLayoutCtx.Provider>
		);

		expect(screen.getByTestId("selected").textContent).toBe("0");
	});
});

describe("AutoFormField — unionFieldRenderer seam", () => {
	it("uses custom unionFieldRenderer for union fields", () => {
		const CustomUnion = vi
			.fn()
			.mockReturnValue(<div data-testid="custom-union">Custom Union</div>);

		render(
			<FormLayoutCtx.Provider value={shadcnLayout}>
				<mockAdapter.FormProvider defaultValues={{}}>
					{(_formAPI) => (
						<AutoFormField
							adapter={mockAdapter}
							fieldMeta={unionFieldMeta}
							form={mockForm}
							registry={registry}
							unionFieldRenderer={CustomUnion}
						/>
					)}
				</mockAdapter.FormProvider>
			</FormLayoutCtx.Provider>
		);

		expect(screen.getByTestId("custom-union")).toBeDefined();
		expect(CustomUnion).toHaveBeenCalledOnce();
	});

	it("passes unionFieldRenderer through to nested union fields inside objects", () => {
		const CustomUnion = vi
			.fn()
			.mockReturnValue(<div data-testid="nested-custom">Nested</div>);

		const nestedUnion: FieldMeta = {
			path: "outer",
			type: "object",
			label: "Outer",
			kind: "object",
			children: [
				{
					...unionFieldMeta,
					path: "outer.contact",
				},
			],
		};

		render(
			<FormLayoutCtx.Provider value={shadcnLayout}>
				<mockAdapter.FormProvider defaultValues={{}}>
					{(_formAPI) => (
						<AutoFormField
							adapter={mockAdapter}
							fieldMeta={nestedUnion}
							form={mockForm}
							registry={registry}
							unionFieldRenderer={CustomUnion}
						/>
					)}
				</mockAdapter.FormProvider>
			</FormLayoutCtx.Provider>
		);

		expect(screen.getByTestId("nested-custom")).toBeDefined();
	});
});

describe("createAutoForm — unionFieldRenderer config", () => {
	it("passes unionFieldRenderer to AutoFormField", () => {
		const CustomUnion = vi
			.fn()
			.mockReturnValue(<div data-testid="autoform-union">From AutoForm</div>);

		const schema = {
			type: "object",
			title: "Union Test",
			properties: {
				contact: {
					oneOf: [
						{
							type: "object",
							title: "Email",
							properties: {
								email: { type: "string", title: "Email" },
							},
						},
						{
							type: "object",
							title: "Phone",
							properties: {
								phone: { type: "string", title: "Phone" },
							},
						},
					],
				},
			},
		};

		const TestForm = createAutoForm({
			adapter: mockAdapter,
			registry,
			unionFieldRenderer: CustomUnion,
		});

		render(<TestForm schema={schema} />);

		expect(screen.getByTestId("autoform-union")).toBeDefined();
	});
});
