import type { FieldMeta } from "@code2-base-ui/json-schema-toolkit";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import {
	ShadcnBooleanField,
	ShadcnInputField,
	ShadcnNumberField,
} from "../../src/fields/field-components";
import { createShadcnRegistry } from "../../src/fields/index";

describe("ShadcnInputField", () => {
	const baseField: FieldMeta = {
		path: "name",
		type: "string",
		label: "Name",
		kind: "primitive",
	};

	it("renders an input text by default", () => {
		render(<ShadcnInputField field={baseField} value="" />);

		const input = screen.getByRole("textbox");
		expect(input).toBeDefined();
	});

	it("renders an input with the provided value", () => {
		render(<ShadcnInputField field={baseField} value="John" />);

		const input = screen.getByRole("textbox") as HTMLInputElement;
		expect(input.value).toBe("John");
	});

	it("calls onChange when the input changes", () => {
		const onChange = vi.fn();
		render(<ShadcnInputField field={baseField} onChange={onChange} value="" />);

		const input = screen.getByRole("textbox");
		fireEvent.change(input, { target: { value: "new" } });
		expect(onChange).toHaveBeenCalledWith("new");
	});

	it("renders label text", () => {
		render(<ShadcnInputField field={baseField} label="Full Name" value="" />);

		expect(screen.getByText("Full Name")).toBeDefined();
	});

	it("renders a select when field has enum values", () => {
		const enumField: FieldMeta = {
			...baseField,
			enum: ["a", "b", "c"],
		};
		render(<ShadcnInputField field={enumField} value="" />);

		expect(screen.getByRole("combobox")).toBeDefined();
	});

	it("renders a textarea when format is textarea", () => {
		const textareaField: FieldMeta = {
			...baseField,
			format: "textarea",
		};
		const { container } = render(
			<ShadcnInputField field={textareaField} value="" />,
		);

		expect(container.querySelector("textarea")).toBeTruthy();
	});

	it("renders a textarea when uiWidget is textarea", () => {
		const textareaField: FieldMeta = {
			...baseField,
			uiWidget: "textarea",
		};
		const { container } = render(
			<ShadcnInputField field={textareaField} value="" />,
		);

		expect(container.querySelector("textarea")).toBeTruthy();
	});

	it("displays error text", () => {
		render(
			<ShadcnInputField
				field={baseField}
				value=""
				error="This field is required"
			/>,
		);

		expect(screen.getByText("This field is required")).toBeDefined();
	});
});

describe("ShadcnNumberField", () => {
	const baseField: FieldMeta = {
		path: "age",
		type: "number",
		label: "Age",
		kind: "primitive",
	};

	it("renders an input type number", () => {
		const { container } = render(
			<ShadcnNumberField field={baseField} value={0} />,
		);

		const input = container.querySelector('input[type="number"]');
		expect(input).toBeTruthy();
	});

	it("calls onChange with undefined when empty", () => {
		const onChange = vi.fn();
		render(<ShadcnNumberField field={baseField} onChange={onChange} value={0} />);

		const input = screen.getByRole("spinbutton");
		fireEvent.change(input, { target: { value: "" } });
		expect(onChange).toHaveBeenCalledWith(undefined);
	});

	it("calls onChange with a number when a value is entered", () => {
		const onChange = vi.fn();
		render(<ShadcnNumberField field={baseField} onChange={onChange} value={0} />);

		const input = screen.getByRole("spinbutton");
		fireEvent.change(input, { target: { value: "42" } });
		expect(onChange).toHaveBeenCalledWith(42);
	});
});

describe("ShadcnBooleanField", () => {
	const baseField: FieldMeta = {
		path: "active",
		type: "boolean",
		label: "Active",
		kind: "primitive",
	};

	it("renders a checkbox by default", () => {
		const { container } = render(
			<ShadcnBooleanField field={baseField} value={false} />,
		);

		const checkbox = container.querySelector('input[type="checkbox"]');
		expect(checkbox).toBeTruthy();
	});

	it("renders a switch when uiWidget is switch", () => {
		const switchField: FieldMeta = {
			...baseField,
			uiWidget: "switch",
		};
		const { container } = render(
			<ShadcnBooleanField field={switchField} value={false} />,
		);

		expect(container.querySelector('[role="switch"]')).toBeTruthy();
	});

	it("calls onChange when checkbox is clicked", () => {
		const onChange = vi.fn();
		const { container } = render(
			<ShadcnBooleanField field={baseField} onChange={onChange} value={false} />,
		);

		const checkbox = container.querySelector('input[type="checkbox"]');
		expect(checkbox).toBeTruthy();
	});
});

describe("createShadcnRegistry", () => {
	it("returns a FieldRegistry with string, number, boolean, and fallback", () => {
		const registry = createShadcnRegistry();

		const stringField: FieldMeta = {
			path: "name",
			type: "string",
			label: "Name",
			kind: "primitive",
		};
		const stringComponent = registry.resolve(stringField);
		expect(stringComponent).toBe(ShadcnInputField);

		const numberField: FieldMeta = {
			path: "age",
			type: "number",
			label: "Age",
			kind: "primitive",
		};
		const numberComponent = registry.resolve(numberField);
		expect(numberComponent).toBe(ShadcnNumberField);

		const booleanField: FieldMeta = {
			path: "active",
			type: "boolean",
			label: "Active",
			kind: "primitive",
		};
		const booleanComponent = registry.resolve(booleanField);
		expect(booleanComponent).toBe(ShadcnBooleanField);

		const unknownField: FieldMeta = {
			path: "unknown",
			type: "unknown",
			label: "Unknown",
			kind: "primitive",
		};
		const fallbackComponent = registry.resolve(unknownField);
		expect(fallbackComponent).toBe(ShadcnInputField);
	});
});
