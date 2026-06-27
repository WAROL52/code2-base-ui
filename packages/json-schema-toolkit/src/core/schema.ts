import type { StandardSchemaV1 } from "@standard-schema/spec";
import { Type, type TSchema } from "@sinclair/typebox";
import { Value } from "@sinclair/typebox/value";
import type { JsonSchema, ValidationResult } from "../types";

type StandardIssue = {
	message?: string;
	path?: ReadonlyArray<{ key: string } | string>;
};

type StandardValidateResult<T> =
	| { value: T }
	| { issues: ReadonlyArray<StandardIssue> };

export type StandardSchema = TSchema & StandardSchemaV1;

function toStandardPath(tbPath: string): Array<{ key: string } | string> {
	if (!tbPath || tbPath === "") return [];
	return tbPath
		.split("/")
		.filter(Boolean)
		.map((segment) => ({ key: segment }));
}

function createStandardSchema<T extends TSchema>(schema: T): T & StandardSchemaV1 {
	const standard: StandardSchemaV1 = {
		"~standard": {
			version: 1,
			vendor: "code2-base-ui",
			validate(value: unknown): StandardValidateResult<unknown> {
				if (Value.Check(schema, value)) {
					return { value };
				}

				const issues: Array<StandardIssue> = [];
				for (const error of Value.Errors(schema, value)) {
					issues.push({
						message: error.message,
						path: toStandardPath(error.path),
					});
				}
				return { issues };
			},
		},
	};

	return { ...schema, ...standard } as T & StandardSchemaV1;
}

export function stringSchema(): StandardSchema {
	return createStandardSchema(Type.String()) as StandardSchema;
}

export function numberSchema(): StandardSchema {
	return createStandardSchema(Type.Number()) as StandardSchema;
}

export function objectSchema(properties: Record<string, TSchema>): StandardSchema {
	return createStandardSchema(Type.Object(properties)) as StandardSchema;
}

export function toJsonSchema(schema: TSchema): JsonSchema {
	return JSON.parse(JSON.stringify(schema));
}

export function validateSchema(
	schema: StandardSchema,
	data: unknown,
): ValidationResult {
	const result = schema["~standard"].validate(data);

	if (result instanceof Promise) {
		return {
			success: false,
			errors: [{ path: "", message: "Async validation not supported yet" }],
		};
	}

	if ("value" in result) {
		return { success: true, errors: [] };
	}

	return {
		success: false,
		errors: (result.issues ?? []).map((issue) => ({
			path: issue.path?.map((p) => (typeof p === "string" ? p : p.key)).join(".") ?? "",
			message: issue.message ?? "Validation error",
		})),
	};
}
