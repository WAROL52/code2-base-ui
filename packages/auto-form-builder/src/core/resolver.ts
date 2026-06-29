// =============================================================================
// JSON Schema Toolkit — Resolver
// Résolution des $ref, fusion des allOf. Support Draft 7 + Draft 2020-12.
// Zéro dépendance externe.
// =============================================================================

import type { JsonSchema, JsonSchemaDraft, ResolvedSchema } from "./types";

// ---------------------------------------------------------------------------
// Helpers internes
// ---------------------------------------------------------------------------

/** Deep clone simple via JSON (les schémas ne contiennent pas de types non-sérialisables) */
function deepClone<T>(value: T): T {
	return JSON.parse(JSON.stringify(value)) as T;
}

/** Extrait le dictionnaire de définitions du schéma (Draft 7 ou 2020-12) */
function extractDefinitions(schema: JsonSchema): Record<string, JsonSchema> {
	// Draft 2020-12 → $defs ; Draft 7 → definitions
	return (schema.$defs ?? schema.definitions ?? {}) as Record<
		string,
		JsonSchema
	>;
}

/** Détecte le draft à partir du $schema URI si non fourni */
function detectDraft(
	schema: JsonSchema,
	hint?: JsonSchemaDraft
): JsonSchemaDraft {
	if (hint) {
		return hint;
	}
	const uri = schema.$schema ?? "";
	if (uri.includes("2020-12")) {
		return "draft-2020-12";
	}
	return "draft-7"; // Draft 7 par défaut
}

// ---------------------------------------------------------------------------
// Résolution des $ref
// ---------------------------------------------------------------------------

const REF_REGEX = /^#\/(?:\$defs|definitions)\/(.+)$/;

/**
 * Résout un $ref local de la forme "#/$defs/Foo" ou "#/definitions/Foo".
 * Retourne la définition résolue ou null si introuvable.
 */
function resolveRef(
	ref: string,
	definitions: Record<string, JsonSchema>
): JsonSchema | null {
	// Supporte : #/$defs/Foo et #/definitions/Foo
	const match = ref.match(REF_REGEX);
	if (!match) {
		return null;
	}
	const name = match[1];
	return name ? (definitions[name] ?? null) : null;
}

/**
 * Parcourt récursivement un schéma et remplace tous les $ref
 * par une copie profonde de leur définition.
 *
 * Le Set `resolving` évite les boucles infinies sur les références circulaires.
 */
function resolveRefs(
	schema: JsonSchema,
	definitions: Record<string, JsonSchema>,
	resolving: Set<string> = new Set()
): JsonSchema {
	// Résolution du $ref courant
	if (schema.$ref) {
		const ref = schema.$ref;

		// Protection anti-boucle infinie
		if (resolving.has(ref)) {
			// Retourner un placeholder pour les refs circulaires
			return { type: "object", title: `[Circular: ${ref}]` };
		}

		const resolved = resolveRef(ref, definitions);
		if (resolved) {
			resolving.add(ref);
			const result = resolveRefs(deepClone(resolved), definitions, resolving);
			resolving.delete(ref);

			// Fusionner les propriétés supplémentaires du nœud $ref (ex: title, description)
			const { $ref: _, ...rest } = schema;
			return { ...result, ...rest };
		}

		// $ref non résolu (ex: $ref externe) → on laisse tel quel
		return schema;
	}

	const resolved: JsonSchema = { ...schema };

	// Propriétés de type object
	if (schema.properties) {
		const props: Record<string, JsonSchema> = {};
		for (const [key, propSchema] of Object.entries(schema.properties)) {
			props[key] = resolveRefs(
				propSchema as JsonSchema,
				definitions,
				resolving
			);
		}
		resolved.properties = props;
	}

	// Items de type array (Draft 7: items object ou array ; Draft 2020-12: prefixItems)
	if (schema.items && !Array.isArray(schema.items)) {
		resolved.items = resolveRefs(
			schema.items as JsonSchema,
			definitions,
			resolving
		);
	}
	if (Array.isArray(schema.items)) {
		resolved.items = schema.items.map((item) =>
			resolveRefs(item as JsonSchema, definitions, resolving)
		);
	}
	if (schema.prefixItems) {
		resolved.prefixItems = schema.prefixItems.map((item) =>
			resolveRefs(item, definitions, resolving)
		);
	}

	// Composition
	for (const key of ["allOf", "anyOf", "oneOf"] as const) {
		if (schema[key]) {
			resolved[key] = schema[key]?.map((sub) =>
				resolveRefs(sub, definitions, resolving)
			);
		}
	}

	function resolveComparaison(
		schema: JsonSchema,
		definitions: Record<string, JsonSchema>,
		resolving: Set<string> = new Set()
	) {
		if (schema.not) {
			resolved.not = resolveRefs(schema.not, definitions, resolving);
		}
		if (schema.if) {
			resolved.if = resolveRefs(schema.if, definitions, resolving);
		}
		if (schema.then) {
			// biome-ignore lint/suspicious/noThenProperty: JSON Schema uses 'then' as a property
			resolved.then = resolveRefs(schema.then, definitions, resolving);
		}
		if (schema.else) {
			resolved.else = resolveRefs(schema.else, definitions, resolving);
		}
	}
	resolveComparaison(schema, definitions, resolving);

	// additionalProperties
	if (
		schema.additionalProperties &&
		typeof schema.additionalProperties === "object"
	) {
		resolved.additionalProperties = resolveRefs(
			schema.additionalProperties as JsonSchema,
			definitions,
			resolving
		);
	}

	return resolved;
}

