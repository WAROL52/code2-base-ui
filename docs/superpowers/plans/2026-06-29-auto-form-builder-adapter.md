# FormAdapter — Découplage Form Manager pour auto-form-builder

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rendre `auto-form-builder` compatible avec n'importe quel form manager (TanStack, React Hook Form, Formisch, etc.) via un pattern `FormAdapter` React.

**Architecture:** Interface `FormAdapter` avec 2 composants React (`FormProvider` + `Field`). Contexte interne privé par adapter. `auto-form-builder.tsx` utilise `adapter.FormProvider` au lieu de `useForm()` direct. `auto-form-field.tsx` utilise `adapter.Field` au lieu de `form.Field` direct.

**Tech Stack:** TypeScript 5.x, React 19, TanStack Form (via adapter), vitest, @testing-library/react

**TDD discipline :** Chaque brique commence par un test qui échoue (RED), puis implémentation minimale (GREEN), pas de code spéculatif.

---
## File Structure

```
packages/auto-form-builder/src/
├── adapters/
│   ├── types.ts          (CRÉER) — FieldAPI, FormAPI, FormAdapter
│   └── tanstack.tsx      (CRÉER) — tanstackAdapter
├── auto-form-builder.tsx (MODIFIER) — use adapter.FormProvider
├── auto-form-field.tsx   (MODIFIER) — use adapter.Field
├── auto-form.tsx         (MODIFIER) — add adapter prop, remove 11 generics
├── types.ts              (MODIFIER) — simplify generics
└── index.ts              (MODIFIER) — export adapters, remove dead deps
```

## Global Constraints

- `verbatimModuleSyntax: true` — toujours `import type` pour les types
- Indentation : tabulations
- Pas de code spéculatif — uniquement ce que le test demande
- Ne pas toucher à `packages/auto-form/` — c'est le package IA, pas touché
- Testing : vitest + jsdom + @testing-library/react (déjà configuré)

---

### Brique 1 : Interface FormAdapter (types)

**Objectif** : Définir `FieldAPI`, `FormAPI`, `FormAdapter` — le contrat commun.

**Fichier** :
- Créer : `packages/auto-form-builder/src/adapters/types.ts`
- Test : `packages/auto-form-builder/tests/adapters/types.test.ts`

**Interface publique produite :**

```typescript
export interface FieldAPI {
  value: unknown
  onChange: (value: unknown) => void
  onBlur: () => void
  error?: string
  isTouched: boolean
}

export interface FormAPI<TFormData = Record<string, unknown>> {
  values: TFormData
  errors: Record<string, string | undefined>
  isSubmitting: boolean
  handleSubmit: () => void
  reset: () => void
}

export interface FormAdapter {
  readonly name: string
  readonly FormProvider: React.ComponentType<FormProviderProps>
  readonly Field: React.ComponentType<FieldProps>
}
```

**Étapes TDD :**

- [ ] **Step 1-1 : Écrire le test qui vérifie que les types existent et sont corrects**

```typescript
// tests/adapters/types.test.ts
import type { FieldAPI, FormAPI, FormAdapter } from "../../src/adapters/types"

describe("FormAdapter types", () => {
  it("FieldAPI requires value: unknown", () => {
    const field: FieldAPI = {
      value: "test",
      onChange: (v: unknown) => {},
      onBlur: () => {},
      error: undefined,
      isTouched: false,
    }
    expectTypeOf(field.value).toBeUnknown()
  })

  it("FieldAPI.onChange accepts unknown", () => {
    const field: FieldAPI = {
      value: "test",
      onChange: (v: unknown) => { expect(v).toBe("new-value") },
      onBlur: () => {},
      error: undefined,
      isTouched: false,
    }
    field.onChange("new-value")
  })

  it("FieldAPI.onBlur is callable", () => {
    let blurred = false
    const field: FieldAPI = {
      value: null,
      onChange: () => {},
      onBlur: () => { blurred = true },
      error: undefined,
      isTouched: false,
    }
    field.onBlur()
    expect(blurred).toBe(true)
  })

  it("FieldAPI.error is optional string", () => {
    const field1: FieldAPI = { value: null, onChange: () => {}, onBlur: () => {}, isTouched: false }
    expect(field1.error).toBeUndefined()

    const field2: FieldAPI = { value: null, onChange: () => {}, onBlur: () => {}, error: "Required", isTouched: true }
    expect(field2.error).toBe("Required")
  })

  it("FieldAPI.isTouched is boolean", () => {
    const field: FieldAPI = { value: null, onChange: () => {}, onBlur: () => {}, error: undefined, isTouched: true }
    expect(field.isTouched).toBe(true)
  })

  it("FormAPI defines required methods", () => {
    const form: FormAPI = {
      values: {},
      errors: {},
      isSubmitting: false,
      handleSubmit: () => {},
      reset: () => {},
    }
    expect(typeof form.handleSubmit).toBe("function")
    expect(typeof form.reset).toBe("function")
    expect(form.isSubmitting).toBe(false)
  })

  it("FormAdapter interface has name, FormProvider and Field", () => {
    const adapter: FormAdapter = {
      name: "test",
      FormProvider: ({ children }: any) => children({} as FormAPI),
      Field: ({ children }: any) => children({} as FieldAPI),
    }
    expect(adapter.name).toBe("test")
    expect(typeof adapter.FormProvider).toBe("function")
    expect(typeof adapter.Field).toBe("function")
  })
})
```

