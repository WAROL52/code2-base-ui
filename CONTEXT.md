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

### auto-form
Package unique `@code2-base-ui/auto-form` avec sous-chemins d'export.
Framework de génération automatique de formulaires. Architecture en couches :

**API publique (façade simple)** : `useForm()`, `useField()`, `<AutoForm>`, `<AutoField>`
**API interne (flexible, extensible)** : `createAutoForm(config)` — factory qui assemble :
- un SchemaProvider (extraction champs + validation)
- un FormStateAdapter (gestion état formulaire)
- un FieldRegistry (résolution composants de rendu)
- une LayoutStrategy (disposition des champs)

`createAutoForm` retourne un système complet prêt à l'emploi.
Le preset exporté par défaut utilise Zod + TanStack Form + shadcn.

### useForm()
Hook primitif d'état de formulaire. Expose valeurs, erreurs, soumission, dirty, touched.
Implémentation déléguée au FormStateAdapter (TanStack Form | RHF).

### useField(name)
Hook primitif pour un champ. Expose value, onChange, error, meta du champ.
Utilisé par AutoField en interne, disponible pour usage personnalisé.

### SchemaProvider
Abstraction d'un moteur de schéma. Interface : `fields → FieldMeta[]`,
`validate(data) → ValidationResult`, `toJson() → JsonSchema`.
Implémentations : ZodProvider (utilise `z.toJSONSchema()` de Zod v4),
TypeBoxProvider.

### z.toJSONSchema()
API native Zod v4+ qui convertit un schéma Zod en JSON Schema Draft 2020-12.
Génère `title`, `description`, `format`, `enum`, `required`, `minLength`,
etc. à partir des contraintes Zod + `.meta({ title, description })`.

Le ZodProvider l'utilise pour produire le `jsonSchema` brut, puis `flatfields()`
extrait les `FieldMeta` et enrichit avec `label` (depuis `title`) et
`uiWidget: "select"` (auto-détecté si `enum` présent).

### FormStateAdapter
Abstraction d'un moteur d'état de formulaire. Interface : useForm, useField, submit.
Implémentations : TanStackFormAdapter, RHFAdapter.
Permet d'interchanger le moteur sans changer le code utilisateur.

### LayoutStrategy
Stratégie de disposition des champs dans le mode auto-généré.
Par défaut : colonne unique dans l'ordre du schéma. Extensible.

### AutoForm
Composant final qui encapsule tout (Context Provider + layout + soumission).
Un des outputs de `createAutoForm()`. L'utilisateur final utilise AutoForm/AutoField.

### AutoForm (preset)
Export par défaut du package : `createAutoForm({ zod, tanstack, shadcn, column })`.
Prêt à l'emploi. L'utilisateur avancé peut créer son propre auto-form via createAutoForm.

### FieldMeta
Métadonnées d'un champ de formulaire. Inclut `path`, `type`, `format`,
`label` (toujours présent, dérivé du `title` JSON Schema ou humanisé du path),
`description` (helper text), `required`, `enum`, `uiWidget`, `defaultValue`.

### humanizePath
Fonction utilitaire dans json-schema-toolkit qui transforme un `path` machine
en label lisible : camelCase ET snake_case → Title Case.
Exemple : `"shippingAddressStreet"` → `"Shipping Address Street"`.

Utilisée comme fallback par tous les providers quand le schéma n'a pas de `title`.

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
