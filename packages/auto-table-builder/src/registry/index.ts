import type { ComponentType } from "react";

// biome-ignore lint/suspicious/noExplicitAny: Cell component props are dynamic (value type unknown at schema resolution time)
export type CellComponent = ComponentType<{ value: any }>;

export interface RegistrySelector {
	format?: string;
	type?: string;
	widget?: string;
}

interface RegistryEntry {
	component: CellComponent;
	selector: RegistrySelector;
}

export interface ColumnRegistry {
	register: (selector: RegistrySelector, component: CellComponent) => void;
	resolve: (meta: RegistrySelector) => CellComponent | undefined;
}

export function createColumnRegistry(): ColumnRegistry {
	const entries: RegistryEntry[] = [];

	return {
		register(selector: RegistrySelector, component: CellComponent) {
			entries.push({ selector, component });
		},

		resolve(meta: RegistrySelector): CellComponent | undefined {
			for (const entry of entries) {
				if (entry.selector.type !== meta.type) {
					continue;
				}
				if (entry.selector.format && entry.selector.format !== meta.format) {
					continue;
				}
				if (entry.selector.widget && entry.selector.widget !== meta.widget) {
					continue;
				}
				return entry.component;
			}
			return;
		},
	};
}
