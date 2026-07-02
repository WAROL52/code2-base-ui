# Design: Extraction des adapters FormAdapter dans des packages séparés

## Résumé

Extraire les implémentations de `FormAdapter` de `auto-form-builder` vers des packages dédiés (`auto-form-adapter-*`). `auto-form-builder` ne conserve que l'interface `FormAdapter` (types) et perd toute dépendance runtime à un form manager.

## Motivation

Le seam `FormAdapter` est actuellement "hypothétique" (1 seule implémentation, `tanstackAdapter`, directement dans le package). Avec l'arrivée de 2 nouveaux adapters (RHF, Formisch), le seam devient réel. La bonne pratique est de posséder le seam (l'interface) là où il est consommé, et de placer chaque implémentation dans son propre package.

Bénéfices :
- `auto-form-builder` ne pèse que les types et le render-prop — pas de dépendance `@tanstack/react-form`
- Chaque adapter est versionnable indépendamment
- Le seam est concrètement réel : l'utilisateur importe explicitement l'adapter qu'il veut depuis son package

## Changements

### 1. Nouveaux packages

```
packages/auto-form-adapter-tanstack/   ← tanstack.tsx extrait
packages/auto-form-adapter-rhf/        ← (à créer quand implémenté)
packages/auto-form-adapter-formisch/   ← (à créer quand implémenté)
```

Chaque package :
- `package.json` : dépend de `@code2-base-ui/auto-form-builder: workspace:*` (pour les types) + le form manager cible
- `tsconfig.json` : extends `@code2-base-ui/config`
- `tests/` : tests de l'adapter (déplacés depuis `auto-form-builder/tests/adapters/`)
- `src/index.ts` : exporte l'adapter + re-exporte les types si pertinent

### 2. auto-form-builder — modifications

**`package.json`** : supprimer `@tanstack/react-form` des dependencies

**`src/adapters/index.ts`** :
```ts
// Avant
export { tanstackAdapter } from "./tanstack";
export type { FieldAPI, FieldError, FormAdapter, FormAPI } from "./types";

// Après
export type { FieldAPI, FieldError, FormAdapter, FormAPI } from "./types";
```

**`src/index.ts`** : supprimer `export { tanstackAdapter } from "./adapters/tanstack"`

**Ne change pas** : `AutoForm`, `AutoFormBuilder`, `AutoFormField`, handlers, layout, types.

### 3. Tests auto-form-builder

**`tests/auto-form.test.tsx`** : remplacer `import { tanstackAdapter }` par un **mock adapter** qui implémente `FormAdapter` avec `useState` (pas de vraie librairie) — pour découpler les tests de tout form manager. Le mock doit supporter `defaultValues`, `handleSubmit` (appelle `onSubmit`), `Field` (render-prop avec `value`/`onChange`), et `reset`.

**`tests/adapters/tanstack.test.tsx`** : déplacé vers `packages/auto-form-adapter-tanstack/tests/`

**`tests/adapters/types.test.tsx`** : reste dans auto-form-builder (teste l'interface, pas une implémentation)

### 4. Imports utilisateur

```tsx
// Avant
import { AutoForm, tanstackAdapter } from "@code2-base-ui/auto-form-builder";

// Après
import { AutoForm } from "@code2-base-ui/auto-form-builder";
import { tanstackAdapter } from "@code2-base-ui/auto-form-adapter-tanstack";
```

## Non-changements

- L'interface `FormAdapter` reste la même
- Les composants `AutoForm`, `AutoFormBuilder`, `AutoFormField` ne changent pas
- Les handlers (object, array, union, leaf) ne changent pas
- Le layout system ne change pas

## Arbre final (tanstack seulement — RHF et Formisch suivront)

```
packages/
  auto-form-builder/
    src/
      adapters/types.ts         ← FormAdapter, FieldAPI, FormAPI
      adapters/index.ts          ← exports seulement les types
      auto-form.tsx              ← inchangé
      auto-form-builder.tsx      ← inchangé
      auto-form-field.tsx        ← inchangé
      handlers/                  ← inchangé
      layout/                    ← inchangé
      index.ts                   ← n'exporte plus tanstackAdapter
    tests/
      adapters/types.test.ts     ← gardé
      auto-form.test.tsx         ← mock adapter au lieu de tanstack

  auto-form-adapter-tanstack/
    src/
      tanstack.tsx               ← extrait de auto-form-builder
      index.ts                   ← export { tanstackAdapter }
    tests/
      tanstack.test.tsx          ← déplacé depuis auto-form-builder
    package.json
    tsconfig.json
```

## Risques

- **Rupture** : tout projet qui importe `tanstackAdapter` depuis `@code2-base-ui/auto-form-builder` doit changer l'import. Solution : mettre à jour les apps du monorepo (`apps/web`, `apps/fumadocs`) dans le même commit.
- **Tests** : le mock adapter dans `auto-form.test.tsx` doit reproduire le comportement exact de `tanstackAdapter` pour les aspects testés (submit, values, reset).
