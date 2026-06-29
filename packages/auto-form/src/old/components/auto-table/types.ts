// =============================================================================
// AutoTable — Types
// =============================================================================
import type { JsonSchema } from "../../core/types";

export interface AutoTableProps<TData> {
  /**
   * Le JSON Schema décrivant la structure des données.
   */
  schema: JsonSchema;

  /**
   * Les données à afficher dans le tableau.
   */
  data: TData[];

  /**
   * Titre optionnel du tableau.
   */
  title?: string;

  /**
   * Description optionnelle.
   */
  description?: string;

  /**
   * Configuration de la pagination.
   */
  pagination?: {
    pageSize?: number;
    enabled?: boolean;
  };

  /**
   * Configuration de la recherche globale.
   */
  globalFilter?: {
    enabled?: boolean;
    placeholder?: string;
  };

  /**
   * Classes CSS additionnelles.
   */
  className?: string;

  /**
   * Callback lors du clic sur une ligne.
   */
  onRowClick?: (row: TData) => void;
}
