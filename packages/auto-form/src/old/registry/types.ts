// =============================================================================
// Types — Registry
// =============================================================================
import type React from "react";
import type { FieldMeta } from "../core/types";
/**
 * Props de base pour tout composant de champ enregistré.
 */
export type FieldComponentProps<T = any, P extends object = object> = {
  /** Métadonnées normalisées du champ. */
  field: FieldMeta;
  /** Label affiché. */
  label?: string;
  /** Valeur actuelle. */
  value: T;
  /** Callback de changement. */
  onChange: (value: T) => void;
  /** Erreurs de validation (optionnel). */
  error?: string;
  /** État de désactivation. */
  disabled?: boolean;
  /** Placeholder (si applicable). */
  placeholder?: string;
  /** Id unique du champ. */
  id: string;
  /** Classes CSS additionnelles. */
  className?: string;
} & P;

/**
 * Type d'un composant de rendu pour le registre.
 */
export type FieldComponent<
  T = any,
  P extends object = object,
> = React.ComponentType<FieldComponentProps<T, P>>;

/**
 * Sélecteur pour trouver un composant dans le registre.
 */
export interface RegistrySelector {
  /** Type JSON Schema (string, number, etc.) */
  type?: string;
  /** Format JSON Schema (email, date-time, etc.) */
  format?: string;
  /** Widget spécifique demandé via ui:widget. */
  widget?: string;
}

/**
 * Entrée dans le registre des composants.
 */
export interface RegistryEntry {
  selector: RegistrySelector;
  component: FieldComponent;
  /** Priorité (le plus élevé gagne). */
  priority: number;
}
