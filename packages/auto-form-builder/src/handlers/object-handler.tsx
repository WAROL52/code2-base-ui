import type { HandlerProps } from "./types";

export function ObjectHandler({
	fieldMeta,
	layout,
	renderChild,
}: HandlerProps) {
	if (!fieldMeta.children) {
		return null;
	}

	return (
		<layout.ObjectField fieldMeta={fieldMeta}>
			{fieldMeta.children.map((child) => renderChild(child))}
		</layout.ObjectField>
	);
}
