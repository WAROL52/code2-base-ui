# code2-base-ui — Modèle de Domaine

## Domaine central

Toolkit de composants UI modulaire, distribué via GitHub Registries (shadcn).

## Termes du glossaire

### base-lyra
Style des composants shadcn. `base` = bibliothèque de primitives (Base UI),
`lyra` = thème visuel. Preset code : `b1Zh5UdPM`.

### packages/ui
Composants shadcn statiques (button, card, input, etc.). Style `base-lyra`.
Sans logique métier — pures primitives d'interface.

### json-schema-toolkit
Package d'outils copy-paste basé sur JSON Schema.
Contient les briques pour générer des UI dynamiques (formulaires, tableaux) à
partir de schémas. Indépendant de packages/ui.

### auto-form (futur)
Package prévu qui fera le pont entre json-schema-toolkit et packages/ui.
Consommera les schémas via json-schema-toolkit et rendra des composants shadcn.

### FieldRegistry
Registre React **agnostique** de résolution de composants par sélecteur
(type, format, widget). Partie de json-schema-toolkit.
Ne dépend pas de shadcn — utilisable avec ou sans packages/ui.

### SchemaAdapter
Interface d'intégration de validateurs externes dans l'écosystème.
Permet de brancher n'importe quel moteur de validation (Zod, TypeBox, Ajv, etc.).

### packages/api
Procédures oRPC. Actuellement un scaffold minimal (healthCheck + Context).
Le routeur et le builder (`publicProcedure`) sont génériques et distribuables ;
les futures procédures métier seront spécifiques aux apps.

### packages/env
Validation d'environnement avec `@t3-oss/env-nextjs`.
Utilitaire d'infrastructure interne, pas destiné à la distribution.
Divisé en `server.ts` et `web.ts` pour séparer les secrets des clés publiques.

### packages/config
`tsconfig.base.json` partagé par tous les packages du monorepo.

### apps/web
Application Next.js 16 — produit ET démonstration du toolkit.
Port 3001. React 19, TailwindCSS v4, oRPC, AI SDK, PWA.

### apps/tui
Application OpenTUI — terminal UI (React), exécutée avec Bun.
Produit ET démonstration.

### apps/fumadocs
Site de documentation. Déployé sur Vercel.
Documente tous les packages du toolkit.

### GitHub Registry (shadcn)
Mécanisme de distribution de code via `npx shadcn@latest add WAROL52/code2-base-ui/<item>`.
Défini dans `registry.json` à la racine. **Ne pas confondre avec FieldRegistry**.

> **⚠️ Distinction importante :** `FieldRegistry` (dans json-schema-toolkit) est un registre
> React de *composants* résolus par sélecteur. Le `GitHub Registry` est un mécanisme
> de *distribution* de fichiers. Même mot, concepts différents.

### Package Creation Workflow
Processus standard pour créer un nouveau package : design (brainstorming → spec → plan)
→ implémentation TDD (tests d'abord) → documentation Fumadocs en parallèle
→ vérification (tests + type check + build) → intégration (registry.json + CONTEXT.md + AGENTS.md).
Documenté dans `PACKAGE-WORKFLOW.md`.
Skill dédiée : `/new_package` dans `.agents/skills/new-package/SKILL.md`.
Utilise les MCP servers nx, shadcn, better-t-stack pour automatiser les étapes.
