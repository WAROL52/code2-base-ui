import type {
  FieldMeta,
  RegistrySelector,
  RegistryEntry,
  FieldComponent,
} from "../types";

/**
 * Manages a registry of field components for dynamic UI generation.
 * Resolves the best matching component based on type, format, and widget.
 */
export class FieldRegistry {
  private entries: RegistryEntry[] = [];
  private db: Map<string, RegistryEntry[]> = new Map();
  private fallbackComponent: FieldComponent | null = null;

  /**
   * Registers a component for a given selector.
   *
   * @param selector - The selector criteria (type, format, widget)
   * @param component - The React component to register
   * @param priority - Higher priority wins when multiple matches exist
   */
  register<T extends FieldComponent>(
    selector: RegistrySelector,
    component: T,
    priority = 0,
  ): void {
    this.entries.push({ selector, component, priority });
    this.entries.sort((a, b) => b.priority - a.priority);

    const types: string[] = selector.type
      ? [selector.type]
      : ["string", "number", "integer", "boolean", "object", "array"];
    const formats: (string | null)[] = selector.format !== undefined
      ? [selector.format]
      : [null];
    const widgets: (string | null)[] = selector.widget !== undefined
      ? [selector.widget]
      : [null];

    for (const type of types) {
      for (const format of formats) {
        for (const widget of widgets) {
          const key = JSON.stringify([type, format, widget]);

          if (!this.db.has(key)) {
            this.db.set(key, []);
          }
          this.db.get(key)!.push({ selector, component, priority });
        }
      }
    }
  }

  /**
   * Sets the default component when no match is found.
   */
  setFallback(component: FieldComponent): void {
    this.fallbackComponent = component;
  }

  /**
   * Generates selector keys for a given selector.
   */
  static selectorKeys(selector: RegistrySelector): string[] {
    const types: string[] = selector.type ? [selector.type] : ["string", "number", "integer", "boolean", "object", "array"];
    const formats: (string | null)[] = selector.format !== undefined ? [selector.format] : [null];
    const widgets: (string | null)[] = selector.widget !== undefined ? [selector.widget] : [null];

    const keys: string[] = [];
    for (const type of types) {
      for (const format of formats) {
        for (const widget of widgets) {
          keys.push(JSON.stringify([type, format, widget]));
        }
      }
    }
    return keys;
  }

  /**
   * Finds the best matching component for a given field.
   *
   * @param field - The field metadata to resolve
   * @returns The matched component
   * @throws If no match and no fallback is set
   */
  resolve(field: FieldMeta): FieldComponent {
    const keys = FieldRegistry.selectorKeys({
      type: field.type,
      format: field.format,
      widget: field.uiWidget,
    });

    for (const key of keys) {
      const entries = this.db.get(key);
      if (entries && entries.length > 0) {
        const entry = entries[0]!;
        return entry.component;
      }
    }

    if (this.fallbackComponent) {
      return this.fallbackComponent;
    }

    throw new Error(
      `Aucun composant enregistré pour le champ "${field.path}" (${field.type}:${field.format ?? "none"})`,
    );
  }

  /**
   * Clears all registered entries and the fallback.
   */
  clear(): void {
    this.entries = [];
    this.db = new Map();
    this.fallbackComponent = null;
  }
}
