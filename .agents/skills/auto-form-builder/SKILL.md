# auto-form-builder

Génération de formulaires par render-prop, compatible avec n'importe quel form manager via le pattern **FormAdapter**.

## Architecture

```
packages/auto-form-builder/src/
├── adapters/
│   ├── types.ts          # FormAdapter, FieldAPI, FormAPI
│   └── tanstack.tsx      # tanstackAdapter (TanStack Form réel)
├── auto-form-builder.tsx # Render-prop builder (adapter.FormProvider)
├── auto-form-field.tsx   # Rendu récursif (adapter.Field)
├── auto-form.tsx         # Composant AutoForm de haut niveau
├── types.ts              # AutoFormProps (adapter, schema, registry)
└── index.ts              # Exports
```

## Utilisation

```tsx
import { AutoForm } from "@code2-base-ui/auto-form-builder"
import { tanstackAdapter } from "@code2-base-ui/auto-form-builder/adapters"
import type { FieldRegistry } from "@code2-base-ui/json-schema-toolkit"

<AutoForm
  schema={jsonSchema}
  adapter={tanstackAdapter}
  registry={myRegistry}
  defaultValues={{ name: "John" }}
  onSubmit={(data) => console.log(data)}
/>
```

## API publique

| Export | Chemin | Description |
|---|---|---|
| `AutoForm` | `@code2-base-ui/auto-form-builder` | Composant haut niveau |
| `AutoFormBuilder` | `@code2-base-ui/auto-form-builder` | Render-prop builder |
| `AutoFormField` | `@code2-base-ui/auto-form-builder` | Rendu récursif |
| `tanstackAdapter` | `@code2-base-ui/auto-form-builder/adapters` | Adapter TanStack Form |
| `FormAdapter` | `@code2-base-ui/auto-form-builder/adapters` | Interface (type) |
| `FieldAPI` | `@code2-base-ui/auto-form-builder/adapters` | Interface champ (type) |
| `FormAPI` | `@code2-base-ui/auto-form-builder/adapters` | Interface formulaire (type) |

## FormAdapter pattern

Interface `FormAdapter` : 2 composants React.

```tsx
interface FormAdapter {
  name: string
  FormProvider: (props: FormProviderProps) => ReactNode
  Field: (props: FieldProps) => ReactNode
}
```

### FormProvider
Initialise le form manager, stocke l'instance dans un **contexte interne privé**.

```tsx
<adapter.FormProvider defaultValues={{}} onSubmit={fn}>
  {(formAPI) => children}
</adapter.FormProvider>
```

### Field
Render-prop standardisé.

```tsx
<adapter.Field name="email">
  {(field) => (
    <input
      value={field.value as string}
      onChange={(e) => field.onChange(e.target.value)}
      onBlur={field.onBlur}
    />
  )}
</adapter.Field>
```

### FieldAPI

```tsx
interface FieldAPI {
  value: unknown
  onChange: (value: unknown) => void
  onBlur: () => void
  error?: string
  isTouched: boolean
}
```

### FormAPI

```tsx
interface FormAPI {
  values: Record<string, unknown>
  errors: Record<string, string | undefined>
  handleSubmit: () => void
  reset: () => void
  isSubmitting: boolean
}
```

## Nouvel adapter

1. Créer `src/adapters/mon-adapter.tsx`
2. Implémenter `FormProvider` + `Field` avec le form manager choisi
3. Stocker l'instance dans un contexte interne (`createContext`)
4. Exporter depuis `src/adapters/index.ts`

## Tests

```bash
pnpm --filter @code2-base-ui/auto-form-builder test        # vitest run
pnpm --filter @code2-base-ui/auto-form-builder check-types # tsc --noEmit
pnpm --filter @code2-base-ui/auto-form-builder check       # Biome
```

## Dépendances

- `@code2-base-ui/json-schema-toolkit` — FieldMeta, FieldRegistry, traverseSchema, resolveSchema
- `@tanstack/react-form` — utilisé par l'adapter tanstack uniquement

## Conventions

- `verbatimModuleSyntax: true` — utiliser `import type` pour les types
- Tabulations pour l'indentation
- `"noUncheckedIndexedAccess": true` — accès tableau/index toujours `| undefined`
