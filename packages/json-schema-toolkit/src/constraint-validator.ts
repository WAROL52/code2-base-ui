import { enMessages } from "./i18n";
import type { FieldConstraints, I18nMessages } from "./types";

const EMAIL_RE = /@/;

export function isEmpty(val: unknown): boolean {
	return val === undefined || val === null || val === "";
}

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

export function validateConstraint(
	value: unknown,
	constraints: FieldConstraints,
	required: boolean,
	messages: I18nMessages = enMessages
): { message: string; type: string } | undefined {
	if (required && isEmpty(value)) {
		return { message: messages.required, type: "required" };
	}
	if (isEmpty(value)) {
		return;
	}

	const valType = getType(value);

	if (
		constraints.type &&
		valType !== constraints.type &&
		!(constraints.type === "number" && valType === "integer")
	) {
		return { message: messages.invalidType(constraints.type), type: "type" };
	}

	if (constraints.type === "string" && typeof value === "string") {
		const err = validateStringConstraints(value, constraints, messages);
		if (err) {
			return err;
		}
	}

	if (
		constraints.type &&
		["number", "integer"].includes(constraints.type) &&
		typeof value === "number"
	) {
		const err = validateNumberConstraints(value, constraints, messages);
		if (err) {
			return err;
		}
	}

	if (constraints.type === "array" && Array.isArray(value)) {
		const err = validateArrayConstraints(value, constraints, messages);
		if (err) {
			return err;
		}
	}

	if (constraints.enum !== undefined && !constraints.enum.includes(value)) {
		return {
			message: messages.invalidEnum(constraints.enum),
			type: "enum",
		};
	}
}

function validateStringConstraints(
	str: string,
	constraints: FieldConstraints,
	messages: I18nMessages
): { message: string; type: string } | undefined {
	if (
		constraints.minLength !== undefined &&
		str.length < constraints.minLength
	) {
		return {
			message: messages.minLength(constraints.minLength),
			type: "minLength",
		};
	}
	if (
		constraints.maxLength !== undefined &&
		str.length > constraints.maxLength
	) {
		return {
			message: messages.maxLength(constraints.maxLength),
			type: "maxLength",
		};
	}
	if (
		constraints.pattern !== undefined &&
		!new RegExp(constraints.pattern).test(str)
	) {
		return {
			message: messages.pattern(constraints.pattern),
			type: "pattern",
		};
	}
	if (constraints.format === "email" && !EMAIL_RE.test(str)) {
		return { message: messages.invalidFormat("email"), type: "format" };
	}
}

function validateNumberConstraints(
	num: number,
	constraints: FieldConstraints,
	messages: I18nMessages
): { message: string; type: string } | undefined {
	if (constraints.minimum !== undefined && num < constraints.minimum) {
		return {
			message: messages.minimum(constraints.minimum),
			type: "minimum",
		};
	}
	if (constraints.maximum !== undefined && num > constraints.maximum) {
		return {
			message: messages.maximum(constraints.maximum),
			type: "maximum",
		};
	}
	if (
		constraints.exclusiveMinimum !== undefined &&
		num <= constraints.exclusiveMinimum
	) {
		return {
			message: messages.exclusiveMinimum(constraints.exclusiveMinimum),
			type: "exclusiveMinimum",
		};
	}
	if (
		constraints.exclusiveMaximum !== undefined &&
		num >= constraints.exclusiveMaximum
	) {
		return {
			message: messages.exclusiveMaximum(constraints.exclusiveMaximum),
			type: "exclusiveMaximum",
		};
	}
	if (
		constraints.multipleOf !== undefined &&
		num % constraints.multipleOf !== 0
	) {
		return {
			message: messages.multipleOf(constraints.multipleOf),
			type: "multipleOf",
		};
	}
}

function validateArrayConstraints(
	arr: unknown[],
	constraints: FieldConstraints,
	messages: I18nMessages
): { message: string; type: string } | undefined {
	if (constraints.minItems !== undefined && arr.length < constraints.minItems) {
		return {
			message: messages.minItems(constraints.minItems),
			type: "minItems",
		};
	}
	if (constraints.maxItems !== undefined && arr.length > constraints.maxItems) {
		return {
			message: messages.maxItems(constraints.maxItems),
			type: "maxItems",
		};
	}
	if (constraints.uniqueItems && new Set(arr).size !== arr.length) {
		return { message: messages.uniqueItems, type: "uniqueItems" };
	}
}
