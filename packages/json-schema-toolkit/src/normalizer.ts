import type { JsonSchema } from "./types";

export function detectDiscriminant(
	parentSchema: JsonSchema,
	variants: JsonSchema[]
): string | undefined {
	if (parentSchema.discriminator?.propertyName) {
		return parentSchema.discriminator.propertyName;
	}

	const variantProperties = variants.map((v) =>
		Object.entries((v.properties as Record<string, JsonSchema>) ?? {})
	);

	if (variantProperties.length === 0) {
		return;
	}

	const firstVariantProps = variantProperties[0] || [];
	for (const [propName] of firstVariantProps) {
		const isConstInAll = variantProperties.every((variantProps) => {
			const match = variantProps.find(([k]) => k === propName);
			return match && (match[1] as JsonSchema).const !== undefined;
		});

		if (isConstInAll) {
			const constValues = variantProperties.map((vProps) => {
				const match = vProps.find(([k]) => k === propName);
				return match ? (match[1] as JsonSchema).const : undefined;
			});
			const uniqueValues = new Set(constValues.map((v) => JSON.stringify(v)));
			if (uniqueValues.size === constValues.length) {
				return propName;
			}
		}
	}

	return;
}

export function getVariantLabel(
	schema: JsonSchema,
	discriminantKey: string | undefined,
	index: number
): string {
	if (schema.title) {
		return schema.title;
	}

	if (discriminantKey && schema.properties) {
		const discriminantProp = (schema.properties as Record<string, JsonSchema>)[
			discriminantKey
		];
		if (discriminantProp?.const !== undefined) {
			return String(discriminantProp.const);
		}
	}

	return `Variant ${index + 1}`;
}

export interface VariantInfo {
	discriminantKey?: string;
	label: string;
	schema: JsonSchema;
}

export function normalizeUnion(
	parentSchema: JsonSchema,
	variants: JsonSchema[]
): VariantInfo[] {
	const discriminantKey = detectDiscriminant(parentSchema, variants);

	return variants.map((schema, index) => ({
		label: getVariantLabel(schema, discriminantKey, index),
		schema,
		discriminantKey,
	}));
}

export function isUnionSchema(schema: JsonSchema): boolean {
	return (
		(Array.isArray(schema.oneOf) && schema.oneOf.length > 1) ||
		(Array.isArray(schema.anyOf) && schema.anyOf.length > 1)
	);
}

export function getUnionVariants(schema: JsonSchema): JsonSchema[] {
	if (Array.isArray(schema.oneOf) && schema.oneOf.length > 1) {
		return schema.oneOf as JsonSchema[];
	}
	if (Array.isArray(schema.anyOf) && schema.anyOf.length > 1) {
		return schema.anyOf as JsonSchema[];
	}
	return [];
}
