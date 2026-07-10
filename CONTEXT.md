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

### auto-form-builder
Package `@code2-base-ui/auto-form-builder` — framework de génération automatique
de formulaires basé sur le pattern **FormAdapter** (render-prop, découplé de tout
form manager). Architecture en couches :

**API publique :** `<AutoForm>` (haut niveau), `<AutoFormBuilder>` (render-prop),
`<AutoFormField>` (dispatcher récursif), `createShadcnRegistry()` (composants).

### FormAdapter
Interface de branchement d'un moteur de formulaire. Définie par 2 composants React :
- **FormProvider** — initialise le form manager, expose `FormAPI` via render-prop
- **Field** — render-prop standardisé `{ value, onChange, onBlur, error, isTouched }`

Interface minimale et agnostique (3 champs : `name`, `FormProvider`, `Field`).

Implémentations disponibles dans `auto-form-builder/src/adapters/` :
- `tanstackAdapter` — `@tanstack/react-form`
- `rhfAdapter` — `react-hook-form`
- `formischAdapter` — `@formisch/react`

### FormAPI
Interface d'état de formulaire exposée par FormProvider :
`values`, `isSubmitting`, `handleSubmit()`, `reset()`, `appendFieldValue()`, `removeFieldValue()`.

### FieldAPI
Interface d'un champ exposée par Field :
`value`, `onChange()`, `onBlur()`, `error`, `isTouched`.

### AutoForm
Composant React haut niveau qui assemble `AutoFormBuilder` + `FormLayout` + handlers.
Props : `schema`, `adapter`, `registry`, `layout` (default: shadcnLayout), `onSubmit`.

### AutoFormBuilder
Render-prop builder. Prend un `schema` et un `adapter`, résout le schéma en
`FieldMeta[]`, initialise le form manager, et expose `{ fields, form, resolvedSchema }`
à son children render-prop.

### AutoFormField
Dispatcher récursif qui route un `FieldMeta` vers le handler approprié selon
son `kind` : `object` → ObjectFieldHandler, `array` → ArrayFieldHandler,
`union` → UnionFieldHandler, `primitive` → LeafFieldHandler + `FieldRegistry`.

### Handlers (object, array, union, leaf)
- **ObjectFieldHandler** — itère `fieldMeta.children` et les rend via `renderField`
- **ArrayFieldHandler** — lit les valeurs depuis `formAPI.values[path]`, génère
  des `FieldMeta` indexés (`path[0]`, `path[1]`, etc.), expose add/remove
- **UnionFieldHandler** — sélecteur de variante avec `useState`, rend la variante
  sélectionnée
- **LeafFieldHandler** — résout le composant depuis `FieldRegistry`, le rend
  dans `<adapter.Field>` en passant `value`, `onChange`, `error`, etc.

### FormLayout
Interface de disposition des champs (7 composants optionnels) :
`FieldSet`, `FieldGroup`, `FieldLegend`, `FieldDescription`,
`ObjectField`, `ArrayField`, `CompositionsField`, `SubmitButton`.

`shadcnLayout` est l'implémentation par défaut (basée sur `@code2-base-ui/ui/components/field`).

### FieldRegistry
Registre React **agnostique** de résolution de composants par sélecteur
(type, format, widget). Partie de `@code2-base-ui/json-schema-toolkit`.
Ne dépend pas de shadcn — utilisable avec ou sans packages/ui.

### mockAdapter
Implementation de test de `FormAdapter` utilisant `useState` comme backend.
Exporté depuis `@code2-base-ui/auto-form-builder/testing`. Utilisé par les 115
tests du package et disponible pour les consumers externes qui veulent tester
leurs composants sans dépendre d'un vrai form manager.

### FieldComponentProps
Interface des props passées à chaque composant de champ :
`value`, `onChange`, `error`, `label`, `id`, `disabled`, `placeholder`, `field`, `className`.
Utilisée par `createShadcnRegistry()` et ses composants (ShadcnTextField,
ShadcnNumberField, ShadcnEnumField, ShadcnBooleanField, ShadcnSwitchField,
ShadcnTextareaField).

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
