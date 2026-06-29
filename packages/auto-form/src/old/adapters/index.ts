// =============================================================================
// JSON Schema Toolkit — Adapters Interface
// Interface commune pour tous les validateurs (Zod, Valibot, TypeBox).
// =============================================================================

import { TObject } from "../components";
import type { JsonSchema, ResolvedSchema, ValidationResult } from "../core";
import { zodAdapter } from "./zod";

/**
 * Interface que chaque adapter (zod, valibot, typebox) doit implémenter.
 * N = Type du schéma natif (ex: ZodSchema, GenericSchema...)
 */
export interface SchemaAdapter<N = any> {
  /** Nom de l'adapter (ex: "zod", "valibot") */
  readonly name: string;

  /**
   * Convertit un JSON Schema brut en schéma natif du validateur.
   */
  fromJsonSchema: (schema: JsonSchema) => N;

  /**
   * Convertit un schéma natif du validateur en JSON Schema brut.
   */
  toJsonSchema: (nativeSchema: N) => JsonSchema;

  /**
   * Valide des données contre un schéma natif et retourne un résultat normalisé.
   */
  validate: (nativeSchema: N, data: unknown) => ValidationResult;
}

/**
 * Types utilitaires pour extraire les erreurs d'une lib spécifique et les normaliser.
 */
export type InternalFormatter<E, R = ValidationResult> = (error: E) => R;

export { typeboxAdapter } from "./typebox";
export { valibotAdapter } from "./valibot";
// Adapters
export { zodAdapter } from "./zod";
export const defaultSchemaAdapter: SchemaAdapter = zodAdapter;
