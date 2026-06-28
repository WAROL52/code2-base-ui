import { z } from "zod";
import type { SchemaProvider } from "@code2-base-ui/auto-form";
import type { SchemaProviderFactory } from "@code2-base-ui/auto-form";
import type { FieldMeta, JsonSchema, ValidationResult } from "@code2-base-ui/json-schema-toolkit";
import { flatfields } from "@code2-base-ui/json-schema-toolkit";

export class ZodProvider<TSchema extends z.ZodType> implements SchemaProvider<TSchema> {
  readonly fields: FieldMeta[];
  readonly jsonSchema: JsonSchema;

  constructor(private schema: TSchema) {
    this.jsonSchema = z.toJSONSchema(schema) as unknown as JsonSchema;
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
