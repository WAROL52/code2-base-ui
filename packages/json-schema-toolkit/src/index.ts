export type { SchemaAdapter } from "./adapter/types";
export { isEmpty, validateConstraint } from "./constraint-validator";
export {
	createStandardSchema,
	numberSchema,
	objectSchema,
	type StandardSchema,
	stringSchema,
	toJsonSchema,
	validateSchema,
} from "./core/schema";
export * from "./core/standard-schema-v1";
// Schema traversal & resolution
export {
	assertFieldMeta,
	isFieldArray,
	isFieldEnum,
	isFieldObject,
	isFieldPrimitive,
	isFieldUnion,
	isJsonSchema,
} from "./guards";
export {
	enMessages,
	frMessages,
	getMessages,
	registerLocale,
} from "./i18n";
export type { VariantInfo } from "./normalizer";
export {
	detectDiscriminant,
	getUnionVariants,
	getVariantLabel,
	isUnionSchema,
	normalizeUnion,
} from "./normalizer";
export { FieldRegistry } from "./registry/index";
export { mergeAllOf, resolveSchema } from "./resolver";
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
	type UiOptions,
} from "./schema-utils";
export { getFieldMeta, traverseSchema } from "./traverser";
export type {
	FieldComponent,
	FieldConstraints,
	FieldKind,
	FieldMeta,
	GroupCriteria,
	I18nMessages,
	JsonSchema,
	JsonSchemaDraft,
	JsonSchemaType,
	Locale,
	RegistryEntry,
	RegistrySelector,
	ResolvedSchema,
	ValidationError,
	ValidationResult,
	VariantField,
} from "./types";
export {
	entries,
	flatfields,
	fromEntries,
	groupBy,
	keys,
} from "./utils/index";
export { validateJsonSchema } from "./utils/validate-schema";
