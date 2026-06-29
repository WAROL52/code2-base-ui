// =============================================================================
// JSON Schema Toolkit — TypeBox Adapter
// Wrapper autour de @sinclair/typebox.
// =============================================================================

import type { TSchema } from "@sinclair/typebox";
import { TypeCompiler } from "@sinclair/typebox/compiler";
import { TObject } from "../../components";
import type { ValidationResult } from "../../core";
import type { SchemaAdapter } from "../index";

/**
 * Adapter pour TypeBox
 */
export const typeboxAdapter: SchemaAdapter<TSchema> = {
  name: "typebox",

  fromJsonSchema: (schema: object) => {
    // TypeBox accepte directement les objets JSON Schema conformes.
    return schema as TSchema;
  },

  toJsonSchema: (nativeSchema: TSchema) => {
    // TypeBox EST du JSON Schema.
    return nativeSchema as TSchema;
  },

  validate: (nativeSchema: TSchema, data: unknown): ValidationResult => {
    const check = TypeCompiler.Compile(nativeSchema);
    const isValid = check.Check(data);

    if (isValid) return { success: true };

    const errors = [...check.Errors(data)];
    return {
      success: false,
      errors: errors.map((err) => ({
        path: err.path.startsWith("/")
          ? err.path.slice(1).replace(/\//g, ".")
          : err.path,
        message: err.message,
        code: String(err.type),
      })),
    };
  },
};