- [ ] **Step 1-2 : Vérifier que le test échoue**

Run : `pnpm --filter @code2-base-ui/auto-form-builder test -- tests/adapters/types.test.ts 2>&1`
Expected : `FAIL` — module introuvable

- [ ] **Step 1-3 : Créer l'implémentation minimale**

```typescript
// src/adapters/types.ts
import type { ReactNode, ComponentType } from "react"

export interface FieldAPI {
  value: unknown
  onChange: (value: unknown) => void
  onBlur: () => void
  error?: string
  isTouched: boolean
}

export interface FormAPI<TFormData = Record<string, unknown>> {
  values: TFormData
  errors: Record<string, string | undefined>
  isSubmitting: boolean
  handleSubmit: () => void
  reset: () => void
}

export interface FormProviderProps {
  defaultValues?: Record<string, unknown>
  onSubmit?: (data: unknown) => void | Promise<void>
  children: (formAPI: FormAPI) => ReactNode
}

export interface FieldProps {
  name: string
  children: (field: FieldAPI) => ReactNode
}

export interface FormAdapter {
  readonly name: string
  readonly FormProvider: ComponentType<FormProviderProps>
  readonly Field: ComponentType<FieldProps>
}
```

- [ ] **Step 1-4 : Vérifier que le test passe**

Run : `pnpm --filter @code2-base-ui/auto-form-builder test -- tests/adapters/types.test.ts 2>&1`
Expected : `PASS`

- [ ] **Step 1-5 : Vérifier les types**

Run : `pnpm --filter @code2-base-ui/auto-form-builder check-types 2>&1`
Expected : pas d'erreur

- [ ] **Step 1-6 : Commit**

```bash
git add packages/auto-form-builder/src/adapters/types.ts packages/auto-form-builder/tests/adapters/types.test.ts
git commit -m "feat(auto-form-builder): add FormAdapter interface (FieldAPI, FormAPI)"
```

---

### Brique 2 : Adapter TanStack

**Objectif** : Implémenter `tanstackAdapter` qui encapsule TanStack Form derrière `FormAdapter`.

**Fichiers :**
- Créer : `packages/auto-form-builder/src/adapters/tanstack.tsx`
- Test : `packages/auto-form-builder/tests/adapters/tanstack.test.tsx`

**Comportements à tester (par ordre TDD) :**
1. Adapter a le nom "tanstack"
2. FormProvider rend les enfants avec formAPI
3. FormProvider appelle useForm de TanStack
4. Field rend les enfants avec FieldAPI
5. Field lit le champ depuis le contexte TanStack
6. onChange met à jour la valeur
7. error reflète les erreurs de validation

**Étapes TDD :**

- [ ] **Step 2-1 : Test — adapter.name === "tanstack"**

```typescript
// tests/adapters/tanstack.test.tsx
import { describe, it, expect } from "vitest"
import { tanstackAdapter } from "../../src/adapters/tanstack"

describe("tanstackAdapter", () => {
  it("has name 'tanstack'", () => {
    expect(tanstackAdapter.name).toBe("tanstack")
  })
})
```

