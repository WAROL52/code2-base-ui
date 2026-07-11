import { describe, expect, it } from "vitest";
import type { FieldError } from "../src/adapters/types";

function getErrorType(error: FieldError | undefined): string | undefined {
	if (!error) {
		return;
	}
	if (typeof error === "string") {
		return error;
	}
	return error.type;
}

// ── Main entry ───────────────────────────────────────────────────

describe("@code2-base-ui/auto-form-builder", () => {
	it("exports createAutoForm", async () => {
		const mod = await import("../src/index");
		expect(mod.createAutoForm).toBeDefined();
		expect(typeof mod.createAutoForm).toBe("function");
	}, 15_000);

	it("exports AutoFormBuilder", async () => {
		const mod = await import("../src/index");
		expect(mod.AutoFormBuilder).toBeDefined();
		expect(typeof mod.AutoFormBuilder).toBe("function");
	});

	it("exports AutoFormField", async () => {
		const mod = await import("../src/index");
		expect(mod.AutoFormField).toBeDefined();
		expect(typeof mod.AutoFormField).toBe("function");
	});

	it("exports createShadcnRegistry", async () => {
		const mod = await import("../src/index");
		expect(mod.createShadcnRegistry).toBeDefined();
		expect(typeof mod.createShadcnRegistry).toBe("function");
	});

	it("exports shadcnLayout", async () => {
		const mod = await import("../src/index");
		expect(mod.shadcnLayout).toBeDefined();
		expect(typeof mod.shadcnLayout).toBe("object");
		expect(mod.shadcnLayout.FieldSet).toBeDefined();
		expect(mod.shadcnLayout.FieldGroup).toBeDefined();
		expect(mod.shadcnLayout.FieldLegend).toBeDefined();
		expect(mod.shadcnLayout.FieldDescription).toBeDefined();
		expect(mod.shadcnLayout.ObjectField).toBeDefined();
		expect(mod.shadcnLayout.ArrayField).toBeDefined();
		expect(mod.shadcnLayout.CompositionsField).toBeDefined();
		expect(mod.shadcnLayout.SubmitButton).toBeDefined();
	});

	it("exports createSchemaValidator", async () => {
		const mod = await import("../src/index");
		expect(mod.createSchemaValidator).toBeDefined();
		expect(typeof mod.createSchemaValidator).toBe("function");
	});

	it("exports ShadcnDateField", async () => {
		const mod = await import("../src/index");
		expect(mod.ShadcnDateField).toBeDefined();
	});

	it("exports ShadcnPasswordField", async () => {
		const mod = await import("../src/index");
		expect(mod.ShadcnPasswordField).toBeDefined();
	});

	it("exports adapter values", async () => {
		const mod = await import("../src/index");
		expect(mod.tanstackAdapter).toBeDefined();
		expect(typeof mod.tanstackAdapter).toBe("object");
		expect(mod.tanstackAdapter.name).toBe("tanstack");

		expect(mod.rhfAdapter).toBeDefined();
		expect(typeof mod.rhfAdapter).toBe("object");
		expect(mod.rhfAdapter.name).toBe("rhf");

		expect(mod.formischAdapter).toBeDefined();
		expect(typeof mod.formischAdapter).toBe("object");
		expect(mod.formischAdapter.name).toBe("formisch");
	});

	it("exports adapter types", async () => {
		// Types-only: verify the module can be loaded
		const mod = await import("../src/adapters/types");
		// No runtime values, just ensure the file compiles
		expect(mod).toBeDefined();
	});

	it("exports FormAdapter type shape at runtime via adapter objects", async () => {
		const mod = await import("../src/index");
		const adapter = mod.tanstackAdapter;

		expect(adapter).toHaveProperty("name");
		expect(typeof adapter.name).toBe("string");

		expect(adapter).toHaveProperty("FormProvider");
		expect(typeof adapter.FormProvider).toBe("function");

		expect(adapter).toHaveProperty("Field");
		expect(typeof adapter.Field).toBe("function");
	});
});

// ── Sub-path: ./adapters ─────────────────────────────────────────

describe("@code2-base-ui/auto-form-builder/adapters", () => {
	it("re-exports all adapters and types", async () => {
		const mod = await import("../src/adapters/index");
		expect(mod.tanstackAdapter).toBeDefined();
		expect(mod.rhfAdapter).toBeDefined();
		expect(mod.formischAdapter).toBeDefined();
	});
});

