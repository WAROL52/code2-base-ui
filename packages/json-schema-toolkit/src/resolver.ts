import type { JsonSchema, JsonSchemaDraft, ResolvedSchema } from "./types";

function deepClone<T>(value: T): T {
	return JSON.parse(JSON.stringify(value)) as T;
}

function extractDefinitions(schema: JsonSchema): Record<string, JsonSchema> {
	return (schema.$defs ?? schema.definitions ?? {}) as Record<
		string,
		JsonSchema
	>;
}

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
	return "draft-7";
}

const REF_REGEX = /^#\/(?:\$defs|definitions)\/(.+)$/;

function resolveRef(
	ref: string,
	definitions: Record<string, JsonSchema>
): JsonSchema | null {
	const match = ref.match(REF_REGEX);
	if (!match) {
		return null;
	}
	const name = match[1];
	return name ? (definitions[name] ?? null) : null;
}

function resolveRefBlock(
	schema: JsonSchema,
	definitions: Record<string, JsonSchema>,
	resolving: Set<string>
): { handled: true; result: JsonSchema } | { handled: false } {
	if (!schema.$ref) {
		return { handled: false };
	}

	const ref = schema.$ref;

	if (resolving.has(ref)) {
		return {
			handled: true,
			result: { type: "object", title: `[Circular: ${ref}]` },
		};
	}

	const resolved = resolveRef(ref, definitions);
	if (resolved) {
		resolving.add(ref);
		const result = resolveRefs(deepClone(resolved), definitions, resolving);
		resolving.delete(ref);

		const { $ref: _, ...rest } = schema;
		return { handled: true, result: { ...result, ...rest } };
	}

	return { handled: true, result: schema };
}

function resolveRefs(
	schema: JsonSchema,
	definitions: Record<string, JsonSchema>,
	resolving: Set<string> = new Set()
): JsonSchema {
	const refResult = resolveRefBlock(schema, definitions, resolving);
	if (refResult.handled) {
		return refResult.result;
	}

	const resolved: JsonSchema = { ...schema };

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

	for (const key of ["allOf", "anyOf", "oneOf"] as const) {
		if (schema[key]) {
			resolved[key] = schema[key]?.map((sub) =>
				resolveRefs(sub, definitions, resolving)
			);
		}
	}

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

export function mergeAllOf(schemas: JsonSchema[]): JsonSchema {
	const merged: JsonSchema = {};

	for (const schema of schemas) {
		if (schema.properties) {
			merged.properties = {
				...(merged.properties as Record<string, JsonSchema> | undefined),
				...(schema.properties as Record<string, JsonSchema>),
			};
		}

		if (schema.required) {
			merged.required = [
				...new Set([...(merged.required ?? []), ...schema.required]),
			];
		}

		for (const key of Object.keys(schema)) {
			if (schema[key] !== undefined && merged[key] === undefined) {
				(merged as Record<string, unknown>)[key] = schema[key];
			}
		}

		if (schema.items && !merged.items) {
			merged.items = schema.items;
		}
		if (schema.prefixItems && !merged.prefixItems) {
			merged.prefixItems = schema.prefixItems;
		}
	}

	return merged;
}

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

export function resolveSchema(
	rawSchema: unknown,
	draftHint?: JsonSchemaDraft
): ResolvedSchema {
	const schema = rawSchema as JsonSchema;
	const draft = detectDraft(schema, draftHint);
	const definitions = extractDefinitions(schema);

	const refResolved = resolveRefs(deepClone(schema), definitions);
	const flattened = flattenAllOf(refResolved);

	return {
		root: flattened,
		definitions,
		draft,
	};
}
