import type { FieldMeta } from "@code2-base-ui/json-schema-toolkit";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import {
	ShadcnBooleanField,
	ShadcnEnumField,
	ShadcnNumberField,
	ShadcnSwitchField,
	ShadcnTextareaField,
	ShadcnTextField,
} from "../../src/fields/field-components";
import { createShadcnRegistry } from "../../src/fields/index";

const baseField: FieldMeta = {
	kind: "primitive",
	label: "Name",
	path: "name",
	type: "string",
};

describe("ShadcnEnumField", () => {
	it("renders a select with enum options", () => {
		const { container } = render(
			<ShadcnEnumField
				field={{
					...baseField,
					kind: "enum",
					enum: ["a", "b", "c"],
				}}
				value=""
			/>
		);

		const select = container.querySelector('[role="combobox"]');
		expect(select).toBeTruthy();
	});

	it("calls onChange when a value is selected", () => {
		const onChange = vi.fn();
		const { container } = render(
			<ShadcnEnumField
				field={{
					...baseField,
					kind: "enum",
					enum: ["a", "b"],
				}}
				onChange={onChange}
				value=""
			/>
		);

		const selectTrigger = container.querySelector('[role="combobox"]');
		expect(selectTrigger).toBeTruthy();
	});
});

describe("ShadcnTextareaField", () => {
	it("renders a textarea", () => {
		const { container } = render(
			<ShadcnTextareaField field={baseField} value="" />
		);

		const textarea = container.querySelector("textarea");
		expect(textarea).toBeTruthy();
	});

	it("calls onChange when text is entered", () => {
		const onChange = vi.fn();
		render(
			<ShadcnTextareaField field={baseField} onChange={onChange} value="" />
		);

		const textarea = screen.getByRole("textbox");
		fireEvent.change(textarea, { target: { value: "hello" } });
		expect(onChange).toHaveBeenCalledWith("hello");
	});
});

describe("ShadcnTextField", () => {
	it("renders an input text by default", () => {
		const { container } = render(
			<ShadcnTextField field={baseField} value="" />
		);

		expect(container.querySelector('input[type="text"]')).toBeTruthy();
	});

	it("renders an input with the provided value", () => {
		render(<ShadcnTextField field={baseField} value="John" />);

		const input = screen.getByRole("textbox") as HTMLInputElement;
		expect(input.value).toBe("John");
	});

	it("calls onChange when the input changes", () => {
		const onChange = vi.fn();
		render(<ShadcnTextField field={baseField} onChange={onChange} value="" />);

		const input = screen.getByRole("textbox");
		fireEvent.change(input, { target: { value: "new" } });
		expect(onChange).toHaveBeenCalledWith("new");
	});

	it("renders label text", () => {
		render(<ShadcnTextField field={baseField} label="Full Name" value="" />);

		expect(screen.getByText("Full Name")).toBeTruthy();
	});

	it("displays error text", () => {
		render(
			<ShadcnTextField
				error="This field is required"
				field={baseField}
				value=""
			/>
		);

		expect(screen.getByText("This field is required")).toBeTruthy();
	});
});

describe("ShadcnNumberField", () => {
	it("renders an input type number", () => {
		const { container } = render(
			<ShadcnNumberField field={baseField} value={0} />
		);

		expect(container.querySelector('input[type="number"]')).toBeTruthy();
	});

	it("calls onChange with undefined when empty", () => {
		const onChange = vi.fn();
		render(
			<ShadcnNumberField field={baseField} onChange={onChange} value={0} />
		);

		const input = screen.getByRole("spinbutton");
		fireEvent.change(input, { target: { value: "" } });
		expect(onChange).toHaveBeenCalledWith(undefined);
	});

	it("calls onChange with a number when a value is entered", () => {
		const onChange = vi.fn();
		render(
			<ShadcnNumberField field={baseField} onChange={onChange} value={0} />
		);

		const input = screen.getByRole("spinbutton");
		fireEvent.change(input, { target: { value: "42" } });
		expect(onChange).toHaveBeenCalledWith(42);
	});
});

describe("ShadcnBooleanField", () => {
	it("renders a checkbox", () => {
		const { container } = render(
			<ShadcnBooleanField field={baseField} value={false} />
		);

		expect(container.querySelector('input[type="checkbox"]')).toBeTruthy();
	});
});

describe("ShadcnSwitchField", () => {
	it("renders a switch", () => {
		const { container } = render(
			<ShadcnSwitchField field={baseField} value={false} />
		);

		expect(container.querySelector('[role="switch"]')).toBeTruthy();
	});
});

describe("createShadcnRegistry", () => {
	it("returns a FieldRegistry with string, number, boolean, and fallback", () => {
		const registry = createShadcnRegistry();

		const stringField: FieldMeta = {
			kind: "primitive",
			label: "Text",
			path: "text",
			type: "string",
		};
		expect(registry.resolve(stringField)).toBe(ShadcnTextField);

		const enumField: FieldMeta = {
			kind: "enum",
			label: "Choice",
			path: "choice",
			type: "string",
			enum: ["a", "b"],
		};
		expect(registry.resolve(enumField)).toBe(ShadcnEnumField);

		const textareaField: FieldMeta = {
			kind: "primitive",
			label: "Bio",
			path: "bio",
			type: "string",
			uiWidget: "textarea",
		};
		expect(registry.resolve(textareaField)).toBe(ShadcnTextareaField);

		const numberField: FieldMeta = {
			kind: "primitive",
			label: "Age",
			path: "age",
			type: "number",
		};
		expect(registry.resolve(numberField)).toBe(ShadcnNumberField);

		const booleanField: FieldMeta = {
			kind: "primitive",
			label: "Active",
			path: "active",
			type: "boolean",
		};
		expect(registry.resolve(booleanField)).toBe(ShadcnBooleanField);

		const switchField: FieldMeta = {
			kind: "primitive",
			label: "Toggle",
			path: "toggle",
			type: "boolean",
			uiWidget: "switch",
		};
		expect(registry.resolve(switchField)).toBe(ShadcnSwitchField);
	});
});
