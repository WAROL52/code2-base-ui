import type { FieldMeta } from "@code2-base-ui/json-schema-toolkit";
import { render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { shadcnLayout } from "../../src/layout/shadcn";

describe("shadcnLayout", () => {
	it("renders ObjectField with label, description, and children", () => {
		const fieldMeta: FieldMeta = {
			path: "address",
			type: "object",
			label: "Address",
			description: "Your postal address",
			kind: "object",
			children: [],
		};
		const { container } = render(
			<shadcnLayout.ObjectField fieldMeta={fieldMeta}>
				<div data-testid="child" />
			</shadcnLayout.ObjectField>
		);
		expect(container.textContent).toContain("Address");
		expect(container.textContent).toContain("Your postal address");
		expect(container.querySelector("fieldset")).toBeTruthy();
	});

	it("renders ObjectField without label or description", () => {
		const fieldMeta: FieldMeta = {
			path: "inner",
			type: "object",
			label: "",
			kind: "object",
			children: [],
		};
		const { container } = render(
			<shadcnLayout.ObjectField fieldMeta={fieldMeta}>
				<span>content</span>
			</shadcnLayout.ObjectField>
		);
		expect(container.textContent).not.toContain("legend");
		expect(container.textContent).toContain("content");
	});

	it("renders ArrayField with items and add/remove buttons", () => {
		const onAdd = vi.fn();
		const onRemove = vi.fn();
		const fieldMeta: FieldMeta = {
			path: "tags",
			type: "array",
			label: "Tags",
			kind: "array",
			itemMeta: {
				path: "tags[]",
				name: "item",
				type: "string",
				label: "Tag",
				kind: "primitive",
			},
		};
		const { container } = render(
			<shadcnLayout.ArrayField
				fieldMeta={fieldMeta}
				onAdd={onAdd}
				onRemove={onRemove}
			>
				{[<span key="0">hello</span>, <span key="1">world</span>]}
			</shadcnLayout.ArrayField>
		);
		expect(container.textContent).toContain("Tags");
		expect(container.textContent).toContain("hello");
		expect(container.textContent).toContain("world");

		const buttons = container.querySelectorAll("button");
		expect(buttons).toHaveLength(3);

		const addBtn = buttons[2] as HTMLButtonElement;
		addBtn.click();
		expect(onAdd).toHaveBeenCalledOnce();

		const removeBtn0 = buttons[0] as HTMLButtonElement;
		removeBtn0.click();
		expect(onRemove).toHaveBeenCalledWith(0);
	});

	it("renders CompositionsField with variant selector", () => {
		const onSelect = vi.fn();
		const fieldMeta: FieldMeta = {
			path: "contact",
			type: "object",
			label: "Contact",
			kind: "union",
			variants: [
				{
					label: "Email",
					meta: {
						path: "",
						type: "object",
						label: "Email",
						kind: "object",
						children: [],
					},
					children: [],
				},
				{
					label: "Phone",
					meta: {
						path: "",
						type: "object",
						label: "Phone",
						kind: "object",
						children: [],
					},
					children: [],
				},
			],
		};
		const { container } = render(
			<shadcnLayout.CompositionsField
				fieldMeta={fieldMeta}
				onSelect={onSelect}
				options={[{ label: "Email" }, { label: "Phone" }]}
				selectedIndex={0}
			>
				<span data-testid="variant-content">content</span>
			</shadcnLayout.CompositionsField>
		);
		expect(container.textContent).toContain("Contact");
		expect(container.textContent).toContain("Email");
		expect(container.textContent).toContain("Phone");
		expect(container.textContent).toContain("content");

		const buttons = container.querySelectorAll("button");
		expect(buttons).toHaveLength(2);

		(buttons[1] as HTMLButtonElement).click();
		expect(onSelect).toHaveBeenCalledWith(1);
	});

	it("renders CompositionsField without variants (empty options)", () => {
		const onSelect = vi.fn();
		const fieldMeta: FieldMeta = {
			path: "empty",
			type: "object",
			kind: "union",
			label: "",
			variants: [],
		};
		const { container } = render(
			<shadcnLayout.CompositionsField
				fieldMeta={fieldMeta}
				onSelect={onSelect}
				options={[]}
				selectedIndex={0}
			>
				<span>no variants</span>
			</shadcnLayout.CompositionsField>
		);
		expect(container.textContent).toContain("no variants");
	});

	it("renders CompositionsField with description", () => {
		const onSelect = vi.fn();
		const fieldMeta: FieldMeta = {
			path: "contact",
			type: "object",
			label: "Contact",
			description: "Choose your contact method",
			kind: "union",
			variants: [
				{
					label: "Email",
					meta: {
						path: "",
						type: "object",
						label: "Email",
						kind: "object",
						children: [],
					},
					children: [],
				},
			],
		};
		const { container } = render(
			<shadcnLayout.CompositionsField
				fieldMeta={fieldMeta}
				onSelect={onSelect}
				options={[{ label: "Email" }]}
				selectedIndex={0}
			>
				<span>content</span>
			</shadcnLayout.CompositionsField>
		);
		expect(container.textContent).toContain("Choose your contact method");
	});

	it("renders ArrayField with empty items", () => {
		const onAdd = vi.fn();
		const onRemove = vi.fn();
		const fieldMeta: FieldMeta = {
			path: "empty",
			type: "array",
			label: "Empty",
			kind: "array",
		};
		const { container } = render(
			<shadcnLayout.ArrayField
				fieldMeta={fieldMeta}
				onAdd={onAdd}
				onRemove={onRemove}
			>
				{[]}
			</shadcnLayout.ArrayField>
		);
		expect(container.textContent).toContain("Empty");
		expect(container.querySelector("button")).toBeTruthy();
	});

	it("renders ArrayField with description", () => {
		const onAdd = vi.fn();
		const onRemove = vi.fn();
		const fieldMeta: FieldMeta = {
			path: "tags",
			type: "array",
			label: "Tags",
			description: "Add your tags",
			kind: "array",
			itemMeta: {
				path: "tags[]",
				name: "item",
				type: "string",
				label: "Tag",
				kind: "primitive",
			},
		};
		const { container } = render(
			<shadcnLayout.ArrayField
				fieldMeta={fieldMeta}
				onAdd={onAdd}
				onRemove={onRemove}
			>
				{[]}
			</shadcnLayout.ArrayField>
		);
		expect(container.textContent).toContain("Add your tags");
	});

	it("renders SubmitButton with default text", () => {
		const { container } = render(<shadcnLayout.SubmitButton />);
		const btn = container.querySelector("button[type='submit']");
		expect(btn).toBeTruthy();
		expect(btn?.textContent).toBe("Envoyer");
	});

	it("renders SubmitButton with custom children", () => {
		const { container } = render(
			<shadcnLayout.SubmitButton>Save</shadcnLayout.SubmitButton>
		);
		expect(container.querySelector("button")?.textContent).toBe("Save");
	});
});
