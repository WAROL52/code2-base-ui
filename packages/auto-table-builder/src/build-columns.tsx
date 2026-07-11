import type { FieldMeta } from "@code2-base-ui/json-schema-toolkit";
import type { AccessorKeyColumnDef, ColumnDef } from "@tanstack/react-table";
import type { ColumnRegistry } from "./registry";

export interface BuildColumnsConfig<TData> {
	fields: FieldMeta[];
	overrides?: Partial<Record<string, Partial<ColumnDef<TData>>>>;
	prefix?: ColumnDef<TData>[];
	registry: ColumnRegistry;
}

export function buildColumns<TData>(
	config: BuildColumnsConfig<TData>
): ColumnDef<TData>[] {
	const { fields, registry, overrides, prefix } = config;

	const fieldColumns = fields
		.filter((field) => !field.uiHidden)
		.map((field) => {
			const id = field.name ?? field.path;

			const cellComponent = registry.resolve({
				type: field.type,
				format: field.format,
				widget: field.uiWidget,
			});

			const col: AccessorKeyColumnDef<TData> = {
				id,
				accessorKey: id as keyof TData,
				header: field.label || id,
			};

			if (cellComponent) {
				const Component = cellComponent;
				col.cell = ({ getValue }) => <Component value={getValue()} />;
			}

			if (overrides?.[id]) {
				Object.assign(col, overrides[id]);
			}

			return col as ColumnDef<TData>;
		});

	return [...(prefix ?? []), ...fieldColumns];
}