// ── Sub-path: ./adapters/tanstack ────────────────────────────────

describe("@code2-base-ui/auto-form-builder/adapters/tanstack", () => {
	it("exports tanstackAdapter", async () => {
		const mod = await import("../src/adapters/tanstack");
		expect(mod.tanstackAdapter).toBeDefined();
		expect(mod.tanstackAdapter.name).toBe("tanstack");
	});
});

// ── Sub-path: ./adapters/rhf ─────────────────────────────────────

describe("@code2-base-ui/auto-form-builder/adapters/rhf", () => {
	it("exports rhfAdapter", async () => {
		const mod = await import("../src/adapters/rhf");
		expect(mod.rhfAdapter).toBeDefined();
		expect(mod.rhfAdapter.name).toBe("rhf");
	});
});

// ── Sub-path: ./adapters/formisch ────────────────────────────────

describe("@code2-base-ui/auto-form-builder/adapters/formisch", () => {
	it("exports formischAdapter", async () => {
		const mod = await import("../src/adapters/formisch");
		expect(mod.formischAdapter).toBeDefined();
		expect(mod.formischAdapter.name).toBe("formisch");
	});
});

// ── Sub-path: ./fields ───────────────────────────────────────────

describe("@code2-base-ui/auto-form-builder/fields", () => {
	it("exports createShadcnRegistry", async () => {
		const mod = await import("../src/fields/index");
		expect(mod.createShadcnRegistry).toBeDefined();
		expect(typeof mod.createShadcnRegistry).toBe("function");

		const registry = mod.createShadcnRegistry();
		expect(registry).toBeDefined();
		expect(typeof registry.resolve).toBe("function");
		expect(typeof registry.register).toBe("function");
	});

	it("exports all Shadcn*Field components", async () => {
		const mod = await import("../src/fields/index");
		const fieldComponents = [
			"ShadcnTextField",
			"ShadcnPasswordField",
			"ShadcnTextareaField",
			"ShadcnEnumField",
			"ShadcnNumberField",
			"ShadcnBooleanField",
			"ShadcnSwitchField",
			"ShadcnDateField",
		] as const;

		for (const name of fieldComponents) {
			expect(mod[name as keyof typeof mod]).toBeDefined();
			expect(typeof mod[name as keyof typeof mod]).toBe("function");
		}
	});
});

// ── Sub-path: ./layout ───────────────────────────────────────────

describe("@code2-base-ui/auto-form-builder/layout", () => {
	it("exports shadcnLayout and FormLayout type", async () => {
		const mod = await import("../src/layout/index");
		expect(mod.shadcnLayout).toBeDefined();
		expect(mod.shadcnLayout.FieldSet).toBeDefined();
		expect(mod.shadcnLayout.FieldGroup).toBeDefined();
		expect(mod.shadcnLayout.FieldLegend).toBeDefined();
		expect(mod.shadcnLayout.FieldDescription).toBeDefined();
		expect(mod.shadcnLayout.ObjectField).toBeDefined();
		expect(mod.shadcnLayout.ArrayField).toBeDefined();
		expect(mod.shadcnLayout.CompositionsField).toBeDefined();
		expect(mod.shadcnLayout.SubmitButton).toBeDefined();
	});
});

// ── Sub-path: ./testing ──────────────────────────────────────────

describe("@code2-base-ui/auto-form-builder/testing", () => {
	it("exports mockAdapter", async () => {
		const mod = await import("../src/testing");
		expect(mod.mockAdapter).toBeDefined();
	});

	it("exports createMockAdapterWithValidation", async () => {
		const mod = await import("../src/testing");
		expect(mod.createMockAdapterWithValidation).toBeDefined();
		expect(typeof mod.createMockAdapterWithValidation).toBe("function");
	});
});

// ── Sub-path: ./validate ─────────────────────────────────────────

describe("@code2-base-ui/auto-form-builder/validate", () => {
	it("exports createSchemaValidator", async () => {
		const mod = await import("../src/validate");
		expect(mod.createSchemaValidator).toBeDefined();
		expect(typeof mod.createSchemaValidator).toBe("function");

		const validate = mod.createSchemaValidator({
			type: "object",
			properties: { name: { type: "string" } },
			required: ["name"],
		});
		expect(typeof validate).toBe("function");
	});
});

