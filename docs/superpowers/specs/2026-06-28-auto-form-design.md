# auto-form — Design Document

## Objectif

Framework de génération automatique de formulaires à partir de schémas (Zod, TypeBox, Standard Schema). Architecture en couches :

```
Schema → auto-form (createAutoForm) → Fields + Validation + Submission
```

Le coeur est une **factory** `createAutoForm(config)` qui assemble des briques interchangeables (SchemaProvider, FormStateAdapter, FieldRegistry, LayoutStrategy) en un système cohérent. Le preset par défaut est pré-configuré pour Zod + TanStack Form + shadcn.

## Principes

- **Indépendant** du moteur de schéma, du moteur de rendu, de la librairie UI
- **Hooks-first** : `useForm()`, `useField()` comme API primitives
- **Composé** : `<AutoForm>` encapsule hooks + context + layout
- **Extensible** : `createAutoForm()` permet de créer son propre système
- **Distribution primaire** : GitHub Registry (copy-paste, contrôle total)
- **Distribution secondaire** : packages npm pour ceux qui préfèrent

## Architecture

```
createAutoForm(config)
  │
  ├── SchemaProvider          → extraction champs + validation
  ├── FormStateAdapter        → gestion état formulaire
  ├── FieldRegistry           → résolution composants de rendu
  └── LayoutStrategy          → disposition des champs
      │
      ▼
  { useForm, useField, useFormContext, AutoForm, AutoField }
```

### SchemaProvider

Abstraction d'un moteur de schéma. Prend un schéma natif (Zod, TypeBox) et produit :
- `fields: FieldMeta[]` — métadonnées des champs extraites
- `jsonSchema: JsonSchema` — schéma converti en JSON Schema
- `validate(data) → ValidationResult` — validation des données
- `getFieldMeta(path) → FieldMeta | undefined` — métadonnée d'un champ

Implémentations :
- `ZodProvider` — wrapper autour de `z.schema.parse()` / `.safeParse()`
- `TypeBoxProvider` — wrapper autour de TypeBox + Standard Schema

`SchemaProvider` utilise `SchemaAdapter` (json-schema-toolkit) en interne pour la conversion JSON Schema.

### FormStateAdapter

Abstraction d'un moteur d'état de formulaire :

```ts
interface FormStateAdapter {
  name: string
  useForm: (config: {
    defaultValues: Record<string, unknown>
    validate: (data: unknown) => ValidationResult
  }) => FormAPI
  useField: (name: string) => FieldController
}
```

Où :
```ts
interface FormAPI {
  values: Record<string, unknown>
  errors: Record<string, string | undefined>
  submit: (e: FormEvent) => void
  reset: () => void
  dirty: boolean
  isSubmitting: boolean
  fields: Record<string, FieldController>
}
```

```ts
interface FieldController {
  value: unknown
  onChange: (value: unknown) => void
  onBlur: () => void
  error?: string
  touched: boolean
}
```

Implémentations :
- `TanStackFormAdapter` — wrapper autour de `@tanstack/react-form`
- `RHFAdapter` — wrapper autour de `react-hook-form`

### FieldRegistry

Utilise le `FieldRegistry` de `json-schema-toolkit` pour résoudre le composant de rendu par sélecteur (type, format, widget).

### LayoutStrategy

Stratégie de disposition des champs en mode auto-généré. Par défaut : colonne unique dans l'ordre du schéma.

## API Factory (createAutoForm)

```ts
function createAutoForm(config: {
  provider: SchemaProviderFactory
  form: FormStateAdapter
  registry: FieldRegistry
  layout?: LayoutStrategy
}): {
  useForm: () => FormAPI
  useField: (name: string) => FieldController
  useFormContext: () => FormContext | null
  AutoForm: React.ComponentType<AutoFormProps>
  AutoField: React.ComponentType<AutoFieldProps>
  AutoFormProvider: React.ComponentType<{ children: React.ReactNode }>
}
```

Le `provider` dans la factory est une *factory fonction* (pas une instance). Le schéma concret est passé au moment du rendu :

```tsx
const { AutoForm, AutoField, useForm, useField } = createAutoForm({
  provider: zodProvider,       // SchemaProviderFactory
  form: tanstackFormAdapter,   // FormStateAdapter
  registry: shadcnRegistry,    // FieldRegistry
})

// Utilisation
<AutoForm schema={myZodSchema} onSubmit={handleSubmit} />
```

### SchemaProviderFactory

```ts
interface SchemaProviderFactory {
  name: string
  create: <T>(schema: T) => SchemaProvider<T>
}
```

### AutoFormProps

```ts
interface AutoFormProps<TSchema> {
  schema: TSchema
  onSubmit?: (data: unknown) => void | Promise<void>
  defaultValues?: Record<string, unknown>
  children?: React.ReactNode       // mode composé
  layout?: LayoutStrategy           // override du layout
  className?: string
}
```

- Sans `children` : rend tous les champs automatiquement
- Avec `children` : rend uniquement les enfants (mode composé)

## Règles de sélection des composants (preset shadcn)

