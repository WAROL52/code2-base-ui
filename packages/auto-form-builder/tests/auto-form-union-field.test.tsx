import type {
	FieldMeta,
	FieldRegistry,
} from "@code2-base-ui/json-schema-toolkit";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { tanstackAdapter } from "../src/adapters/tanstack";
import { AutoForm } from "../src/auto-form";
import { AutoFormField } from "../src/auto-form-field";
import type { AutoFormFieldProps } from "../src/auto-form-field-types";
import { UnionFieldHandler } from "../src/auto-form-union-field";
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
					data-testid="field-input"
					onChange={(e) => (onChange as (v: string) => void)(e.target.value)}
					value={(value as string) ?? ""}
				/>
			</label>
		</div>
	));

function renderChild(props: AutoFormFieldProps) {
	return (childMeta: FieldMeta) => (
		<AutoFormField
			adapter={props.adapter}
			fieldMeta={childMeta}
			form={props.form}
			key={childMeta.path}
			registry={props.registry}
			unionFieldRenderer={props.unionFieldRenderer}
		/>
	);
}

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

describe("UnionFieldHandler", () => {
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
				<tanstackAdapter.FormProvider defaultValues={{}}>
					{(_formAPI) => (
						<UnionFieldHandler
							adapter={tanstackAdapter}
							fieldMeta={unionFieldMeta}
							registry={{ resolve: mockResolve } as unknown as FieldRegistry}
						/>
					)}
				</tanstackAdapter.FormProvider>
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
				<tanstackAdapter.FormProvider defaultValues={{}}>
					{(formAPI) => (
						<UnionFieldHandler
							adapter={tanstackAdapter}
							fieldMeta={unionFieldMeta}
							form={formAPI}
							registry={{ resolve: mockResolve } as unknown as FieldRegistry}
							renderChild={renderChild({
								adapter: tanstackAdapter,
								fieldMeta: unionFieldMeta,
								form: formAPI,
								registry: { resolve: mockResolve } as unknown as FieldRegistry,
							})}
						/>
					)}
				</tanstackAdapter.FormProvider>
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
				<tanstackAdapter.FormProvider defaultValues={{}}>
					{(_formAPI) => (
						<UnionFieldHandler
							adapter={tanstackAdapter}
							fieldMeta={emptyVariants}
							registry={{ resolve: mockResolve } as unknown as FieldRegistry}
						/>
					)}
				</tanstackAdapter.FormProvider>
			</FormLayoutCtx.Provider>
		);

		expect(container.textContent).toBe("");
	});

	it("returns null when variants is undefined", () => {
		const noVariants: FieldMeta = {
			path: "plain",
			type: "string",
			label: "Plain",
			kind: "primitive",
		};

		const { container } = render(
			<FormLayoutCtx.Provider value={shadcnLayout}>
				<tanstackAdapter.FormProvider defaultValues={{}}>
					{(_formAPI) => (
						<UnionFieldHandler
							adapter={tanstackAdapter}
							fieldMeta={noVariants}
							registry={{ resolve: mockResolve } as unknown as FieldRegistry}
						/>
					)}
				</tanstackAdapter.FormProvider>
			</FormLayoutCtx.Provider>
		);

		expect(container.textContent).toBe("");
	});
});

describe("AutoFormField — unionFieldRenderer seam", () => {
	it("uses custom unionFieldRenderer for union fields", () => {
		const CustomUnion = vi
			.fn()
			.mockReturnValue(<div data-testid="custom-union">Custom Union</div>);

		render(
			<FormLayoutCtx.Provider value={shadcnLayout}>
				<tanstackAdapter.FormProvider defaultValues={{}}>
					{(_formAPI) => (
						<AutoFormField
							adapter={tanstackAdapter}
							fieldMeta={unionFieldMeta}
							registry={{ resolve: mockResolve } as unknown as FieldRegistry}
							unionFieldRenderer={CustomUnion}
						/>
					)}
				</tanstackAdapter.FormProvider>
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
				<tanstackAdapter.FormProvider defaultValues={{}}>
					{(_formAPI) => (
						<AutoFormField
							adapter={tanstackAdapter}
							fieldMeta={nestedUnion}
							registry={{ resolve: mockResolve } as unknown as FieldRegistry}
							unionFieldRenderer={CustomUnion}
						/>
					)}
				</tanstackAdapter.FormProvider>
			</FormLayoutCtx.Provider>
		);

		expect(screen.getByTestId("nested-custom")).toBeDefined();
	});
});

describe("AutoForm — unionFieldRenderer prop", () => {
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

		render(
			<AutoForm
				adapter={tanstackAdapter}
				registry={{ resolve: mockResolve } as unknown as FieldRegistry}
				schema={schema}
				unionFieldRenderer={CustomUnion}
			/>
		);

		expect(screen.getByTestId("autoform-union")).toBeDefined();
	});
});
