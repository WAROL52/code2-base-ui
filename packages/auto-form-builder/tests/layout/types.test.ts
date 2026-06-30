import type { FieldMeta } from "@code2-base-ui/json-schema-toolkit";
import type React from "react";
import { describe, expectTypeOf, it } from "vitest";
import type { FormLayout } from "../../src/layout/types";

describe("FormLayout type shape", () => {
	it("has FieldSet component", () => {
		expectTypeOf<FormLayout["FieldSet"]>().toMatchTypeOf<
			React.ComponentType<{ children: React.ReactNode; className?: string }>
		>();
	});

	it("has FieldGroup component", () => {
		expectTypeOf<FormLayout["FieldGroup"]>().toMatchTypeOf<
			React.ComponentType<{ children: React.ReactNode }>
		>();
	});

	it("has FieldLegend component", () => {
		expectTypeOf<FormLayout["FieldLegend"]>().toMatchTypeOf<
			React.ComponentType<{ children: React.ReactNode; className?: string }>
		>();
	});

	it("has FieldDescription component", () => {
		expectTypeOf<FormLayout["FieldDescription"]>().toMatchTypeOf<
			React.ComponentType<{ children: React.ReactNode }>
		>();
	});

	it("has ObjectField component", () => {
		expectTypeOf<FormLayout["ObjectField"]>().toMatchTypeOf<
			React.ComponentType<{
				fieldMeta: FieldMeta;
				children: React.ReactNode;
			}>
		>();
	});

	it("has ArrayField component", () => {
		expectTypeOf<FormLayout["ArrayField"]>().toMatchTypeOf<
			React.ComponentType<{
				children: React.ReactNode[];
				fieldMeta: FieldMeta;
				onAdd: () => void;
				onRemove: (index: number) => void;
			}>
		>();
	});

	it("has CompositionsField component", () => {
		expectTypeOf<FormLayout["CompositionsField"]>().toMatchTypeOf<
			React.ComponentType<{
				children: React.ReactNode;
				fieldMeta: FieldMeta;
				onSelect: (index: number) => void;
				options: { label: string }[];
				selectedIndex: number;
			}>
		>();
	});

	it("has SubmitButton component", () => {
		expectTypeOf<FormLayout["SubmitButton"]>().toMatchTypeOf<
			React.ComponentType<{
				children?: React.ReactNode;
				disabled?: boolean;
				isSubmitting?: boolean;
			}>
		>();
	});
});
