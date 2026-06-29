// =============================================================================
// Registry Module — Point d'entrée
// =============================================================================

export * from "./field-registry";
export * from "./standard-registry";
export * from "./types";

/**
 * Note pour plus tard : On n'enregistre pas de "vrais" composants shadcn ici
 * car on veut garder le core agnostique de la lib UI.
 * Les composants par défaut seront injectés par le consommateur (ex: shadcn-adapter).
 */
