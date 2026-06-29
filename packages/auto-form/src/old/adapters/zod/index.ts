// =============================================================================
// JSON Schema Toolkit — Zod Adapter
// Wrapper autour de zod, json-schema-to-zod et zod-to-json-schema.
// =============================================================================

import { parseSchema } from "json-schema-to-zod";
import { type ZodError, type ZodSchema, z } from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";
import type { JsonSchema, ValidationResult } from "../../core";
import type { SchemaAdapter } from "../index";

/**
 * Formate les erreurs ZodError en ValidationResult normalisé.
 */
export function formatZodError(error: ZodError): ValidationResult {
  return {
    success: false,
    errors: error.issues.map((issue) => ({
      path: issue.path.join("."),
      message: issue.message,
      code: issue.code,
    })),
  };
}

/**
 * Adapter pour Zod
 */
export const zodAdapter: SchemaAdapter<ZodSchema> = {
  name: "zod",

  fromJsonSchema: (schema: object) => {
    // json-schema-to-zod retourne une string de code par défaut ou un objet si configuré.
    // Note: la lib parseSchema retourne souvent du code à eval(), mais ici on veut
    // un objet Zod dynamique si possible.
    // Malheureusement json-schema-to-zod est principalement un générateur de code.
    // Pour une conversion RUNTIME, on pourrait utiliser ajv ou une autre approche,
    // mais le plan spécifiait ces libs.

    // Alternative: Puisque json-schema-to-zod est lourd pour le runtime,
    // on va implémenter un mini-parser ou utiliser une approche plus directe.
    // Mais restons sur le plan : wrap le résultat de parseSchema (qui est du code JS).

    try {
      const code = parseSchema(schema);
      // Sécurité : c'est du code généré par une lib fiable, mais eval reste eval.
      // Dans un vrai projet, on préférerait un parser AST -> Zod.
      const fn = new Function("z", `return ${code}`);
      return fn(z) as ZodSchema;
    } catch (e) {
      console.error("Zod Adapter: Failed to parse JSON Schema", e);
      return z.any();
    }
  },

  toJsonSchema: (nativeSchema: ZodSchema) => {
    return zodToJsonSchema(nativeSchema as any, {}) as JsonSchema;
  },

  validate: (nativeSchema: ZodSchema, data: unknown): ValidationResult => {
    const result = nativeSchema.safeParse(data);
    if (result.success) return { success: true };
    return formatZodError(result.error);
  },
};
