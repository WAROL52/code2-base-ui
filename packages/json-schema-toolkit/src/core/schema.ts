import type { StandardSchemaV1 } from "@standard-schema/spec";
import { Type, type TSchema } from "@sinclair/typebox";
import { Value } from "@sinclair/typebox/value";
import type { JsonSchema, ValidationResult } from "../types";

function toStandardPath(tbPath: string): Array<{ key: string } | string> {
  if (!tbPath || tbPath === "") return [];
  return tbPath
    .split("/")
    .filter(Boolean)
    .map((segment) => ({ key: segment }));
}

type TStandardSchema = TSchema & StandardSchemaV1;

function createStandardSchema<T extends TSchema>(schema: T): TStandardSchema {
  return {
    ...schema,
    "~standard": {
      version: 1,
      vendor: "code2-base-ui",
      validate(value: unknown) {
        if (Value.Check(schema as TSchema, value)) {
          return { value };
        }

        const issues: Array<{ message: string; path: Array<{ key: string } | string> }> = [];
        for (const error of Value.Errors(schema as TSchema, value)) {
          issues.push({
            message: error.message,
            path: toStandardPath(error.path),
          });
        }
        return { issues };
      },
    },
  } as unknown as TStandardSchema;
}

function stringSchema(): TStandardSchema {
  return createStandardSchema(Type.String());
}

function numberSchema(): TStandardSchema {
  return createStandardSchema(Type.Number());
}

function objectSchema(properties: Record<string, TStandardSchema>): TStandardSchema {
  return createStandardSchema(Type.Object(properties));
}

function toJsonSchema(schema: TStandardSchema): JsonSchema {
  const rawJson = schema as unknown;
  return rawJson as JsonSchema;
}

type ValidateResult = {
  value?: unknown;
  issues?: Array<{ message: string; path: Array<{ key: string } | string> }>;
};

function validateSchema(
  schema: TStandardSchema,
  data: unknown,
): ValidationResult {
  const result = schema["~standard"].validate(data) as ValidateResult;

  if (!result.issues || result.issues.length === 0) {
    return { success: true, errors: [] };
  }

  return {
    success: false,
    errors: result.issues.map(
      (issue) => ({
        path: issue.path?.map((p) => (typeof p === "string" ? p : p.key)).join(".") ?? "",
        message: issue.message ?? "Validation error",
      }),
    ),
  };
}

export {
  createStandardSchema,
  type TStandardSchema as StandardSchema,
  stringSchema,
  numberSchema,
  objectSchema,
  toJsonSchema,
  validateSchema,
};

/**
 * @deprecated Use stringSchema() instead
 */
export { stringSchema as string };

/**
 * @deprecated Use numberSchema() instead
 */
export { numberSchema as number };

/**
 * @deprecated Use objectSchema() instead
 */
export { objectSchema as object };