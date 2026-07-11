// biome-ignore lint/style/noExportedImports: re-export for backward compat
import type { FieldError } from "../../src/adapters/types";
// biome-ignore lint/style/noExportedImports: need local binding for use below + re-export
import { createSchemaValidator } from "../../src/validate";

export type { FieldError };
export { createSchemaValidator };

// ── Test Schemas ───────────────────────────────────────────────

export const stringConstraintsSchema: Record<string, unknown> = {
	type: "object",
	properties: {
		username: { type: "string", minLength: 3, maxLength: 20 },
		bio: { type: "string", maxLength: 200 },
		zipCode: { type: "string", pattern: "^[0-9]{5}$" },
		email: { type: "string", format: "email" },
	},
	required: ["username", "email"],
};

export const numberConstraintsSchema: Record<string, unknown> = {
	type: "object",
	properties: {
		age: { type: "integer", minimum: 0, maximum: 150 },
		price: {
			type: "number",
			exclusiveMinimum: 0,
			exclusiveMaximum: 10_000,
		},
		score: { type: "number", multipleOf: 0.5 },
		quantity: { type: "integer", minimum: 1 },
	},
	required: ["age", "price"],
};

export const choiceSchema: Record<string, unknown> = {
	type: "object",
	properties: {
		agree: { type: "boolean" },
		role: {
			type: "string",
			enum: ["admin", "user", "moderator"],
		},
		status: { type: "integer", enum: [0, 1, 2] },
	},
	required: ["agree", "role"],
};

export const arrayConstraintsSchema: Record<string, unknown> = {
	type: "object",
	properties: {
		tags: {
			type: "array",
			items: { type: "string" },
			minItems: 1,
			maxItems: 5,
		},
		nums: {
			type: "array",
			items: { type: "number" },
			minItems: 1,
			uniqueItems: true,
		},
	},
	required: ["tags"],
};

export const widgetSchema: Record<string, unknown> = {
	type: "object",
	properties: {
		message: {
			type: "string",
			"x-ui-widget": "textarea",
			minLength: 10,
		},
		password: {
			type: "string",
			"x-ui-widget": "password",
			minLength: 8,
		},
		birth: { type: "string", format: "date" },
	},
	required: ["message", "password"],
};

export const mixedSchema: Record<string, unknown> = {
	type: "object",
	properties: {
		name: { type: "string", minLength: 2 },
		email: { type: "string", format: "email" },
		age: { type: "integer", minimum: 18, maximum: 120 },
		role: { type: "string", enum: ["admin", "user"] },
		tags: {
			type: "array",
			items: { type: "string" },
			minItems: 1,
		},
		agree: { type: "boolean" },
	},
	required: ["name", "email", "agree"],
};

// ── Pre-built validators ────────────────────────────────────────

export const validateStringConstraints = createSchemaValidator(
	stringConstraintsSchema
);
export const validateNumberConstraints = createSchemaValidator(
	numberConstraintsSchema
);
export const validateChoice = createSchemaValidator(choiceSchema);
export const validateArrayConstraints = createSchemaValidator(
	arrayConstraintsSchema
);
export const validateWidget = createSchemaValidator(widgetSchema);
export const validateMixed = createSchemaValidator(mixedSchema);
