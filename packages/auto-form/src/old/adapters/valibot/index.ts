// =============================================================================
// JSON Schema Toolkit — Valibot Adapter
// Wrapper autour de valibot et @valibot/to-json-schema.
// =============================================================================

import { toJsonSchema } from "@valibot/to-json-schema";
import * as v from "valibot";
import { TObject } from "../../components";
import type { JsonSchema, ValidationResult } from "../../core";
import type { SchemaAdapter } from "../index";

/**
 * Formate les erreurs Valibot (ValiError) en ValidationResult normalisé.
 */
export function formatValibotError(
  issues: [v.BaseIssue<unknown>, ...v.BaseIssue<unknown>[]],
): ValidationResult {
  return {
    success: false,
    errors: issues.map((issue) => ({
      path: issue.path?.map((p) => p.key).join(".") ?? "",
      message: issue.message,
      code: issue.type,
    })),
  };
}

/**
 * Adapter pour Valibot
 */
export const valibotAdapter: SchemaAdapter<
  v.BaseSchema<unknown, unknown, v.BaseIssue<unknown>>
> = {
  name: "valibot",

  fromJsonSchema: (schema: object) => {
    // Valibot n'a pas de "json-schema-to-valibot" officiel robuste en runtime.
    // On va simuler un mapping pour les types de base.

    const s = schema as Record<string, unknown>;
    if (s.type === "string")
      return v.string() as v.StringSchema<
        v.ErrorMessage<v.StringIssue> | undefined
      >;
    if (s.type === "number")
      return v.number() as v.NumberSchema<
        v.ErrorMessage<v.NumberIssue> | undefined
      >;
    if (s.type === "boolean")
      return v.boolean() as v.BooleanSchema<
        v.ErrorMessage<v.BooleanIssue> | undefined
      >;
    if (s.type === "object") {
      const props: Record<
        string,
        v.BaseSchema<unknown, unknown, v.BaseIssue<unknown>>
      > = {};
      if (s.properties && typeof s.properties === "object") {
        for (const [key, value] of Object.entries(
          s.properties as Record<string, JsonSchema>,
        )) {
          props[key] = valibotAdapter.fromJsonSchema(value) as v.BaseSchema<
            unknown,
            unknown,
            v.BaseIssue<unknown>
          >;
        }
      }
      return v.object(props);
    }

    return v.any();
  },

  toJsonSchema: (
    nativeSchema: v.BaseSchema<unknown, unknown, v.BaseIssue<unknown>>,
  ) => {
    return toJsonSchema(nativeSchema) as JsonSchema;
  },

  validate: (
    nativeSchema: v.BaseSchema<unknown, unknown, v.BaseIssue<unknown>>,
    data: unknown,
  ): ValidationResult => {
    const result = v.safeParse(nativeSchema, data);
    if (result.success) return { success: true };
    return formatValibotError(result.issues);
  },
};
