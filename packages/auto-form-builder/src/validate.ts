import type { FieldError } from "./adapters/types";

const EMAIL_RE = /@/;

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

	const valType = getType(val);
	if (
		fieldType !== valType &&
		!(fieldType === "number" && valType === "integer")
	) {
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
