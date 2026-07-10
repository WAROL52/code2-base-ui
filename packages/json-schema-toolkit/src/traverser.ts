import { getUnionVariants, isUnionSchema, normalizeUnion } from "./normalizer";
import {
	getConstraints,
	getDefaultValue,
	getEnum,
	getKind,
	getLabel,
	getType,
	getUiOptions,
} from "./schema-utils";
import type {
	FieldMeta,
	JsonSchema,
	ResolvedSchema,
	VariantField,
} from "./types";

function schemaToFieldMeta(
	schema: JsonSchema,
	name: string,
	path: string,
	required: boolean
): FieldMeta {
	const type = getType(schema);
	const kind = getKind(schema);
	const uiOpts = getUiOptions(schema);

	const base: FieldMeta = {
		path,
		name,
		type,
		kind,
		required,
		label: getLabel(schema, name),
		description: schema.description,
		placeholder: uiOpts.placeholder,
		format: schema.format,
		uiWidget: uiOpts.widget,
		uiHidden: uiOpts.hidden,
		uiReadonly: uiOpts.readonly,
		uiOrder: uiOpts.order,
		enum: getEnum(schema),
		defaultValue: getDefaultValue(schema),
		constraints: getConstraints(schema),
		resolvedSchema: schema,
	};

	if (kind === "object" && schema.properties) {
		const requiredFields = new Set(schema.required ?? []);
		const props = schema.properties as Record<string, JsonSchema>;

		let children = Object.entries(props).map(([childName, childSchema]) =>
			schemaToFieldMeta(
				childSchema,
				childName,
				path ? `${path}.${childName}` : childName,
				requiredFields.has(childName)
			)
		);

		children = children.sort(
			(a, b) => (a.uiOrder ?? 9999) - (b.uiOrder ?? 9999)
		);

		return { ...base, children };
	}

	if (kind === "array") {
		if (schema.items && !Array.isArray(schema.items)) {
			const itemMeta = schemaToFieldMeta(
				schema.items as JsonSchema,
				"items",
				`${path}[]`,
				false
			);
			return { ...base, itemMeta };
		}

		if (schema.prefixItems && schema.prefixItems.length > 0) {
			const itemMeta = schemaToFieldMeta(
				schema.prefixItems[0] as JsonSchema,
				"items",
				`${path}[]`,
				false
			);
			return { ...base, itemMeta };
		}

		return base;
	}

	if (kind === "union") {
		const rawVariants = getUnionVariants(schema);
		const variantInfos = normalizeUnion(schema, rawVariants);

		const variants: VariantField[] = variantInfos.map((info) => {
			const variantSchema: JsonSchema = {
				type: "object",
				title: info.label,
				...info.schema,
			};

			const variantMeta = schemaToFieldMeta(
				variantSchema,
				info.label,
				path,
				required
			);
			return {
				label: info.label,
				meta: variantMeta,
				children: variantMeta.children ?? [],
			};
		});

		const discriminantKey = variantInfos[0]?.discriminantKey;

		return { ...base, variants, discriminantKey };
	}

	return base;
}

export function traverseSchema(resolved: ResolvedSchema): FieldMeta[] {
	const { root } = resolved;

	if (isUnionSchema(root)) {
		const syntheticMeta = schemaToFieldMeta(root, "root", "", false);
		return [syntheticMeta];
	}

	if (root.type === "object" || root.properties) {
		const requiredFields = new Set(root.required ?? []);
		const props = (root.properties as Record<string, JsonSchema>) ?? {};

		let fields = Object.entries(props).map(([name, schema]) =>
			schemaToFieldMeta(schema, name, name, requiredFields.has(name))
		);

		fields = fields.sort((a, b) => (a.uiOrder ?? 9999) - (b.uiOrder ?? 9999));

		return fields;
	}

	return [schemaToFieldMeta(root, "root", "root", false)];
}

export function getFieldMeta(
	resolved: ResolvedSchema,
	path: string
): FieldMeta | null {
	const fields = traverseSchema(resolved);
	return findByPath(fields, path);
}

function findInVariants(
	variants: FieldMeta["variants"],
	path: string
): FieldMeta | null {
	if (!variants) {
		return null;
	}
	for (const variant of variants) {
		const found = findByPath(variant.children, path);
		if (found) {
			return found;
		}
		if (variant.meta.path === path) {
			return variant.meta;
		}
	}
	return null;
}

function findByPath(fields: FieldMeta[], path: string): FieldMeta | null {
	for (const field of fields) {
		if (field.path === path) {
			return field;
		}

		if (field.children) {
			const found = findByPath(field.children, path);
			if (found) {
				return found;
			}
		}

		const foundInVariants = findInVariants(field.variants, path);
		if (foundInVariants) {
			return foundInVariants;
		}
	}
	return null;
}
