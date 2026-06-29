// =============================================================================
// JSON Schema Toolkit — Core Types
// Zéro dépendance UI/React. Partagé par tous les modules du toolkit.
// =============================================================================

// ---------------------------------------------------------------------------
// JSON Schema Drafts
// ---------------------------------------------------------------------------

export type JsonSchemaDraft = "draft-7" | "draft-2020-12";

// ---------------------------------------------------------------------------
// JSON Schema brut (entrée utilisateur)
// ---------------------------------------------------------------------------

export type JsonSchemaType =
  | "string"
  | "number"
  | "integer"
  | "boolean"
  | "object"
  | "array"
  | "null";

export interface JsonSchema {
  // Meta
  $schema?: string;
  $id?: string;
  title?: string;
  description?: string;

  // Type
  type?: JsonSchemaType | JsonSchemaType[];

  // Références
  $ref?: string;
  /** Draft 2020-12 */
  $defs?: Record<string, JsonSchema>;
  /** Draft 7 */
  definitions?: Record<string, JsonSchema>;

  // Composition
  allOf?: JsonSchema[];
  anyOf?: JsonSchema[];
  oneOf?: JsonSchema[];
  not?: JsonSchema;
  if?: JsonSchema;
  then?: JsonSchema;
  else?: JsonSchema;

  // Object
  properties?: Record<string, JsonSchema>;
  additionalProperties?: boolean | JsonSchema;
  required?: string[];
  patternProperties?: Record<string, JsonSchema>;

  // Array
  items?: JsonSchema | JsonSchema[];
  prefixItems?: JsonSchema[];
  minItems?: number;
  maxItems?: number;
  uniqueItems?: boolean;

  // String
  format?: string;
  pattern?: string;
  minLength?: number;
  maxLength?: number;
  enum?: unknown[];
  const?: unknown;

  // Number
  minimum?: number;
  maximum?: number;
  exclusiveMinimum?: number | boolean;
  exclusiveMaximum?: number | boolean;
  multipleOf?: number;

  // UI Extensions (x-ui-*)
  "x-ui-widget"?: string;
  "x-ui-label"?: string;
  "x-ui-description"?: string;
  placeholder?: string;
  "x-ui-order"?: number;
  "x-ui-hidden"?: boolean;
  "x-ui-readonly"?: boolean;

  // Valeur par défaut
  default?: unknown;

  // Discriminant pour oneOf/anyOf
  discriminator?: {
    propertyName: string;
    mapping?: Record<string, string>;
  };

  // Permet les propriétés supplémentaires arbitraires
  [key: string]: unknown;
}

// ---------------------------------------------------------------------------
// FieldMeta — représentation normalisée d'un champ après résolution
// ---------------------------------------------------------------------------

export type FieldKind =
  | "primitive" // string, number, integer, boolean, null
  | "object" // type: object → children[]
  | "array" // type: array → itemMeta
  | "enum" // string/number avec enum[]
  | "union"; // oneOf/anyOf → variants[][]

export interface FieldMeta {
  /** Chemin pointé dans le schéma résolu, ex: "user.address.city" */
  path: string;

  /** Nom du champ (dernière partie du path) */
  name: string;

  /** Type JSON Schema résolu, ex: "string" | "object" | "array" */
  type: JsonSchemaType;

  /** Genre sémantique du champ */
  kind: FieldKind;

  /** Format JSON Schema, ex: "date" | "email" | "uri" */
  format?: string;

  /** Widget UI custom via "x-ui-widget", ex: "markdown" | "color-picker" */
  uiWidget?: string;

  /** Masquer le champ dans l'UI */
  uiHidden?: boolean;

  /** Champ en lecture seule */
  uiReadonly?: boolean;

  /** Ordre d'affichage via "x-ui-order" */
  uiOrder?: number;

  /** Le champ est obligatoire */
  required: boolean;

  /** Label affiché (title > x-ui-label > name) */
  label: string;

  /** Texte d'aide / description */
  description?: string;

  /** Texte d'aide / placeholder */
  placeholder?: string;

  /** Valeurs possibles pour un champ enum */
  enum?: unknown[];

  /** Valeur par défaut */
  defaultValue?: unknown;

  /** Contraintes de validation */
  constraints?: FieldConstraints;

  /** Sous-champs (si kind === "object") */
  children?: FieldMeta[];

  /** Métadonnées des items (si kind === "array") */
  itemMeta?: FieldMeta;

  /** Variantes (si kind === "union", ex: oneOf/anyOf) */
  variants?: FieldMeta[][];

  /** Propriété discriminante détectée pour les unions */
  discriminantKey?: string;

  /** Schéma JSON résolu du champ (copie profonde après résolution $ref) */
  resolvedSchema: JsonSchema;
}

export interface FieldConstraints {
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  minimum?: number;
  maximum?: number;
  exclusiveMinimum?: number;
  exclusiveMaximum?: number;
  multipleOf?: number;
  minItems?: number;
  maxItems?: number;
  uniqueItems?: boolean;
}

// ---------------------------------------------------------------------------
// ResolvedSchema — schéma après résolution de tous les $ref + allOf
// ---------------------------------------------------------------------------

export interface ResolvedSchema {
  /** Schéma racine résolu */
  root: JsonSchema;

  /** Dictionnaire des définitions (fusionné $defs + definitions) */
  definitions: Record<string, JsonSchema>;

  /** Draft détecté ou spécifié */
  draft: JsonSchemaDraft;
}

// ---------------------------------------------------------------------------
// Résultat de validation (interface partagée par les adapters)
// ---------------------------------------------------------------------------

export interface ValidationError {
  /** Chemin vers le champ en erreur, ex: "user.email" */
  path: string;

  /** Message d'erreur (localisé par l'adapter) */
  message: string;

  /** Code d'erreur machine-readable, ex: "required" | "minLength" */
  code: string;
}

export interface ValidationResult {
  success: boolean;
  errors?: ValidationError[];
}

// ---------------------------------------------------------------------------
// I18n
// ---------------------------------------------------------------------------

export type Locale = string; // "fr" | "en" | "es" | ...

export interface I18nMessages {
  required: string;
  minLength: (min: number) => string;
  maxLength: (max: number) => string;
  minimum: (min: number) => string;
  maximum: (max: number) => string;
  exclusiveMinimum: (min: number) => string;
  exclusiveMaximum: (max: number) => string;
  pattern: (pattern: string) => string;
  minItems: (min: number) => string;
  maxItems: (max: number) => string;
  uniqueItems: string;
  multipleOf: (factor: number) => string;
  invalidType: (expected: string) => string;
  invalidFormat: (format: string) => string;
  invalidEnum: (values: unknown[]) => string;
}
