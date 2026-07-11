import type { FieldMeta } from "@code2-base-ui/json-schema-toolkit";
import type { HandlerProps } from "./types";

function getDefaultForType(type?: string): unknown {
	switch (type) {
		case "string":
			return "";
		case "number":
			return 0;
		case "boolean":
			return false;
		case "object":
			return {};
		case "array":
			return [];
		default:
			return "";
	}
}

export function ArrayHandler({
	adapter,
	fieldMeta,
	form,
	layout,
	renderChild,
}: HandlerProps) {
	const { path, itemMeta } = fieldMeta;

	if (!itemMeta) {
		return null;
	}

	const values = (form.values[path] as unknown[]) ?? [];

	const items = values.map((_val, index) => {
		const indexedMeta: FieldMeta = {
			...itemMeta,
			path: `${path}[${index}]`,
		};
		return renderChild(indexedMeta);
	});

	return (
		<adapter.Field name={path}>
			{(field) => (
				<layout.ArrayField
					error={field.error}
					fieldMeta={fieldMeta}
					onAdd={() =>
						form.appendFieldValue(path, getDefaultForType(itemMeta.type))
					}
					onRemove={(index) => form.removeFieldValue(path, index)}
				>
					{items}
				</layout.ArrayField>
			)}
		</adapter.Field>
	);
}
