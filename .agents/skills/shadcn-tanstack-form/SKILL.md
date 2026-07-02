---
name: shadcn-tanstack-form
description: Use when implementing a TanStack Form adapter for the auto-form-builder FormAdapter interface, or when reading/modifying the existing tanstackAdapter. Triggers on "create tanstack adapter", "tanstack form adapter", "form adapter tanstack".
---

# shadcn-tanstack-form — TanStack Form Adapter

## Overview

Guide pour implémenter ou maintenir l'adaptateur `tanstackAdapter` (auto-form-builder) avec **TanStack Form**. L'implémentation de référence est dans `packages/auto-form-builder/src/adapters/tanstack.tsx`.

## Interface cible

```tsx
interface FormAdapter {
  name: string
  Field: ComponentType<FieldProps>        // form.Field
  FormProvider: ComponentType<FormProviderProps>  // useForm
}
```

### FormProvider → `useForm`

```tsx
interface FormProviderProps {
  children: (form: FormAPI) => ReactNode
  defaultValues?: Record<string, unknown>
  onSubmit?: (data: unknown) => void | Promise<void>
}
```

### Field → `form.Field` (render-prop)

```tsx
interface FieldProps {
  children: (field: FieldAPI) => ReactNode
  name: string
}

interface FieldAPI {
  value: unknown
  onChange: (value: unknown) => void
  onBlur: () => void
  error?: string | { message: string; type?: string; path?: string[] }
  isTouched: boolean
}
```

### FormAPI

```tsx
interface FormAPI {
  values: Record<string, unknown>
  handleSubmit: () => void
  reset: () => void
  isSubmitting: boolean
  appendFieldValue: (name: string, value: unknown) => void
  removeFieldValue: (name: string, index: number) => void
}
```

## Mappage TanStack Form → auto-form-builder

| Concept TanStack | Seam auto-form-builder |
|---|---|
| `useForm(opts)` | `FormProvider` — initialisation + contexte |
| `form.handleSubmit()` | `formAPI.handleSubmit` |
| `form.reset()` | `formAPI.reset` |
| `form.state.isSubmitting` | `formAPI.isSubmitting` |
| `form.state.values` | `formAPI.values` (getter, via cast) |
| `form.Field({ name, children })` | `<adapter.Field name={n}>` |
| `field.handleChange(v)` | `fieldAPI.onChange(v)` |
| `field.handleBlur()` | `fieldAPI.onBlur()` |
| `field.state.meta.errors` | `fieldAPI.error` (premier erreur) |
| `field.state.meta.isTouched` | `fieldAPI.isTouched` |
| `form.pushFieldValue(n, v)` | `formAPI.appendFieldValue(n, v)` |
| `form.removeFieldValue(n, i)` | `formAPI.removeFieldValue(n, i)` |
| `form.state.values` | `formAPI.values` (getter) |

## Implémentation de référence (existante)

Voir `packages/auto-form-builder/src/adapters/tanstack.tsx` — 91 lignes.

### Structure

1. **Types internes** — `TanStackField` et `TanStackFormValue` qui décrivent la forme de l'objet form retourné par `useForm()` (casté depuis le type opaque TanStack)
2. **Contexte privé** — `TanStackCtx` pour passer l'instance form au `Field`
3. **Objet `tanstackAdapter`** — 2 composants `FormProvider` et `Field`

### FormProvider

```tsx
FormProvider({ defaultValues, onSubmit, children }) {
  const form = useForm({
    defaultValues: defaultValues ?? {},
    validators: undefined,  // validation gérée par auto-form-builder
    onSubmit: ({ value }) => onSubmit?.(value),
  });

  const formAPI: FormAPI = {
    get values() { return form.state.values; },
    isSubmitting: form.state.isSubmitting,
    handleSubmit: () => form.handleSubmit(),
    reset: () => form.reset(),
    appendFieldValue: (name, value) =>
      (form as unknown as TanStackFormValue).pushFieldValue(name, value),
    removeFieldValue: (name, index) =>
      (form as unknown as TanStackFormValue).removeFieldValue(name, index),
  };

  return (
    <TanStackCtx.Provider value={form as unknown as TanStackFormValue}>
      {children(formAPI)}
    </TanStackCtx.Provider>
  );
}
```

### Field

```tsx
Field({ name, children }) {
  const form = useContext(TanStackCtx);
  if (!form) throw new Error("tanstackAdapter: missing FormProvider");

  return (
    <form.Field name={name}>
      {(field) => children({
        value: field.state.value,
        onChange: (val) => field.handleChange(val),
        onBlur: () => field.handleBlur(),
        error: field.state.meta.errors?.[0],
        isTouched: field.state.meta.isTouched,
      })}
    </form.Field>
  );
}
```

## Points d'attention

- **Cast opaque** : TanStack Form utilise des types internes complexes. L'adapter cast l'instance form en `unknown` puis en `TanStackFormValue` pour accéder à `pushFieldValue` / `removeFieldValue`. Voir les interfaces `TanStackField` et `TanStackFormValue` en haut du fichier.
- **`validators: undefined`** : La validation est déléguée à auto-form-builder (SchemaProvider). L'adapter ne configure pas de validateurs TanStack.
- **`get values()`** : getter ES6 — appelé à chaque accès à `formAPI.values`, toujours synchrone.
- **`handleSubmit`** : TanStack `form.handleSubmit()` est synchrone, contrairement à RHF qui retourne une closure. L'adapter appelle directement `form.handleSubmit()`.
- **Contexte** : Le `TanStackCtx` stocke l'objet form casté. Utiliser `useContext` dans `Field` pour le récupérer. Lancer une erreur si `null` (pas de `FormProvider` parent).

## Dépendance

`@tanstack/react-form` est déjà dans les `dependencies` de auto-form-builder.

## Test

Voir `packages/auto-form-builder/tests/adapters/tanstack.test.tsx` pour les 10 tests existants.

## Registre

Exporté depuis `packages/auto-form-builder/src/adapters/index.ts` :

```ts
export { tanstackAdapter } from "./tanstack";
```

## Référence

- [TanStack Form documentation](https://tanstack.com/form)
- `packages/auto-form-builder/src/adapters/tanstack.tsx` — implémentation complète
- `packages/auto-form-builder/src/adapters/types.ts` — interfaces FormAdapter