Run : `pnpm --filter @code2-base-ui/auto-form-builder test -- tests/adapters/tanstack.test.tsx 2>&1`
Expected : FAIL — module not found

- [ ] **Step 2-2 : Implémentation minimale — squelette de l'adapter**

```typescript
// src/adapters/tanstack.tsx
import type { ReactNode } from "react"
import type { FormAdapter } from "./types"

export const tanstackAdapter: FormAdapter = {
  name: "tanstack",
  FormProvider: ({ children }) => <>{children({} as any)}</>,
  Field: ({ children }) => <>{children({} as any)}</>,
}
```

Vérifier que le test passe.

- [ ] **Step 2-3 : Test — FormProvider rend les enfants avec FormAPI complète**

```typescript
it("FormProvider provides formAPI to children", () => {
  let capturedForm: any = null
  const { container } = render(
    <tanstackAdapter.FormProvider defaultValues={{ name: "" }}>
      {(formAPI) => {
        capturedForm = formAPI
        return <div data-testid="form">{JSON.stringify(formAPI.values)}</div>
      }}
    </tanstackAdapter.FormProvider>
  )
  expect(capturedForm).not.toBeNull()
  expect(typeof capturedForm.handleSubmit).toBe("function")
  expect(typeof capturedForm.reset).toBe("function")
  expect(capturedForm.isSubmitting).toBe(false)
})
```

