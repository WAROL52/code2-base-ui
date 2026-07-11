import {
	getConstraints,
	validateConstraint,
} from "@code2-base-ui/json-schema-toolkit";
import type { FieldError } from "./adapters/types";

export function createSchemaValidator(
	schema: Record<string, unknown>
): (values: Record<string, unknown>) => Record<string, FieldError | undefined> {
	const props = (schema.properties ?? {}) as Record<string, unknown>;
	const required = Array.isArray(schema.required)
		? (schema.required as string[])
		: [];

	return (values: Record<string, unknown>) => {
		const errors: Record<string, FieldError | undefined> = {};
		for (const key of Object.keys(props)) {
			const fieldSchema = props[key] as Record<string, unknown>;
			const constraints = getConstraints(fieldSchema) ?? {};
			const isReq = required.includes(key);

			const err = validateConstraint(
				values[key],
				{ ...constraints, type: constraints.type ?? "string" },
				isReq
			);
			if (err) {
				errors[key] = err;
			}
		}
		return errors;
	};
}
