import type { FieldError } from "../../src/adapters/types";

const EMAIL_RE = /@/;

// ── Validator factory ──────────────────────────────────────────

type FieldSchema = Record<string, unknown>;

function getType(val: unknown): string {
	if (val === null) {
		return "null";
	}
	if (Array.isArray(val)) {
		return "array";
	}
	if (typeof val === "number" && Number.isInteger(val)) {
		return "integer";
	}
	return typeof val;
}

function isRequired(schema: Record<string, unknown>, field: string): boolean {
	const req = schema.required;
	return Array.isArray(req) && req.includes(field);
}

function isEmpty(val: unknown): boolean {
	return val === undefined || val === null || val === "";
}

function validateRequired(
	key: string,
	val: unknown,
	schema: Record<string, unknown>
): FieldError | undefined {
	if (isRequired(schema, key) && isEmpty(val)) {
		return { message: `${key} is required`, type: "required" };
	}
	return;
}

function validateString(
	key: string,
	val: unknown,
	fieldSchema: FieldSchema
): FieldError | undefined {
	const str = val as string;
	const minL = fieldSchema.minLength as number | undefined;
	const maxL = fieldSchema.maxLength as number | undefined;
	const pat = fieldSchema.pattern as string | undefined;
	const fmt = fieldSchema.format as string | undefined;

	if (minL !== undefined && str.length < minL) {
		return {
			message: `${key} must be at least ${minL} characters`,
			type: "minLength",
		};
	}
	if (maxL !== undefined && str.length > maxL) {
		return {
			message: `${key} must be at most ${maxL} characters`,
			type: "maxLength",
		};
	}
	if (pat !== undefined && !new RegExp(pat).test(str)) {
		return {
			message: `${key} does not match pattern`,
			type: "pattern",
		};
	}
	if (fmt === "email" && !EMAIL_RE.test(str)) {
		return {
			message: `${key} must be a valid email`,
			type: "format",
		};
	}
	return;
}

function validateNumber(
	key: string,
	val: unknown,
	fieldSchema: FieldSchema
): FieldError | undefined {
	const num = val as number;
	const min = fieldSchema.minimum as number | undefined;
	const max = fieldSchema.maximum as number | undefined;
	const exclMin = fieldSchema.exclusiveMinimum as number | undefined;
	const exclMax = fieldSchema.exclusiveMaximum as number | undefined;
	const mult = fieldSchema.multipleOf as number | undefined;

	if (min !== undefined && num < min) {
		return { message: `${key} must be at least ${min}`, type: "minimum" };
	}
	if (max !== undefined && num > max) {
		return { message: `${key} must be at most ${max}`, type: "maximum" };
	}
	if (exclMin !== undefined && num <= exclMin) {
		return {
			message: `${key} must be greater than ${exclMin}`,
			type: "exclusiveMinimum",
		};
	}
	if (exclMax !== undefined && num >= exclMax) {
		return {
			message: `${key} must be less than ${exclMax}`,
			type: "exclusiveMaximum",
		};
	}
	if (mult !== undefined && num % mult !== 0) {
		return {
			message: `${key} must be a multiple of ${mult}`,
			type: "multipleOf",
		};
	}
	return;
}

function validateArray(
	key: string,
	val: unknown,
	fieldSchema: FieldSchema
): FieldError | undefined {
	const arr = val as unknown[];
	const minItems = fieldSchema.minItems as number | undefined;
	const maxItems = fieldSchema.maxItems as number | undefined;
	const uniqueItems = fieldSchema.uniqueItems as boolean | undefined;

	if (minItems !== undefined && arr.length < minItems) {
		return {
			message: `${key} must have at least ${minItems} item(s)`,
			type: "minItems",
		};
	}
	if (maxItems !== undefined && arr.length > maxItems) {
		return {
			message: `${key} must have at most ${maxItems} item(s)`,
			type: "maxItems",
		};
	}
	if (uniqueItems && new Set(arr).size !== arr.length) {
		return {
			message: `${key} items must be unique`,
			type: "uniqueItems",
		};
	}
	return;
}

function validateEnum(
	key: string,
	val: unknown,
	fieldSchema: FieldSchema
): FieldError | undefined {
	const enumVals = fieldSchema.enum as unknown[] | undefined;
	if (enumVals !== undefined && !enumVals.includes(val)) {
		return {
			message: `${key} must be one of: ${enumVals.join(", ")}`,
			type: "enum",
		};
	}
	return;
}

function validateField(
	key: string,
	val: unknown,
	fieldSchema: FieldSchema,
	schema: Record<string, unknown>
): FieldError | undefined {
	const fieldType = (fieldSchema.type as string) ?? "string";

	const req = validateRequired(key, val, schema);
	if (req) {
		return req;
	}

	if (isEmpty(val)) {
		return;
	}

	if (fieldType !== getType(val)) {
		return { message: `${key} must be a ${fieldType}`, type: "type" };
	}

	const byType = (
		{
			string: validateString,
			number: validateNumber,
			integer: validateNumber,
			array: validateArray,
		} as Record<
			string,
			(k: string, v: unknown, fs: FieldSchema) => FieldError | undefined
		>
	)[fieldType];

	const typeError = byType?.(key, val, fieldSchema);
	if (typeError) {
		return typeError;
	}

	return validateEnum(key, val, fieldSchema);
}

export function createSchemaValidator(
	schema: Record<string, unknown>
): (values: Record<string, unknown>) => Record<string, FieldError | undefined> {
	const props = (schema.properties ?? {}) as Record<string, unknown>;

	return (values: Record<string, unknown>) => {
		const errors: Record<string, FieldError | undefined> = {};
		for (const key of Object.keys(props)) {
			const err = validateField(
				key,
				values[key],
				props[key] as FieldSchema,
				schema
			);
			if (err) {
				errors[key] = err;
			}
		}
		return errors;
	};
}

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
