"use client";

import type {
	FieldMeta,
	FieldRegistry,
} from "@code2-base-ui/json-schema-toolkit";
import type { FormAdapter } from "../adapters/types";

export interface LeafFieldHandlerProps {
	adapter: FormAdapter;
	fieldMeta: FieldMeta;
	registry: FieldRegistry;
}

export function LeafFieldHandler({
	adapter,
	fieldMeta,
	registry,
}: LeafFieldHandlerProps) {
	const { path, label, placeholder } = fieldMeta;
	const Component = registry.resolve(fieldMeta);

	return (
		<adapter.Field name={path}>
			{(field) => (
				<Component
					className={fieldMeta.uiReadonly ? "opacity-50" : ""}
					disabled={fieldMeta.uiReadonly}
					error={field.error}
					field={fieldMeta}
					id={path}
					key={path}
					label={label}
					onChange={(val: unknown) => field.onChange(val)}
					placeholder={placeholder}
					value={field.value}
				/>
			)}
		</adapter.Field>
	);
}
