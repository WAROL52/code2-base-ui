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
	const { root } = resolved;

	if (!path || path === "root") {
		const fields = traverseSchema(resolved);
		return (
			(path === "" ? fields[0] : fields.find((f) => f.path === path)) ?? null
		);
	}

	return walkSchemaByPath(root, path.split("."), "");
}

function walkSchemaByPath(
	schema: JsonSchema,
	segments: string[],
	parentPath: string
): FieldMeta | null {
	if (segments.length === 0) {
		return null;
	}

	const [first, ...rest] = segments;
	if (!first) {
		return null;
	}
	const head = first;
	const kind = getKind(schema);

	if (kind === "object" && schema.properties) {
		const props = schema.properties as Record<string, JsonSchema>;
		const childSchema = props[head];
		if (!childSchema) {
			return null;
		}

		const childPath = parentPath ? `${parentPath}.${head}` : head;
		const childRequired = schema.required?.includes(head) ?? false;

		if (rest.length === 0) {
			return schemaToFieldMeta(childSchema, head, childPath, childRequired);
		}

		const innerKind = getKind(childSchema);
		if (innerKind === "object") {
			return walkSchemaByPath(childSchema, rest, childPath);
		}
		if (innerKind === "union") {
			return walkUnionVariants(childSchema, rest, childPath);
		}
		return null;
	}

	if (kind === "union") {
		return walkUnionVariants(schema, segments, parentPath);
	}

	if (kind === "array") {
		const itemSchema = (schema.items ?? schema.prefixItems?.[0]) as
			| JsonSchema
			| undefined;
		if (!itemSchema) {
			return null;
		}
		return walkSchemaByPath(itemSchema, segments, parentPath);
	}

	return null;
}

function walkUnionVariants(
	schema: JsonSchema,
	segments: string[],
	parentPath: string
): FieldMeta | null {
	const variants = getUnionVariants(schema);
	for (const variant of variants) {
		const found = walkSchemaByPath(variant, segments, parentPath);
		if (found) {
			return found;
		}
	}
	return null;
}