| Composant | type | format | widget | Condition |
|-----------|------|--------|--------|-----------|
| InputField | string | — | — | défaut |
| InputField | string | email | — | |
| InputField | string | url | — | |
| InputField | string | tel | — | |
| InputField | string | password | — | |
| InputField | number | — | — | |
| TextareaField | string | — | textarea | |
| SelectField | string | — | select | (piloté par widget) |
| SelectField | number | — | select | (piloté par widget) |
| CheckboxField | boolean | — | — | |
| RadioGroupField | string | — | radio | (piloté par widget) |
| SwitchField | boolean | — | switch | (piloté par widget) |
| SliderField | number | — | slider | (si min/max présents ou widget) |
| OtpField | string | — | otp | (piloté par widget) |
| DatePickerField | string | date | — | |
| DatePickerField | string | date-time | — | |
| FieldGroup | object | — | collapse | wrapper récursif avec collapse |
| ArrayField | array | — | — | bouton ajouter/supprimer |

## Package structure (monorepo)

```
packages/
├── auto-form/                         # Core pur (0 dep externe sauf react peer)
│   ├── package.json                   # peer: react, json-schema-toolkit
│   ├── src/
│   │   ├── index.ts                   # createAutoForm + exports
│   │   ├── core/
│   │   │   ├── types.ts              # SchemaProvider, FormStateAdapter, LayoutStrategy, FormAPI, FieldController
│   │   │   ├── context.tsx           # React Context (AutoFormContext)
│   │   │   └── factory.ts           # createAutoForm()
│   │   └── presets/
│   │       └── default.ts            # createAutoForm({ zod, tanstack, shadcn }) — juste la factory
│
├── auto-form-provider-zod/           # ZodProvider (implémente SchemaProvider)
│   ├── package.json                  # peer: zod, auto-form
│   └── src/index.ts                  # ZodProvider + zodProvider
│
├── auto-form-provider-typebox/       # TypeBoxProvider
│   ├── package.json                  # peer: typebox, auto-form
│   └── src/index.ts                  # TypeBoxProvider + typeboxProvider
│
├── auto-form-adapter-tanstack/       # TanStackFormAdapter
│   ├── package.json                  # peer: @tanstack/react-form, auto-form
│   └── src/index.ts                  # TanStackFormAdapter + tanstackFormAdapter
│
├── auto-form-adapter-rhf/            # RHFAdapter
│   ├── package.json                  # peer: react-hook-form, auto-form
│   └── src/index.ts                  # RHFAdapter + rhfAdapter
│
├── auto-form-render-shadcn/          # FieldRegistry shadcn fields
│   ├── package.json                  # peer: auto-form, packages/ui
│   └── src/index.ts                  # createShadcnRegistry()
│
└── preset/
    └── auto-form-tanstack-shadcn/    # Preset complet
        ├── package.json              # depends: tous les packages ci-dessus
        └── src/index.ts              # export { createAutoForm, AutoForm, AutoField, useForm, useField }
```

## GitHub Registry items

```
WAROL52/code2-base-ui/
│
├── auto-form-core              → core types + factory + context (lib/auto-form/)
├── auto-form-zod-provider      → ZodProvider (lib/auto-form/providers/)
├── auto-form-tanstack-adapter  → TanStackFormAdapter (lib/auto-form/adapters/)
├── auto-form-shadcn-registry   → FieldRegistry shadcn (lib/auto-form/render/)
├── auto-form-context           → useForm, useField hooks (hooks/use-auto-form.ts)
│
├── auto-form-input-field       → InputField (components/ui/auto-form-input-field.tsx)
├── auto-form-textarea-field    → TextareaField
├── auto-form-select-field      → SelectField
├── auto-form-checkbox-field    → CheckboxField
├── auto-form-radio-group-field → RadioGroupField
├── auto-form-switch-field      → SwitchField
├── auto-form-slider-field      → SliderField
├── auto-form-otp-field         → OtpField
├── auto-form-date-picker-field → DatePickerField
├── auto-form-field-group       → FieldGroup (object → collapse)
├── auto-form-array-field       → ArrayField
├── auto-form-auto-field        → AutoField (résout le bon composant via FieldRegistry)
│
└── auto-form-tanstack-shadcn   → Preset (registryDependencies vers les items requis)
```

## Composants UI requis (packages/ui)

Ajouter via `npx shadcn@latest add` :
- `field` — Field, FieldGroup, FieldSet, FieldLabel, FieldError, FieldDescription (base)
- `select` — shadcn select
- `switch` — shadcn switch
- `radio-group` — shadcn radio group
- `slider` — shadcn slider
- `input-otp` — shadcn input OTP
- `date-picker` — shadcn date picker
- `textarea` — shadcn textarea (ou custom)

## Dépendances externe

- `json-schema-toolkit` pour `FieldRegistry`, `SchemaAdapter`, `flatfields`, `FieldMeta`
- `@tanstack/react-form` pour TanStackFormAdapter (peer)
- `react-hook-form` pour RHFAdapter (peer)
- `zod` pour ZodProvider (peer)
- `@sinclair/typebox` pour TypeBoxProvider (peer)

## Non-goals (V1)

- Validation asynchrone (file upload, remote validation)
- Wizard / multi-step forms
- Drag-and-drop reordering
- Conditional fields (show/hide based on values)
- Field masking
- i18n / l10n

## Structure des tests

Par package, tests de types (`expectTypeOf`) avant tests runtime :
1. Types core (SchemaProvider, FormStateAdapter interfaces)
2. Factory (createAutoForm)
3. Context (AutoFormContext)
4. Providers (ZodProvider, TypeBoxProvider)
5. Adapters (TanStackFormAdapter, RHFAdapter)
6. Render shadcn (FieldRegistry registration)
7. Preset (integration)