// ---------------------------------------------------------------------------
// Fusion allOf
// ---------------------------------------------------------------------------

/**
 * Fusionne récursivement les sous-schémas d'un allOf.
 * - Fusionne les `properties`
 * - Concatène les tableaux `required`
 * - Copie les autres propriétés scalaires du premier schéma qui les définit
 */
export function mergeAllOf(schemas: JsonSchema[]): JsonSchema {
	const merged: JsonSchema = {};

	for (const schema of schemas) {
		// Propriétés object
		if (schema.properties) {
			merged.properties = {
				...(merged.properties as Record<string, JsonSchema> | undefined),
				...(schema.properties as Record<string, JsonSchema>),
			};
		}

		// Required : union des deux tableaux
		if (schema.required) {
			merged.required = [
				...new Set([...(merged.required ?? []), ...schema.required]),
			];
		}

		// Scalaires : type, title, description, format, etc.
		for (const key of Object.keys(schema)) {
			if (schema[key] !== undefined && merged[key] === undefined) {
				(merged as Record<string, unknown>)[key] = schema[key];
			}
		}

		// items et prefixItems
		if (schema.items && !merged.items) {
			merged.items = schema.items;
		}
		if (schema.prefixItems && !merged.prefixItems) {
			merged.prefixItems = schema.prefixItems;
		}
	}

	return merged;
}

/**
 * Parcourt récursivement le schéma et fusionne tous les `allOf` rencontrés.
 */
function flattenAllOf(schema: JsonSchema): JsonSchema {
	if (schema.allOf) {
		const flattened = mergeAllOf(schema.allOf.map(flattenAllOf));
		const { allOf: _, ...rest } = schema;
		return { ...flattened, ...rest };
	}

	const result: JsonSchema = { ...schema };

	if (schema.properties) {
		const props: Record<string, JsonSchema> = {};
		for (const [key, propSchema] of Object.entries(schema.properties)) {
			props[key] = flattenAllOf(propSchema as JsonSchema);
		}
		result.properties = props;
	}

	for (const key of ["anyOf", "oneOf"] as const) {
		if (schema[key]) {
			result[key] = schema[key]?.map(flattenAllOf);
		}
	}

	if (schema.items && !Array.isArray(schema.items)) {
		result.items = flattenAllOf(schema.items as JsonSchema);
	}

	return result;
}

// ---------------------------------------------------------------------------
// API publique
// ---------------------------------------------------------------------------

/**
 * Résout un JSON Schema complet :
 * 1. Extrait les définitions ($defs / definitions)
 * 2. Remplace tous les $ref par leur définition (deep clone, anti-boucle)
 * 3. Fusionne tous les allOf rencontrés
 *
 * @param rawSchema - Le schéma JSON brut fourni par l'utilisateur
 * @param draftHint - Force un draft spécifique (optionnel, auto-détecté sinon)
 */
export function resolveSchema(
	rawSchema: unknown,
	draftHint?: JsonSchemaDraft
): ResolvedSchema {
	const schema = rawSchema as JsonSchema;
	const draft = detectDraft(schema, draftHint);
	const definitions = extractDefinitions(schema);

	// Étape 1 : résoudre les $ref
	const refResolved = resolveRefs(deepClone(schema), definitions);

	// Étape 2 : aplatir les allOf
	const flattened = flattenAllOf(refResolved);

	return {
		root: flattened,
		definitions,
		draft,
	};
}
