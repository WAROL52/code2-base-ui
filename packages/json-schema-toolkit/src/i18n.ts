import type { I18nMessages, Locale } from "./types";

const en: I18nMessages = {
	required: "This field is required",
	minLength: (min) => `Must be at least ${min} characters`,
	maxLength: (max) => `Must be at most ${max} characters`,
	minimum: (min) => `Must be greater than or equal to ${min}`,
	maximum: (max) => `Must be less than or equal to ${max}`,
	exclusiveMinimum: (min) => `Must be strictly greater than ${min}`,
	exclusiveMaximum: (max) => `Must be strictly less than ${max}`,
	pattern: (pattern) => `Must match pattern: ${pattern}`,
	minItems: (min) => `Must have at least ${min} item(s)`,
	maxItems: (max) => `Must have at most ${max} item(s)`,
	uniqueItems: "All items must be unique",
	multipleOf: (factor) => `Must be a multiple of ${factor}`,
	invalidType: (expected) => `Expected type: ${expected}`,
	invalidFormat: (format) => `Invalid format: ${format}`,
	invalidEnum: (values) => `Must be one of: ${values.join(", ")}`,
};

const fr: I18nMessages = {
	required: "Ce champ est obligatoire",
	minLength: (min) => `Doit contenir au moins ${min} caractère(s)`,
	maxLength: (max) => `Doit contenir au plus ${max} caractère(s)`,
	minimum: (min) => `Doit être supérieur ou égal à ${min}`,
	maximum: (max) => `Doit être inférieur ou égal à ${max}`,
	exclusiveMinimum: (min) => `Doit être strictement supérieur à ${min}`,
	exclusiveMaximum: (max) => `Doit être strictement inférieur à ${max}`,
	pattern: (pattern) => `Doit correspondre au format : ${pattern}`,
	minItems: (min) => `Doit contenir au moins ${min} élément(s)`,
	maxItems: (max) => `Doit contenir au plus ${max} élément(s)`,
	uniqueItems: "Tous les éléments doivent être uniques",
	multipleOf: (factor) => `Doit être un multiple de ${factor}`,
	invalidType: (expected) => `Type attendu : ${expected}`,
	invalidFormat: (format) => `Format invalide : ${format}`,
	invalidEnum: (values) => `Doit être l'une des valeurs : ${values.join(", ")}`,
};

const localeRegistry: Record<Locale, I18nMessages> = { en, fr };

export function registerLocale(locale: Locale, messages: I18nMessages): void {
	localeRegistry[locale] = messages;
}

export function getMessages(
	locale: Locale = "en",
	overrides?: Partial<I18nMessages>
): I18nMessages {
	const base = localeRegistry[locale] ?? (localeRegistry.en as I18nMessages);
	if (!overrides) {
		return base;
	}
	return { ...base, ...overrides };
}

export { en as enMessages, fr as frMessages };