Run : vérifier que ça échoue (l'adapter retourne `{} as any` qui peut ne pas matcher `FormAPI`)

- [ ] **Step 2-4 : Implémenter FormProvider avec useForm de TanStack**

```typescript
// src/adapters/tanstack.tsx — mise à jour
import { createContext, useContext } from "react"
import { useForm } from "@tanstack/react-form"
import type { FormProviderProps, FieldProps, FormAdapter, FormAPI } from "./types"

type TanStackForm = ReturnType<typeof useForm>
const TanStackCtx = createContext<TanStackForm | null>(null)

export const tanstackAdapter: FormAdapter = {
  name: "tanstack",

  FormProvider({ defaultValues, onSubmit, children }: FormProviderProps) {
    const form = useForm({
      defaultValues: defaultValues ?? {},
      validators: undefined,
      onSubmit: ({ value }) => onSubmit?.(value),
    })

    const formAPI: FormAPI = {
      get values() { return form.state.values as Record<string, unknown> },
      errors: {},
      isSubmitting: form.state.isSubmitting,
      handleSubmit: () => form.handleSubmit(),
      reset: () => form.reset(),
    }

    return <TanStackCtx.Provider value={form}>{children(formAPI)}</TanStackCtx.Provider>
  },

  Field({ name, children }: FieldProps) {
    const form = useContext(TanStackCtx)
    if (!form) throw new Error("tanstackAdapter: missing FormProvider")

    return (
      <form.Field name={name}>
        {(field) => children({
          value: field.state.value,
          onChange: (val: unknown) => field.handleChange(val),
          onBlur: () => field.handleBlur(),
          error: field.state.meta.errors?.[0] as string | undefined,
          isTouched: field.state.meta.isTouched,
        })}
      </form.Field>
    )
  },
}
```

- [ ] **Step 2-5 : Test — Field lit la valeur d'un champ**

```typescript
it("Field reads value from form state", () => {
  render(
    <tanstackAdapter.FormProvider defaultValues={{ name: "John" }}>
      {(formAPI) => (
        <tanstackAdapter.Field name="name">
          {(field) => <input data-testid="input" value={field.value as string} onChange={() => {}} />}
        </tanstackAdapter.Field>
      )}
    </tanstackAdapter.FormProvider>
  )
  const input = screen.getByTestId("input") as HTMLInputElement
  expect(input.value).toBe("John")
})
```

- [ ] **Step 2-6 : Test — onChange met à jour la valeur**

```typescript
it("Field.onChange updates form state", async () => {
  render(
    <tanstackAdapter.FormProvider defaultValues={{ name: "" }}>
      {(formAPI) => (
        <tanstackAdapter.Field name="name">
          {(field) => (
            <input
              data-testid="input"
              value={field.value as string}
              onChange={(e) => field.onChange(e.target.value)}
            />
          )}
        </tanstackAdapter.Field>
      )}
    </tanstackAdapter.FormProvider>
  )
  const input = screen.getByTestId("input") as HTMLInputElement
  await userEvent.clear(input)
  await userEvent.type(input, "Jane")
  expect(input.value).toBe("Jane")
})
```

- [ ] **Step 2-7 : Vérifier check-types**

Run : `pnpm --filter @code2-base-ui/auto-form-builder check-types 2>&1`
Expected : pas d'erreur

- [ ] **Step 2-8 : Commit**

```bash
git add packages/auto-form-builder/src/adapters/tanstack.tsx packages/auto-form-builder/tests/adapters/tanstack.test.tsx
git commit -m "feat(auto-form-builder): add tanstackAdapter (FormProvider + Field)"
```

---

### Brique 3 : Modifier auto-form-builder.tsx

**Objectif** : Remplacer l'appel direct à `useForm()` par `adapter.FormProvider`.

**Fichier :**
- Modifier : `packages/auto-form-builder/src/auto-form-builder.tsx`
- Test : `packages/auto-form-builder/tests/auto-form-builder.test.tsx`

**Changement principal :**
- Avant : `const form = useForm(formOptions)` + `resolveSchema` + `traverseSchema`
- Après : `<adapter.FormProvider>` wrapper avec `resolveSchema` + `traverseSchema` inchangés

**Étapes TDD :**

- [ ] **Step 3-1 : Test — AutoFormBuilder accepte un adapter et passe formAPI aux enfants**

```typescript
// tests/auto-form-builder.test.tsx
import { describe, it, expect, vi } from "vitest"
import { render, screen } from "@testing-library/react"
import { AutoFormBuilder } from "../src/auto-form-builder"
import { tanstackAdapter } from "../src/adapters/tanstack"

const testSchema = {
  type: "object" as const,
  properties: {
    name: { type: "string" as const, title: "Name" },
  },
}

describe("AutoFormBuilder", () => {
  it("renders children with form, fields and resolvedSchema", () => {
    let captured: any = null
    render(
      <AutoFormBuilder
        schema={testSchema}
        adapter={tanstackAdapter}
        defaultValues={{ name: "" }}
      >
        {(props) => {
          captured = props
          return <div data-testid="content">rendered</div>
        }}
      </AutoFormBuilder>
    )
    expect(screen.getByTestId("content")).toBeDefined()
    expect(captured).not.toBeNull()
    expect(Array.isArray(captured.fields)).toBe(true)
    expect(typeof captured.form.handleSubmit).toBe("function")
    expect(captured.resolvedSchema).toBeDefined()
  })
})
```

- [ ] **Step 3-2 : Modifier auto-form-builder.tsx**

```typescript
"use client"

import { useMemo } from "react"
import {
  type FieldMeta,
  type ResolvedSchema,
  resolveSchema,
  traverseSchema,
} from "@code2-base-ui/json-schema-toolkit"
import type { FormAdapter, FormAPI } from "./adapters/types"

export interface AutoFormBuilderChildrenProps {
  fields: FieldMeta[]
  form: FormAPI
  resolvedSchema: ResolvedSchema
}

export interface AutoFormBuilderProps {
  schema: Record<string, unknown>
  adapter: FormAdapter
  defaultValues?: Record<string, unknown>
  onSubmit?: (data: unknown) => void | Promise<void>
  children: (props: AutoFormBuilderChildrenProps) => React.ReactNode
}

export function AutoFormBuilder({
  schema,
  adapter,
  defaultValues,
  onSubmit,
  children,
}: AutoFormBuilderProps) {
  const resolvedSchema = useMemo(() => resolveSchema(schema), [schema])
  const fields = useMemo(() => traverseSchema(resolvedSchema), [resolvedSchema])

  return (
    <adapter.FormProvider defaultValues={defaultValues} onSubmit={onSubmit}>
      {(formAPI) => children({ form: formAPI, fields, resolvedSchema })}
    </adapter.FormProvider>
  )
}
```

- [ ] **Step 3-3 : Vérifier tests et types**

Run : `pnpm --filter @code2-base-ui/auto-form-builder test 2>&1` + `pnpm --filter @code2-base-ui/auto-form-builder check-types 2>&1`

- [ ] **Step 3-4 : Commit**

```bash
git add packages/auto-form-builder/src/auto-form-builder.tsx packages/auto-form-builder/tests/auto-form-builder.test.tsx
git commit -m "feat(auto-form-builder): use adapter.FormProvider instead of direct useForm()"
```

---

### Brique 4 : Modifier auto-form-field.tsx

**Objectif** : Remplacer `form.Field` direct par `adapter.Field`.

**Fichier :**
- Modifier : `packages/auto-form-builder/src/auto-form-field.tsx`
- Test : `packages/auto-form-builder/tests/auto-form-field.test.tsx`

**Changement principal :**
- Avant : `<form.Field name={path}>{(field) => <Component .../>}</form.Field>`
- Après : `<adapter.Field name={path}>{(field) => <Component .../>}</adapter.Field>`
- adapter passé en prop, plus besoin de form (TanStack) dans les props

**Étapes TDD :**

- [ ] **Step 4-1 : Test — AutoFormField rend un champ via adapter.Field**

```typescript
// tests/auto-form-field.test.tsx
import { describe, it, expect, vi } from "vitest"
import { render, screen } from "@testing-library/react"
import { AutoFormField } from "../src/auto-form-field"
import { tanstackAdapter } from "../src/adapters/tanstack"

// Créer un mock registry
const mockRegistry = {
  resolve: vi.fn().mockReturnValue(({ value, onChange, error, label }: any) =>
    <div>
      <label>{label}</label>
      <input
        data-testid="field-input"
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value)}
        data-error={error}
      />
    </div>
  ),
}

const textFieldMeta = {
  path: "name",
  type: "string",
  label: "Name",
  kind: "primitive" as const,
}

describe("AutoFormField", () => {
  it("renders a primitive field using adapter.Field", () => {
    render(
      <tanstackAdapter.FormProvider defaultValues={{ name: "John" }}>
        {(formAPI) => (
          <AutoFormField
            fieldMeta={textFieldMeta}
            adapter={tanstackAdapter}
            registry={mockRegistry as any}
          />
        )}
      </tanstackAdapter.FormProvider>
    )

    expect(screen.getByText("Name")).toBeDefined()
    const input = screen.getByTestId("field-input") as HTMLInputElement
    expect(input.value).toBe("John")
  })

  it("renders nested object fields recursively", () => {
    const objectFieldMeta = {
      path: "address",
      type: "object",
      label: "Address",
      kind: "object" as const,
      children: [
        { path: "address.street", type: "string", label: "Street", kind: "primitive" as const },
      ],
    }

    render(
      <tanstackAdapter.FormProvider defaultValues={{ address: { street: "Main St" } }}>
        {(formAPI) => (
          <AutoFormField
            fieldMeta={objectFieldMeta}
            adapter={tanstackAdapter}
            registry={mockRegistry as any}
          />
        )}
      </tanstackAdapter.FormProvider>
    )

    expect(screen.getByText("Address")).toBeDefined()
    expect(screen.getByText("Street")).toBeDefined()
  })

  it("hides field when uiHidden is true", () => {
    const hiddenField = { ...textFieldMeta, uiHidden: true }

    render(
      <tanstackAdapter.FormProvider defaultValues={{ name: "John" }}>
        {(formAPI) => (
          <AutoFormField
            fieldMeta={hiddenField}
            adapter={tanstackAdapter}
            registry={mockRegistry as any}
          />
        )}
      </tanstackAdapter.FormProvider>
    )

    expect(screen.queryByText("Name")).toBeNull()
  })
})
```

- [ ] **Step 4-2 : Modifier auto-form-field.tsx**

```typescript
"use client"

import type { FieldRegistry, FieldMeta } from "@code2-base-ui/json-schema-toolkit"
import {
  FieldDescription,
  FieldGroup,
  FieldLegend,
  FieldSet,
} from "@code2-base-ui/ui/components/field"
import type { FormAdapter } from "./adapters/types"

export interface AutoFormFieldProps {
  fieldMeta: FieldMeta
  adapter: FormAdapter
  registry: FieldRegistry
}

export function AutoFormField({
  fieldMeta,
  adapter,
  registry,
}: AutoFormFieldProps) {
  const { path, label, description, uiHidden, kind, children } = fieldMeta

  if (uiHidden) return null

  if (kind === "object" && children) {
    return (
      <FieldSet className="border-l pl-4">
        {label && <FieldLegend className="mb-2">{label}</FieldLegend>}
        {description && <FieldDescription>{description}</FieldDescription>}
        <FieldGroup>
          {children.map((child) => (
            <AutoFormField
              key={child.path}
              fieldMeta={child}
              adapter={adapter}
              registry={registry}
            />
          ))}
        </FieldGroup>
      </FieldSet>
    )
  }

  const Component = registry.resolve(fieldMeta)

  return (
    <adapter.Field name={path}>
      {(field) => (
        <Component
          value={field.value}
          onChange={(val: unknown) => field.onChange(val)}
          onBlur={() => field.onBlur()}
          error={field.error}
          disabled={fieldMeta.uiReadonly}
          field={fieldMeta}
          id={path}
          label={label}
          placeholder={fieldMeta.placeholder}
        />
      )}
    </adapter.Field>
  )
}
```

- [ ] **Step 4-3 : Vérifier tests et types**

- [ ] **Step 4-4 : Commit**

```bash
git add packages/auto-form-builder/src/auto-form-field.tsx packages/auto-form-builder/tests/auto-form-field.test.tsx
git commit -m "feat(auto-form-builder): use adapter.Field instead of form.Field"
```

---

### Brique 5 : Modifier auto-form.tsx et types.ts

**Objectif** : Ajouter la prop `adapter` au composant `AutoForm` de haut niveau, simplifier les generics (supprimer les 11 params TanStack).

**Fichier :**
- Modifier : `packages/auto-form-builder/src/auto-form.tsx`
- Modifier : `packages/auto-form-builder/src/types.ts`
- Supprimer : `import type * as Type` dans `types.ts` (plus besoin)
- Test : `packages/auto-form-builder/tests/auto-form.test.tsx`

**Changement principal :**
- `AutoFormProps<TData, TOnMount, ..., TSubmitMeta>` → `AutoFormProps`
- adapter dans les props de AutoForm
- Suppression de `TObject`, `UseFormHookOption`, `UseFormHookReturn`, `UseFormHook`
- Suppression de `@tanstack/react-form` des imports

**Étapes TDD :**

- [ ] **Step 5-1 : Test — AutoForm prend adapter et rend le formulaire**

```typescript
// tests/auto-form.test.tsx
import { describe, it, expect, vi } from "vitest"
import { render, screen } from "@testing-library/react"
import { AutoForm } from "../src/auto-form"
import { tanstackAdapter } from "../src/adapters/tanstack"

const testSchema = {
  type: "object" as const,
  title: "Test Form",
  description: "A test form",
  properties: {
    name: { type: "string" as const, title: "Name" },
  },
}

const mockRegistry = {
  resolve: vi.fn().mockReturnValue(({ value, onChange }: any) =>
    <input data-testid="auto-input" value={value ?? ""} onChange={(e) => onChange(e.target.value)} />
  ),
}

describe("AutoForm", () => {
  it("renders form with title and fields", () => {
    render(
      <AutoForm
        schema={testSchema}
        adapter={tanstackAdapter}
        registry={mockRegistry as any}
        defaultValues={{ name: "John" }}
      />
    )

    expect(screen.getByText("Test Form")).toBeDefined()
    expect(screen.getByText("A test form")).toBeDefined()
    const input = screen.getByTestId("auto-input") as HTMLInputElement
    expect(input.value).toBe("John")
  })

  it("renders submit button when no children", () => {
    render(
      <AutoForm
        schema={testSchema}
        adapter={tanstackAdapter}
        registry={mockRegistry as any}
      />
    )
    expect(screen.getByText("Envoyer")).toBeDefined()
  })
})
```

- [ ] **Step 5-2 : Mettre à jour types.ts**

```typescript
// src/types.ts
import type { FieldRegistry } from "@code2-base-ui/json-schema-toolkit"
import type { FormAdapter } from "./adapters/types"
import type { ReactNode } from "react"

export interface AutoFormProps {
  adapter: FormAdapter
  children?: ReactNode
  className?: string
  defaultValues?: Record<string, unknown>
  onSubmit?: (data: unknown) => void | Promise<void>
  registry: FieldRegistry
  schema: Record<string, unknown>
}
```

(Supprimer les anciens types : TObject, UseFormHookOption, UseFormHookReturn, UseFormHook, ReactFormExtendedApi, AutoFormProps avec generics)

- [ ] **Step 5-3 : Mettre à jour auto-form.tsx**

```typescript
"use client"

import {
  FieldDescription,
  FieldGroup,
  FieldLegend,
  FieldSet,
} from "@code2-base-ui/ui/components/field"
import { AutoFormBuilder } from "./auto-form-builder"
import { AutoFormField } from "./auto-form-field"
import type { AutoFormProps } from "./types"

export function AutoForm({
  schema,
  adapter,
  registry,
  defaultValues,
  onSubmit,
  className,
  children,
}: AutoFormProps) {
  return (
    <AutoFormBuilder
      adapter={adapter}
      defaultValues={defaultValues}
      onSubmit={onSubmit}
      schema={schema}
    >
      {({ fields }) => (
        <form
          className={className}
          onSubmit={(e) => {
            e.preventDefault()
            e.stopPropagation()
          }}
        >
          <FieldSet>
            {"title" in schema && typeof schema.title === "string" && (
              <FieldLegend className="mb-2">{schema.title}</FieldLegend>
            )}
            {"description" in schema && typeof schema.description === "string" && (
              <FieldDescription>{schema.description}</FieldDescription>
            )}
            <FieldGroup>
              {fields.map((field) => (
                <AutoFormField
                  key={field.path}
                  adapter={adapter}
                  fieldMeta={field}
                  registry={registry}
                />
              ))}
            </FieldGroup>
          </FieldSet>
          {children ?? (
            <button
              className="mt-4 rounded-md bg-primary px-4 py-2 text-primary-foreground transition-colors hover:bg-primary/90"
              type="submit"
            >
              Envoyer
            </button>
          )}
        </form>
      )}
    </AutoFormBuilder>
  )
}
```

- [ ] **Step 5-4 : Nettoyage — supprimer les anciens types inutilisés de types.ts**

S'assurer que `TObject`, `UseFormHookOption`, `UseFormHookReturn`, `UseFormHook`, `ReactFormExtendedApi` sont supprimés.

- [ ] **Step 5-5 : Vérifier tests et types**

- [ ] **Step 5-6 : Commit**

```bash
git add packages/auto-form-builder/src/auto-form.tsx packages/auto-form-builder/src/types.ts packages/auto-form-builder/tests/auto-form.test.tsx
git commit -m "feat(auto-form-builder): simplify types, add adapter prop to AutoForm"
```

---

### Brique 6 : Exports et nettoyage final

**Objectif** : Mettre à jour `index.ts`, nettoyer les dépendances mortes, vérifier que tout compile.

**Fichiers :**
- Modifier : `packages/auto-form-builder/src/index.ts`
- Modifier : `packages/auto-form-builder/package.json`
- Vérification : `check-types` sur tout le projet

**Étapes :**

- [ ] **Step 6-1 : Mettre à jour index.ts**

```typescript
export * from "./auto-form"
export * from "./auto-form-builder"
export * from "./auto-form-field"
export type { FieldAPI, FormAPI, FormAdapter, FormProviderProps, FieldProps } from "./adapters/types"
export { tanstackAdapter } from "./adapters/tanstack"
```

- [ ] **Step 6-2 : Nettoyer package.json**

```json
// Supprimer @code2-base-ui/auto-form des dépendances (plus de SchemaProvider)
// @tanstack/react-form reste en dependance (l'adapter l'importe)
{
  "dependencies": {
    "@code2-base-ui/json-schema-toolkit": "workspace:*",
    "@code2-base-ui/ui": "workspace:*",
    "@tanstack/react-form": "catalog:"
  }
}
```

- [ ] **Step 6-3 : Vérification finale**

```bash
pnpm --filter @code2-base-ui/auto-form-builder check-types
pnpm --filter @code2-base-ui/auto-form-builder test
```

- [ ] **Step 6-4 : Commit final**

```bash
git add packages/auto-form-builder/src/index.ts packages/auto-form-builder/package.json
git commit -m "chore(auto-form-builder): update exports and clean dependencies"
```
