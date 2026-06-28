import { z } from "zod";
import type { SchemaProvider } from "@code2-base-ui/auto-form";
import type { SchemaProviderFactory } from "@code2-base-ui/auto-form";
import type { FieldMeta, JsonSchema, ValidationResult } from "@code2-base-ui/json-schema-toolkit";
import { flatfields } from "@code2-base-ui/json-schema-toolkit";

function zodTypeToJsonType(schema: z.ZodType): string {
  if (schema instanceof z.ZodString) return "string";
  if (schema instanceof z.ZodNumber) return "number";
  if (schema instanceof z.ZodBoolean) return "boolean";
  if (schema instanceof z.ZodArray) return "array";
  return "unknown";
}

function unwrap(schema: z.ZodType): z.ZodType {
  if (schema instanceof z.ZodOptional) return unwrap(schema.unwrap() as unknown as z.ZodType);
  if (schema instanceof z.ZodNullable) return unwrap(schema.unwrap() as unknown as z.ZodType);
  if (schema instanceof z.ZodDefault) return unwrap(schema.unwrap() as unknown as z.ZodType);
  return schema;
}

function isOptional(schema: z.ZodType): boolean {
  return schema instanceof z.ZodOptional || schema instanceof z.ZodDefault;
}

function zodToJsonSchema(schema: z.ZodType): JsonSchema {
  if (schema instanceof z.ZodObject) {
    const shape = schema.shape as Record<string, z.ZodType>;
    const properties: Record<string, JsonSchema> = {};
    const required: string[] = [];

    for (const [key, fieldSchema] of Object.entries(shape)) {
      if (!isOptional(fieldSchema)) {
        required.push(key);
      }

      const inner = unwrap(fieldSchema);
      properties[key] = {
        type: zodTypeToJsonType(inner),
      };
    }

    return { type: "object", properties, required };
  }

  return { type: "object" };
}

export class ZodProvider<TSchema extends z.ZodType> implements SchemaProvider<TSchema> {
  readonly fields: FieldMeta[];
  readonly jsonSchema: JsonSchema;

  constructor(private schema: TSchema) {
    this.jsonSchema = zodToJsonSchema(schema);
    this.fields = flatfields(this.jsonSchema);
  }

  validate(data: unknown): ValidationResult {
    const result = this.schema.safeParse(data);
    if (result.success) {
      return { success: true, errors: [] };
    }

    return {
      success: false,
      errors: result.error.issues.map((issue) => ({
        path: issue.path.join("."),
        message: issue.message,
      })),
    };
  }

  getFieldMeta(path: string): FieldMeta | undefined {
    return this.fields.find((f) => f.path === path);
  }
}

export const zodProvider: SchemaProviderFactory = {
  name: "zod",
  create: <T>(schema: T) => new ZodProvider(schema as z.ZodType) as SchemaProvider<T>,
};
