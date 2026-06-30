# code2-base-ui — Guide pour OpenCode (🇫🇷)

> **Workflow création de package :** voir [PACKAGE-WORKFLOW.md](./PACKAGE-WORKFLOW.md)
> **Skill dédiée :** `/new_package <name> : <description>` — `.agents/skills/new-package/SKILL.md`
> **auto-form-builder :** `.agents/skills/auto-form-builder/SKILL.md`

Monorepo **Better-T-Stack** orchestré par **Nx** + **pnpm workspaces**.

## Architecture

- `apps/web` — Next.js 16 (port 3001), React 19, TailwindCSS v4, oRPC, AI SDK, PWA
- `apps/tui` — OpenTUI (React), s'exécute avec `bun`
- `apps/fumadocs` — Documentation Fumadocs (Next.js, port 4000)
- `packages/ui` — Composants shadcn/ui partagés (style `base-lyra`)
- `packages/api` — Procédures oRPC (routage type-safe)
- `packages/config` — `tsconfig.base.json` partagé
- `packages/env` — Validation d'environnement avec `@t3-oss/env` (split `server.ts` / `web.ts`)
- `packages/json-schema-toolkit` — Outils copy-paste basés sur JSON Schema (Standard Schema, TypeBox, FieldRegistry, SchemaAdapter)
- `packages/auto-form-builder` — Génération de formulaires par render-prop (FormAdapter pattern, TanStack Form)

## Commandes essentielles

```bash
pnpm dev                  # Tous les apps en mode dev
pnpm dev:web              # web seulement
pnpm dev:tui              # tui seulement (bun)
pnpm build                # Build toute la stack
pnpm check-types          # TypeScript — tous les projets
pnpm check                # ultracite check (lint + format)
pnpm fix                  # ultracite fix (auto-correct)
```

## Formatting & linting

- **Ultracite** (Biome) — exécuté automatiquement en pre-commit (Husky)
- Hook Claude : `pnpm run fix --skip=correctness/noUnusedImports` après chaque écriture de fichier
- VS Code : Biome comme formateur par défaut pour tous les langages supportés
- Indentation : tabulations (config Biome)
- Quotes : doubles en JS/TS

## json-schema-toolkit

Package `@code2-base-ui/json-schema-toolkit` — écosystème d'outils copy-paste JSON Schema.

### Structure

```
packages/json-schema-toolkit/src/
├── index.ts          # Exports principaux (.)
├── types.ts          # JsonSchema, FieldMeta, ValidationResult
├── core/schema.ts    # Standard Schema + TypeBox bridge
├── utils/            # flatfields, entries, fromEntries, groupBy, keys, validateSchema
├── registry/         # FieldRegistry (React)
└── adapter/types.ts  # SchemaAdapter interface
```

### Sous-chemins d'import

```ts
import { ... } from "@code2-base-ui/json-schema-toolkit"         // principal
import { ... } from "@code2-base-ui/json-schema-toolkit/core"    // core/schema.ts
import { ... } from "@code2-base-ui/json-schema-toolkit/utils"   // utilitaires
import { ... } from "@code2-base-ui/json-schema-toolkit/registry" // FieldRegistry
import type { ... } from "@code2-base-ui/json-schema-toolkit/adapter" // SchemaAdapter
```

### Tests

```bash
pnpm --filter @code2-base-ui/json-schema-toolkit test       # vitest run
pnpm --filter @code2-base-ui/json-schema-toolkit check-types # tsc --noEmit
```

- Tests de types avec `expectTypeOf` (vitest)
- TDD types-first : `expectTypeOf` avant implémentation
- TypeBox v0.34 comme backend Standard Schema (wrapper `createStandardSchema`)
- `FieldRegistry` dépend de React (peerDependency optionnelle)

### Documentation Fumadocs

Pages dans `apps/fumadocs/content/docs/json-schema-toolkit/` :
index, installation, core, utils, registry, adapter, api-reference.

## auto-form-builder

Package `@code2-base-ui/auto-form-builder` — génération de formulaires par render-prop, compatible avec n'importe quel form manager via le pattern **FormAdapter**.

