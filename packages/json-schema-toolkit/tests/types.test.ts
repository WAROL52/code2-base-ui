import { describe, expectTypeOf, it } from "vitest";
import type {
	FieldComponent,
	FieldMeta,
	GroupCriteria,
	JsonSchema,
	RegistryEntry,
	RegistrySelector,
	ValidationError,
	ValidationResult,
} from "../src/types";

describe("core types", () => {
	it("JsonSchema allows standard properties", () => {
		const schema: JsonSchema = {
			type: "object",
			properties: {
				name: { type: "string" },
			},
			required: ["name"],
		};
		expectTypeOf(schema).toMatchTypeOf<JsonSchema>();
	});

	it("JsonSchema allows title property", () => {
		const schema: JsonSchema = {
			type: "string",
			title: "Full Name",
		};
		expectTypeOf(schema.title).toEqualTypeOf<string | undefined>();
	});

	it("JsonSchema allows additional properties", () => {
		const schema: JsonSchema = {
			type: "string",
			format: "email",
			description: "User email",
		};
		expectTypeOf(schema).toMatchTypeOf<JsonSchema>();
	});

	it("ValidationResult has success and errors", () => {
		const result: ValidationResult = { success: true, errors: [] };
		expectTypeOf(result.success).toBeBoolean();
		expectTypeOf(result.errors).toBeArray();
	});

	it("ValidationError has path and message", () => {
		const error: ValidationError = { path: "name", message: "Required" };
		expectTypeOf(error.path).toBeString();
		expectTypeOf(error.message).toBeString();
	});

	it("FieldMeta has required fields", () => {
		const meta: FieldMeta = {
			path: "user.name",
			type: "string",
			label: "User Name",
			format: "email",
			required: true,
			description: "User's full name",
		};
		expectTypeOf(meta.path).toBeString();
		expectTypeOf(meta.type).toBeString();
		expectTypeOf(meta.label).toBeString();
		expectTypeOf(meta.format).toEqualTypeOf<string | undefined>();
	});

	it("GroupCriteria accepts 'type' string", () => {
		const criteria: GroupCriteria = { by: "type" };
		expectTypeOf(criteria).toMatchTypeOf<GroupCriteria>();
	});

	it("GroupCriteria accepts a function", () => {
		const criteria: GroupCriteria = { by: (field: FieldMeta) => field.type };
		expectTypeOf(criteria).toMatchTypeOf<GroupCriteria>();
	});
});

describe("registry types", () => {
	it("RegistrySelector has optional fields", () => {
		const selector: RegistrySelector = { type: "string", format: "email" };
		expectTypeOf(selector.type).toEqualTypeOf<string | undefined>();
	});

	it("FieldComponent is a React component type", () => {
		const Comp: FieldComponent<{ label: string }> = (_props: {
			label: string;
		}) => null;
		expectTypeOf(Comp).toMatchTypeOf<FieldComponent<{ label: string }>>();
	});

	it("RegistryEntry has selector, component and priority", () => {
		const entry: RegistryEntry = {
			selector: { type: "string" },
			component: () => null,
			priority: 1,
		};
		expectTypeOf(entry.priority).toBeNumber();
	});
});
