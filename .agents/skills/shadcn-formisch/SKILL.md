---
name: shadcn-formisch
description: Use when implementing a Formisch adapter for the auto-form-builder FormAdapter interface. Triggers on "create formisch adapter", "formisch form adapter", "form adapter formisch".
---

# shadcn-formisch — Formisch Adapter

## Overview

Guide pour implémenter un adaptateur `FormAdapter` (auto-form-builder) avec **Formisch** (`@formisch/react`). Formisch a une API radicalement différente de TanStack Form et RHF : les opérations sont des **fonctions top-level** (pas de méthodes sur un objet form), et les chemins de champs utilisent des **tableaux** (`["email"]`, `["addresses", 0, "city"]`).

## Interface cible

```tsx
interface FormAdapter {
  name: string
  Field: ComponentType<FieldProps>        // <FormischField>
  FormProvider: ComponentType<FormProviderProps>  // useForm
}
```

### FormProvider → `useForm` + `<Form>`

```tsx
interface FormProviderProps {
  children: (form: FormAPI) => ReactNode
  defaultValues?: Record<string, unknown>
  onSubmit?: (data: unknown) => void | Promise<void>
}
```

### Field → `<FormischField>` (render-prop)

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

## Mappage Formisch → auto-form-builder

| Concept Formisch | Seam auto-form-builder |
|---|---|
| `useForm({ schema, initialInput })` | `FormProvider` — initialisation du store |
| `<Form of={form} onSubmit={fn}>` | Géré dans `FormProvider` (submit) |
| `submit(form)` (top-level) | `formAPI.handleSubmit` |
| `reset(form)` ou `reset(form, opts)` | `formAPI.reset` |
| `getInput(form, { path })` (lecture) | `formAPI.values` (getter) |
| `<FormischField of={form} path={["name"]}>` | `<adapter.Field name="name">` |
| `field.input` | `fieldAPI.value` |
| `field.onChange(v)` | `fieldAPI.onChange(v)` |
| `field.props.onBlur` (spread) | `fieldAPI.onBlur()` |
| `field.errors` (string[] ou null) | `fieldAPI.error` (premier ou objet) |
| `insert(form, { path, at?, initialInput })` | `formAPI.appendFieldValue(n, v)` |
| `remove(form, { path, at: index })` | `formAPI.removeFieldValue(n, i)` |

## API native Formisch

Formisch utilise des **fonctions top-level** importées directement :

```ts
import { getInput, setInput, getErrors, submit, reset, insert, remove, move, swap, replace, validate, focus } from "@formisch/react"
```

Toutes suivent le même pattern : `fn(formStore, { ...config })`.

### Champs natifs vs librairie

- **Éléments natifs** (`<input>`, `<textarea>`) → spread `field.props` + `value={field.input}`
- **Composants librairie** (`<Select>`, `<Switch>`, `<Checkbox>`) → lire `field.input`, appeler `field.onChange(value)`

### Chemins en tableau

Formisch utilise des tableaux pour les chemins : `["addresses", 0, "city"]`. L'adapter doit convertir les chemins `dotted` (`"addresses[0].city"`) en tableaux Formisch.

## Implémentation complète

