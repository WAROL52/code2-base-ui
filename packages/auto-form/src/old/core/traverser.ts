// =============================================================================
// JSON Schema Toolkit — Traverser
// Conversion d'un ResolvedSchema en tableau plat de FieldMeta[].
// Zéro dépendance externe.
// =============================================================================

import { getUnionVariants, isUnionSchema, normalizeUnion } from "./normalizer";
import type { FieldMeta, JsonSchema, ResolvedSchema } from "./types";
import {
  getConstraints,
  getDefaultValue,
  getEnum,
  getKind,
  getLabel,
  getType,
  getUiOptions,
} from "./utils";

// ---------------------------------------------------------------------------
// Traversal récursif
// ---------------------------------------------------------------------------

/**
 * Transforme un nœud JsonSchema en FieldMeta.
 * Appelée récursivement pour les objets, tableaux et unions.
 *
 * @param schema     - Le schéma du champ courant (déjà résolu, sans $ref)
 * @param name       - Nom du champ courant
 * @param path       - Chemin pointé (ex: "user.address.city")
 * @param required   - true si le champ est requis par son parent
 */
function schemaToFieldMeta(
  schema: JsonSchema,
  name: string,
  path: string,
  required: boolean,
): FieldMeta {
  const type = getType(schema);
  const kind = getKind(schema);
  const uiOpts = getUiOptions(schema);

  const base: FieldMeta = {
    path,
    name,
    type,
    kind,
    required,
    label: getLabel(schema, name),
    description: schema.description,
    placeholder: uiOpts.placeholder,
    format: schema.format,
    uiWidget: uiOpts.widget,
    uiHidden: uiOpts.hidden,
    uiReadonly: uiOpts.readonly,
    uiOrder: uiOpts.order,
    enum: getEnum(schema),
    defaultValue: getDefaultValue(schema),
    constraints: getConstraints(schema),
    resolvedSchema: schema,
  };

  // --- Object : récursion sur les propriétés ---
  if (kind === "object" && schema.properties) {
    const requiredFields = new Set(schema.required ?? []);
    const props = schema.properties as Record<string, JsonSchema>;

    let children = Object.entries(props).map(([childName, childSchema]) =>
      schemaToFieldMeta(
        childSchema,
        childName,
        path ? `${path}.${childName}` : childName,
        requiredFields.has(childName),
      ),
    );

    // Tri par uiOrder si présent
    children = children.sort(
      (a, b) => (a.uiOrder ?? 9999) - (b.uiOrder ?? 9999),
    );

    return { ...base, children };
  }

  // --- Array : description des items ---
  if (kind === "array") {
    // items peut être un unique schéma ou un tableau (tuple)
    if (schema.items && !Array.isArray(schema.items)) {
      const itemMeta = schemaToFieldMeta(
        schema.items as JsonSchema,
        "items",
        `${path}[]`,
        false,
      );
      return { ...base, itemMeta };
    }

    // Draft 2020-12 : prefixItems
    if (schema.prefixItems && schema.prefixItems.length > 0) {
      const itemMeta = schemaToFieldMeta(
        schema.prefixItems[0],
        "items",
        `${path}[]`,
        false,
      );
      return { ...base, itemMeta };
    }

    return base;
  }

  // --- Union (oneOf / anyOf) : chaque variante → FieldMeta[] ---
  if (kind === "union") {
    const rawVariants = getUnionVariants(schema);
    const variantInfos = normalizeUnion(schema, rawVariants);

    const variants: FieldMeta[][] = variantInfos.map((info) => {
      // Chaque variante est traitée comme un sous-schéma object
      const variantSchema: JsonSchema = {
        type: "object",
        title: info.label,
        ...info.schema,
      };

      // On crée un FieldMeta temporaire pour la variante et on retourne ses children
      const variantMeta = schemaToFieldMeta(
        variantSchema,
        info.label,
        path,
        required,
      );
      return variantMeta.children ?? [];
    });

    const discriminantKey = variantInfos[0]?.discriminantKey;

    return { ...base, variants, discriminantKey };
  }

  // --- Primitive ---
  return base;
}

// ---------------------------------------------------------------------------
// API publique
// ---------------------------------------------------------------------------

/**
 * Convertit un schéma résolu en tableau de FieldMeta.
 * Le schéma racine doit être de type "object".
 *
 * @param resolved - Résultat de resolveSchema()
 * @returns Tableau de FieldMeta représentant tous les champs de premier niveau
 */
export function traverseSchema(resolved: ResolvedSchema): FieldMeta[] {
  const { root } = resolved;

  // Support des schémas racines qui sont des unions
  if (isUnionSchema(root)) {
    const syntheticMeta = schemaToFieldMeta(root, "root", "", false);
    return [syntheticMeta];
  }

  // Schéma racine object (cas standard)
  if (root.type === "object" || root.properties) {
    const requiredFields = new Set(root.required ?? []);
    const props = (root.properties as Record<string, JsonSchema>) ?? {};

    let fields = Object.entries(props).map(([name, schema]) =>
      schemaToFieldMeta(schema, name, name, requiredFields.has(name)),
    );

    // Tri par uiOrder
    fields = fields.sort((a, b) => (a.uiOrder ?? 9999) - (b.uiOrder ?? 9999));

    return fields;
  }

  // Schéma racine non-object (ex: array, primitive) → wrappé dans un FieldMeta unique
  return [schemaToFieldMeta(root, "root", "root", false)];
}

/**
 * Retourne le FieldMeta d'un champ spécifique identifié par son path.
 * Supporte les chemins imbriqués (ex: "user.address.city").
 *
 * @param resolved - Résultat de resolveSchema()
 * @param path     - Chemin pointillet vers le champ (ex: "user.address")
 * @returns FieldMeta ou null si le champ n'existe pas
 */
export function getFieldMeta(
  resolved: ResolvedSchema,
  path: string,
): FieldMeta | null {
  const fields = traverseSchema(resolved);
  return findByPath(fields, path);
}

function findByPath(fields: FieldMeta[], path: string): FieldMeta | null {
  for (const field of fields) {
    if (field.path === path) return field;

    // Chercher dans les enfants (object)
    if (field.children) {
      const found = findByPath(field.children, path);
      if (found) return found;
    }

    // Chercher dans les variantes (union)
    if (field.variants) {
      for (const variant of field.variants) {
        const found = findByPath(variant, path);
        if (found) return found;
      }
    }
  }
  return null;
}
