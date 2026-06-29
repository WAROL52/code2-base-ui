// =============================================================================
// JSON Schema Toolkit — Normalizer
// Normalisation des unions oneOf/anyOf en variantes FieldMeta[][].
// Détection du discriminant. Zéro dépendance externe.
// =============================================================================

import type { JsonSchema } from "./types";

// ---------------------------------------------------------------------------
// Détection du discriminant
// ---------------------------------------------------------------------------

/**
 * Détecte la propriété discriminante dans un ensemble de sous-schémas oneOf/anyOf.
 *
 * Stratégie :
 * 1. Si le schéma parent a une clé `discriminator.propertyName` → utilise-la.
 * 2. Sinon, cherche une propriété dont la valeur `const` diffère dans chaque variante.
 */
export function detectDiscriminant(
  parentSchema: JsonSchema,
  variants: JsonSchema[],
): string | undefined {
  // 1. Discriminator explicite (OpenAPI / JSON Schema 2020-12)
  if (parentSchema.discriminator?.propertyName) {
    return parentSchema.discriminator.propertyName;
  }

  // 2. Détection automatique : trouver une propriété avec `const` unique par variante
  const variantProperties = variants.map((v) =>
    Object.entries((v.properties as Record<string, JsonSchema>) ?? {}),
  );

  if (variantProperties.length === 0) return undefined;

  const firstVariantProps = variantProperties[0];
  for (const [propName, _propSchema] of firstVariantProps) {
    const isConstInAll = variantProperties.every((variantProps) => {
      const match = variantProps.find(([k]) => k === propName);
      return match && (match[1] as JsonSchema).const !== undefined;
    });

    if (isConstInAll) {
      // Vérifier que les valeurs const sont toutes différentes
      const constValues = variantProperties.map((vProps) => {
        const match = vProps.find(([k]) => k === propName);
        return match ? (match[1] as JsonSchema).const : undefined;
      });
      const uniqueValues = new Set(constValues.map((v) => JSON.stringify(v)));
      if (uniqueValues.size === constValues.length) {
        return propName;
      }
    }
  }

  // 3. Pas de discriminant détecté
  return undefined;
}

// ---------------------------------------------------------------------------
// Extraction du label d'une variante
// ---------------------------------------------------------------------------

/**
 * Génère un label lisible pour une variante oneOf/anyOf.
 * Priorité : title > valeur const du discriminant > index
 */
export function getVariantLabel(
  schema: JsonSchema,
  discriminantKey: string | undefined,
  index: number,
): string {
  if (schema.title) return schema.title;

  if (discriminantKey && schema.properties) {
    const discriminantProp = (schema.properties as Record<string, JsonSchema>)[
      discriminantKey
    ];
    if (discriminantProp?.const !== undefined) {
      return String(discriminantProp.const);
    }
  }

  return `Variant ${index + 1}`;
}

// ---------------------------------------------------------------------------
// Normalisation des unions oneOf/anyOf → FieldMeta[][]
// ---------------------------------------------------------------------------

/**
 * Type intermédiaire pour les variantes avant la conversion complète en FieldMeta.
 * Utilisé par le traverser pour éviter la dépendance circulaire.
 */
export interface VariantInfo {
  label: string;
  schema: JsonSchema;
  discriminantKey?: string;
}

/**
 * Normalise les sous-schémas d'un oneOf ou anyOf en tableau de VariantInfo.
 *
 * @param parentSchema - Le schéma parent contenant le oneOf/anyOf
 * @param variants - Les sous-schémas de la composition
 */
export function normalizeUnion(
  parentSchema: JsonSchema,
  variants: JsonSchema[],
): VariantInfo[] {
  const discriminantKey = detectDiscriminant(parentSchema, variants);

  return variants.map((schema, index) => ({
    label: getVariantLabel(schema, discriminantKey, index),
    schema,
    discriminantKey,
  }));
}

// ---------------------------------------------------------------------------
// Extraction de la liste des champs visibles d'une variante
// (sans récursion : le traverser s'en charge)
// ---------------------------------------------------------------------------

/**
 * Retourne true si le schéma représente une union (oneOf ou anyOf avec plusieurs variantes).
 */
export function isUnionSchema(schema: JsonSchema): boolean {
  return (
    (Array.isArray(schema.oneOf) && schema.oneOf.length > 1) ||
    (Array.isArray(schema.anyOf) && schema.anyOf.length > 1)
  );
}

/**
 * Retourne les sous-schémas de la composition (oneOf prioritaire sur anyOf).
 */
export function getUnionVariants(schema: JsonSchema): JsonSchema[] {
  if (Array.isArray(schema.oneOf) && schema.oneOf.length > 1) {
    return schema.oneOf as JsonSchema[];
  }
  if (Array.isArray(schema.anyOf) && schema.anyOf.length > 1) {
    return schema.anyOf as JsonSchema[];
  }
  return [];
}