```tsx
"use client";

import {
	Field as FormischField,
	Form,
	getInput,
	insert,
	remove as formischRemove,
	reset as formischReset,
	submit as formischSubmit,
	useForm,
} from "@formisch/react";
import { createContext, useCallback, useContext, useRef } from "react";
import type {
	FieldProps,
	FormAdapter,
	FormAPI,
	FormProviderProps,
} from "./types";

interface FormischStore {
	// Store opaque — on caste useForm() en unknown
}

const FormischCtx = createContext<FormischStore | null>(null);

function toPath(name: string): string[] {
	return name.replace(/\[(\d+)\]/g, (_m, n) => `.${n}`).split(".");
}

export const formischAdapter: FormAdapter = {
	name: "formisch",

	FormProvider({ defaultValues = {}, onSubmit, children }: FormProviderProps) {
		const form = useForm({
			schema: undefined as never, // schema géré par auto-form-builder
			initialInput: defaultValues as never,
		});

		const formAPI: FormAPI = {
			get values() {
				return getInput(form) as Record<string, unknown>;
			},
			isSubmitting: false,
			handleSubmit: () => {
				formischSubmit(form);
			},
			reset: () => formischReset(form),
			appendFieldValue: (name: string, value: unknown) => {
				insert(form, {
					path: toPath(name),
					initialInput: value as never,
				} as never);
			},
			removeFieldValue: (name: string, index: number) => {
				formischRemove(form, {
					path: toPath(name),
					at: index,
				} as never);
			},
		};

		return (
			<FormischCtx.Provider value={form as unknown as FormischStore}>
				<Form of={form} onSubmit={(output: unknown) => onSubmit?.(output)}>
					{children(formAPI)}
				</Form>
			</FormischCtx.Provider>
		);
	},

	Field({ name, children }: FieldProps) {
		const form = useContext(FormischCtx);
		if (!form) {
			throw new Error("formischAdapter: missing FormProvider");
		}

		return (
			<FormischField of={form as never} path={toPath(name)}>
				{(field) =>
					children({
						value: field.input,
						onChange: (val: unknown) => field.onChange(val),
						onBlur: () => field.props.onBlur(),
						error: field.errors?.[0] ?? undefined,
						isTouched: false,
					})
				}
			</FormischField>
		);
	},
};
```

## Points d'attention

- **Conversion de chemin** : Formisch utilise `["addresses", 0, "city"]` (tableaux). auto-form-builder utilise des strings dotted `"addresses[0].city"`. La fonction `toPath()` (ci-dessus) convertit : `"addresses[0].city"` → `["addresses", "0", "city"]`. Note : les indices numériques sont des strings (c'est ce que Formisch attend).
- **`isSubmitting`** : Formisch n'expose pas `isSubmitting` de manière triviale. Mettre à `false` par défaut ou écouter `form.submitting` si disponible.
- **`isTouched`** : Formisch n'a pas de concept `isTouched` natif. Mettre à `false` par défaut.
- **`field.errors`** : Formisch retourne `string[] | null`. L'adapter renvoie `errors[0]` comme `string | undefined`.
- **`<Form>` wrapper** : Formisch nécessite `<Form of={form} onSubmit={fn}>` pour le submit. L'adapter l'intègre dans `FormProvider` et y place `children(formAPI)` à l'intérieur. Attention : les children seront dans `<Form>` donc le HTML `<form>` est géré par Formisch — vérifier la compatibilité avec le rendu de `AutoForm` qui crée son propre `<form>`.
- **Pas de `validators`** : Formisch n'utilise pas de resolvers — le schema est passé directement à `useForm({ schema })`. Pour l'adapter, on passe `schema: undefined` et on laisse auto-form-builder gérer la validation via le SchemaProvider.
- **`appendFieldValue`** : Formisch `insert(form, { path, at?, initialInput })` ajoute par défaut à la fin si `at` n'est pas spécifié.
- **`getInput(form)`** : Sans `path`, retourne toutes les valeurs. Avec `path`, retourne la valeur du champ spécifique.
- **Dépendance** : Ajouter `@formisch/react` et `valibot` aux `dependencies` du `package.json`. Mettre en peerDependency si l'adaptateur est optionnel.

## Registre d'export

```ts
export { formischAdapter } from "./formisch";
```

## Test

```tsx
import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { formischAdapter } from "../../src/adapters/formisch";

describe("formischAdapter", () => {
	it("renders field with default value", () => {
		render(
			<formischAdapter.FormProvider defaultValues={{ name: "Alice" }}>
				{(form) => (
					<formischAdapter.Field name="name">
						{(field) => <span data-testid="val">{field.value as string}</span>}
					</formischAdapter.Field>
				)}
			</formischAdapter.FormProvider>
		);
		expect(screen.getByTestId("val").textContent).toBe("Alice");
	});
});
```

## Référence

- [Formisch documentation](https://formisch.dev)
- [Formisch React guides](https://formisch.dev/react/guides/form-methods) — API des méthodes top-level
- `packages/auto-form-builder/src/adapters/tanstack.tsx` — implémentation de référence pour le pattern
- `packages/auto-form-builder/src/adapters/types.ts` — interfaces FormAdapter
