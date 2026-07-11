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
	resolve: (meta: RegistrySelector) => CellComponent;
	setFallback: (component: CellComponent) => void;
}

export function createColumnRegistry(): ColumnRegistry {
	const entries: RegistryEntry[] = [];
	let fallback: CellComponent | undefined;

	return {
		register(selector: RegistrySelector, component: CellComponent) {
			entries.push({ selector, component });
		},

		resolve(meta: RegistrySelector): CellComponent {
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
			if (fallback) {
				return fallback;
			}
			throw new Error(
				`Aucun composant enregistré pour le champ de type "${meta.type}"`
			);
		},

		setFallback(component: CellComponent) {
			fallback = component;
		},
	};
}
