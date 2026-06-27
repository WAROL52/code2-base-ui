# json-schema-toolkit — Design Document

## Objectif

Package d'outils copy-paste basé sur JSON Schema (à la shadcn/ui GitHub Registries), intégrant le Standard Schema. Prévoit un écosystème de génération automatique de formulaires (`auto-form`), tableaux (`auto-table`), etc.

## Stack

- **Runtime** : Node.js + navigateur (universel)
- **TypeScript** : Mode strict, `verbatimModuleSyntax`
- **JSON Schema** : `@sinclair/typebox` pour définition typée
- **Standard Schema** : `@standard-schema/spec` pour conformité
- **Tests** : vitest avec `expectTypeOf` pour les tests de types
- **Monorepo** : Nx + pnpm workspace

## Structure du package

```
packages/json-schema-toolkit/
  package.json
  tsconfig.json
  vitest.config.ts
  src/
    index.ts              # exports publiques
    types.ts              # JsonSchema, FieldMeta, ValidationResult, etc.
    core/
      index.ts
      schema.ts           # Wrapper TypeBox + Standard Schema conforme
    utils/
      index.ts
      flatfields.ts        # Aplatit les champs imbriqués
      entries.ts           # Extrait les entrées [key, meta][]
      from-entries.ts      # Reconstruit un schéma depuis des entrées
      group-by.ts          # Regroupe les champs par critère
      keys.ts              # Extrait les clés d'un schéma
      validate-schema.ts   # Valide un schéma contre Standard Schema
    registry/
      index.ts
      field-registry.ts    # FieldRegistry centralisé
    adapter/
      index.ts
      types.ts             # SchemaAdapter interface
  tests/
    types.test.ts          # Tests de types pure (expectTypeOf)
    core/
    utils/
    registry/
    adapter/
```

## Types fondamentaux

```ts
interface JsonSchema {
  type?: string | string[];
  format?: string;
  properties?: Record<string, JsonSchema>;
  items?: JsonSchema;
  required?: string[];
  enum?: unknown[];
  const?: unknown;
  [key: string]: unknown;
}

interface ValidationResult {
  success: boolean;
  errors: ValidationError[];
}

interface ValidationError {
  path: string;
  message: string;
}

interface FieldMeta {
  path: string;
  type: string;
  format?: string;
  uiWidget?: string;
  required?: boolean;
  description?: string;
  defaultValue?: unknown;
  enum?: unknown[];
  properties?: Record<string, FieldMeta>;
}
```

## Core — Standard Schema Conformité

Utilise `@sinclair/typebox` (déjà compatible `StandardSchemaV1` depuis v0.33).

```ts
import type { StandardSchemaV1 } from "@standard-schema/spec";
import { type TSchema } from "@sinclair/typebox";

type StandardSchema = TSchema & StandardSchemaV1;
```

- `core/schema.ts` expose un wrapper qui garantit la conformité Standard Schema
- `validateStandard()` utilise `schema["~standard"].validate()`
- `toJsonSchema()` convertit TypeBox → JSON Schema brut
- `validateSchema()` utilise `~standard.validate()` en interne

## Utils

Chaque util prend un `JsonSchema` (ou un `TSchema` TypeBox) et retourne un résultat typé :

- `flatfields(schema, prefix?) → FieldMeta[]`
- `entries(schema) → [string, FieldMeta][]`
- `fromEntries(entries) → JsonSchema`
- `groupBy(schema, criteria) → Record<string, FieldMeta[]>`
- `keys(schema) → string[]`
- `validateSchema(schema, data) → ValidationResult`

## Adapter — SchemaAdapter

Interface d'adaptation entre JSON Schema et validateurs natifs :

```ts
interface SchemaAdapter<N = unknown> {
  readonly name: string;
  fromJsonSchema: (schema: JsonSchema) => N;
  toJsonSchema: (nativeSchema: N) => JsonSchema;
  validate: (nativeSchema: N, data: unknown) => ValidationResult;
}
```

Chaque adapter retourné doit exposer un `StandardSchemaV1` pour interopérabilité.

## Registry — FieldRegistry

Le `FieldRegistry` est conçu pour les environnements React (client et RSC). Il est exporté depuis `@code2-base-ui/json-schema-toolkit/registry`.

```ts
type RegistrySelector = {
  type?: string;
  format?: string;
  widget?: string;
};

type GroupCriteria = {
  by: "type" | "format" | "required" | ((field: FieldMeta) => string);
};

type FieldComponent<TProps = unknown> = React.ComponentType<TProps>;

type RegistryEntry = {
  selector: RegistrySelector;
  component: FieldComponent;
  priority: number;
};
```

- Enregistrement par sélecteur (type + format + widget)
- Résolution par priorité décroissante
- Fallback component si aucun match
- Résolution basée sur les clés uniques du sélecteur

## Tests

Ordre d'écriture :
1. `types.test.ts` — tests TypeScript purs avec `expectTypeOf` (sans runtime)
2. `core/` — vérification Standard Schema + TypeBox roundtrip
3. `utils/` — tests unitaires de chaque util
4. `registry/` — tests du FieldRegistry
5. `adapter/` — tests des adapters

## Exports du package

```json
{
  "exports": {
    ".": "./src/index.ts",
    "./core": "./src/core/index.ts",
    "./utils": "./src/utils/index.ts",
    "./registry": "./src/registry/index.ts",
    "./adapter": "./src/adapter/index.ts"
  }
}
```

## Documentation future

La documentation du package sera intégrée à Fumadocs (`apps/fumadocs`) avec sections :
- Installation et configuration
- Guide Standard Schema
- API reference (types, utils, registry, adapters)
- Création d'adapters personnalisés
- Exemples