### Architecture

```
packages/auto-form-builder/src/
├── adapters/
│   ├── types.ts          # FieldAPI, FormAPI, FormAdapter
│   └── tanstack.tsx      # tanstackAdapter (TanStack Form)
├── auto-form-builder.tsx # Render-prop builder (wrapper adapter.FormProvider)
├── auto-form-field.tsx   # Rendu récursif des champs (via adapter.Field)
├── auto-form.tsx         # Composant AutoForm de haut niveau
├── types.ts              # AutoFormProps simplifiés
└── index.ts              # Exports
```

### FormAdapter pattern

```ts
import { AutoForm } from "@code2-base-ui/auto-form-builder"
import { tanstackAdapter } from "@code2-base-ui/auto-form-builder/adapters"

<AutoForm schema={mySchema} adapter={tanstackAdapter} registry={myRegistry} />
```

Interface `FormAdapter` (2 composants React) :
- **FormProvider** — initialise le form manager, stocke l'instance dans un contexte interne privé
- **Field** — render-prop standardisé avec `{ value, onChange, onBlur, error, isTouched }`

Ajouter un nouveau form manager = créer 1 fichier `src/adapters/mon-adapter.tsx`.

### Tests

```bash
pnpm --filter @code2-base-ui/auto-form-builder test
pnpm --filter @code2-base-ui/auto-form-builder check-types
pnpm --filter @code2-base-ui/auto-form-builder check
```

- vitest + jsdom + @testing-library/react
- 18 tests

## Particularités techniques

- **oRPC** : le routeur central est dans `packages/api/src/routers/index.ts`. Les procédures utilisent `publicProcedure` (défini dans `packages/api/src/index.ts`). Contexte défini dans `context.ts`.
- **shadcn/ui** : les composants partagés vivent dans `packages/ui`. Pour en ajouter : `npx shadcn@latest add <composant> -c packages/ui`. Import : `import { Button } from "@code2-base-ui/ui/components/button"`.
- **Environnement** : la validation t3-env est importée en premier dans `next.config.ts` (`import "@code2-base-ui/env/web"`). Pendant le build Docker, passer `SKIP_ENV_VALIDATION=1`.
- **TypeScript** : `verbatimModuleSyntax: true` — toujours utiliser `import type` pour les types. `noUncheckedIndexedAccess: true` — accès tableau/index toujours `| undefined`.
- **PWA** : support PWA inclus (configuré via le template Better-T-Stack).
- **React Compiler** : activé dans `next.config.ts` (`reactCompiler: true`). Babel plugin en dépendance.

## Tests

- `@code2-base-ui/json-schema-toolkit` — vitest (44 tests, types-first avec `expectTypeOf`)
- `@code2-base-ui/auto-form-builder` — vitest (18 tests, TDD)
- `pnpm test` — pas de commande racine définie (le hook Husky lance `pnpm test` sans effet)

## Docker

```bash
pnpm docker:build   # docker compose build
pnpm docker:up      # up -d --build
pnpm docker:down    # down
pnpm docker:logs    # logs -f
```

Le Dockerfile utilise une build multi-stage avec Next.js standalone output. `SKIP_ENV_VALIDATION=1` est requis pendant la phase de build.

## Conventions repo

- `verbatimModuleSyntax` — penser à `import type`
- Pas de barrel files `index.ts` réexporteurs dans les apps — importer directement depuis les fichiers sources
- Les packages avec sous-chemins d'export (`json-schema-toolkit`) utilisent des `index.ts` pour les exports de sous-chemins
- L'IA SDK Vercel est disponible dans `apps/web` avec `@ai-sdk/google` et `@ai-sdk/react`
- Les routes Next.js utilisent `typedRoutes: true`

## Vercel

- Projet : `code2-base-ui` → https://code2-base-ui.vercel.app
- Déploie actuellement **Fumadocs** (`apps/fumadocs`)
- `rootDirectory` configuré sur `apps/fumadocs` (via l'API — pas dans `vercel.json`)
- Build : `cd ../.. && npx nx build fumadocs`
