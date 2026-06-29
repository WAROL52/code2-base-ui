// =============================================================================
// Field Registry — Moteur de mapping UI
// =============================================================================
import type { FieldMeta } from "../core/types";
import type { FieldComponent, RegistryEntry, RegistrySelector } from "./types";

export class FieldRegistry {
  private entries: RegistryEntry[] = [];
  private db: Map<string, RegistryEntry> = new Map();
  private fallbackComponent: FieldComponent | null = null;

  /**
   * Enregistre un composant pour un sélecteur donné.
   */
  register<T extends FieldComponent>(
    selector: RegistrySelector,
    component: T,
    priority = 0,
  ): void {
    if (!selector.type && !selector.format && !selector.widget) return;
    this.entries.push({ selector, component, priority });
    this.entries.sort((a, b) => b.priority - a.priority);
    const key = JSON.stringify([
      selector.type,
      selector.format,
      selector.widget,
    ]);
    this.db.set(key, { selector, component, priority });
  }

  /**
   * Définit le composant par défaut si aucun match n'est trouvé.
   */
  setFallback(component: FieldComponent): void {
    this.fallbackComponent = component;
  }

  static selectorKeys(selector: RegistrySelector) {
    return [JSON.stringify([selector.type, selector.format, selector.widget])];
  }

  private matches(selector: RegistrySelector, field: FieldMeta): boolean {
    const { type, format, uiWidget: widget } = field;
    if (selector.type != null && selector.type !== type) return false;
    if (selector.format != null && selector.format !== format) return false;
    if (selector.widget != null && selector.widget !== widget) return false;
    return true;
  }

  /**
   * Trouve le composant le plus approprié pour un champ donné.
   */
  resolve(field: FieldMeta): FieldComponent {
    const { type, format, uiWidget: widget } = field;

    for (const entry of this.entries) {
      if (this.matches(entry.selector, field)) {
        return entry.component;
      }
    }

    if (this.fallbackComponent) return this.fallbackComponent;

    throw new Error(
      `Aucun composant enregistré pour le champ "${field.path}" (${type}:${format ?? "none"})`,
    );
  }

  /**
   * Vide le registre.
   */
  clear(): void {
    this.entries = [];
    this.db = new Map();
    this.fallbackComponent = null;
  }
}

/**
 * Instance globale par défaut.
 */
export const defaultRegistry = new FieldRegistry();