// ── Runtime integration: createShadcnRegistry resolution ─────────

describe("createShadcnRegistry resolution", () => {
	it("resolves string primitive to ShadcnTextField", async () => {
		const { createShadcnRegistry, ShadcnTextField } = await import(
			"../src/fields/index"
		);
		const registry = createShadcnRegistry();
		const resolved = registry.resolve({
			kind: "primitive",
			label: "Name",
			path: "name",
			type: "string",
		});
		expect(resolved).toBe(ShadcnTextField);
	});

	it("resolves number to ShadcnNumberField", async () => {
		const { createShadcnRegistry, ShadcnNumberField } = await import(
			"../src/fields/index"
		);
		const registry = createShadcnRegistry();
		const resolved = registry.resolve({
			kind: "primitive",
			label: "Age",
			path: "age",
			type: "number",
		});
		expect(resolved).toBe(ShadcnNumberField);
	});

	it("resolves enum to ShadcnEnumField", async () => {
		const { createShadcnRegistry, ShadcnEnumField } = await import(
			"../src/fields/index"
		);
		const registry = createShadcnRegistry();
		const resolved = registry.resolve({
			kind: "enum",
			label: "Role",
			path: "role",
			type: "string",
			enum: ["a", "b"],
		});
		expect(resolved).toBe(ShadcnEnumField);
	});

	it("resolves textarea widget to ShadcnTextareaField", async () => {
		const { createShadcnRegistry, ShadcnTextareaField } = await import(
			"../src/fields/index"
		);
		const registry = createShadcnRegistry();
		const resolved = registry.resolve({
			kind: "primitive",
			label: "Bio",
			path: "bio",
			type: "string",
			uiWidget: "textarea",
		});
		expect(resolved).toBe(ShadcnTextareaField);
	});

	it("resolves password widget to ShadcnPasswordField", async () => {
		const { createShadcnRegistry, ShadcnPasswordField } = await import(
			"../src/fields/index"
		);
		const registry = createShadcnRegistry();
		const resolved = registry.resolve({
			kind: "primitive",
			label: "Password",
			path: "pwd",
			type: "string",
			uiWidget: "password",
		});
		expect(resolved).toBe(ShadcnPasswordField);
	});

	it("resolves date format to ShadcnDateField", async () => {
		const { createShadcnRegistry, ShadcnDateField } = await import(
			"../src/fields/index"
		);
		const registry = createShadcnRegistry();
		const resolved = registry.resolve({
			kind: "primitive",
			label: "Birth",
			path: "birth",
			type: "string",
			format: "date",
		});
		expect(resolved).toBe(ShadcnDateField);
	});

	it("resolves boolean to ShadcnBooleanField", async () => {
		const { createShadcnRegistry, ShadcnBooleanField } = await import(
			"../src/fields/index"
		);
		const registry = createShadcnRegistry();
		const resolved = registry.resolve({
			kind: "primitive",
			label: "Active",
			path: "active",
			type: "boolean",
		});
		expect(resolved).toBe(ShadcnBooleanField);
	});

	it("resolves boolean switch to ShadcnSwitchField", async () => {
		const { createShadcnRegistry, ShadcnSwitchField } = await import(
			"../src/fields/index"
		);
		const registry = createShadcnRegistry();
		const resolved = registry.resolve({
			kind: "primitive",
			label: "Toggle",
			path: "toggle",
			type: "boolean",
			uiWidget: "switch",
		});
		expect(resolved).toBe(ShadcnSwitchField);
	});
});

// ── Runtime integration: createSchemaValidator ───────────────────

describe("createSchemaValidator", () => {
	it("validates required fields", async () => {
		const { createSchemaValidator } = await import("../src/index");
		const validate = createSchemaValidator({
			type: "object",
			properties: { name: { type: "string" } },
			required: ["name"],
		});

		// valid value
		const result = validate({ name: "John" });
		expect(result?.name).toBeUndefined();

		// missing required field
		const result2 = validate({});
		expect(result2?.name).toBeDefined();
		expect(getErrorType(result2?.name)).toBe("required");
	});

	it("validates minLength", async () => {
		const { createSchemaValidator } = await import("../src/index");
		const validate = createSchemaValidator({
			type: "object",
			properties: {
				name: { type: "string", minLength: 3 },
			},
		});
		const result = validate({ name: "ab" });
		expect(result?.name).toBeDefined();
	});
});
