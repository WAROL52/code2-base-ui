// =============================================================================
// JSON Schema Toolkit — Core Index
// Point d'entrée public du moteur core. Zéro dépendance UI/React.
// =============================================================================

// Guards & Assertions
export {
  assertFieldMeta,
  isFieldArray,
  isFieldEnum,
  isFieldObject,
  isFieldPrimitive,
  isFieldUnion,
  isJsonSchema,
} from "./guards";
// i18n
export {
  enMessages,
  frMessages,
  getMessages,
  registerLocale,
} from "./i18n";
export type { VariantInfo } from "./normalizer";
// Normalizer
export {
  detectDiscriminant,
  getUnionVariants,
  getVariantLabel,
  isUnionSchema,
  normalizeUnion,
} from "./normalizer";
// Resolver
export { mergeAllOf, resolveSchema } from "./resolver";
// Traverser
export { getFieldMeta, traverseSchema } from "./traverser";
// Types
export type {
  FieldConstraints,
  FieldKind,
  FieldMeta,
  I18nMessages,
  JsonSchema,
  JsonSchemaDraft,
  JsonSchemaType,
  Locale,
  ResolvedSchema,
  ValidationError,
  ValidationResult,
} from "./types";
export type { UiOptions } from "./utils";
// Utils
export {
  getConstraints,
  getDefaultValue,
  getEnum,
  getKind,
  getLabel,
  getType,
  getUiOptions,
  inferTSType,
  isNullable,
} from "./utils";
