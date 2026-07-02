---
name: shadcn-rhf
description: Use when implementing a React Hook Form adapter for the auto-form-builder FormAdapter interface. Triggers on "create rhf adapter", "react-hook-form adapter", "form adapter rhf", "implement rhf form provider".
---

# shadcn-rhf — React Hook Form Adapter

## Overview

Guide pour implémenter un adaptateur `FormAdapter` (auto-form-builder) avec **React Hook Form**. Le pattern est identique à `tanstackAdapter` : 2 composants React + 1 contexte interne privé.

## Interface cible

```tsx
interface FormAdapter {
  name: string
  Field: ComponentType<FieldProps>        // Controller
  FormProvider: ComponentType<FormProviderProps>  // useForm
}
```

### FormProvider → `useForm` + `Controller.useFieldArray`

```tsx
interface FormProviderProps {
  children: (form: FormAPI) => ReactNode
  defaultValues?: Record<string, unknown>
  onSubmit?: (data: unknown) => void | Promise<void>
}
```

### Field → `Controller`

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

## Mappage RHF → auto-form-builder

| Concept RHF | Seam auto-form-builder |
|---|---|
| `useForm()` | `FormProvider` — initialisation + contexte |
| `form.handleSubmit(onSubmit)()` | `formAPI.handleSubmit` |
| `form.reset()` | `formAPI.reset` |
| `form.formState.isSubmitting` | `formAPI.isSubmitting` |
| `form.getValues()` | `formAPI.values` (getter) |
| `<Controller control={form.control} name={n}>` | `<adapter.Field name={n}>` |
| `field, fieldState` (render-prop Controller) | `FieldAPI` (value, onChange, onBlur, error, isTouched) |
| `useFieldArray({ control, name })` | `appendFieldValue` / `removeFieldValue` |
| `@hookform/resolvers/zod` | Non concerné (validation côté schema-provider) |
| `formState.errors` | Non concerné (errors via Field) |

## Structure du fichier

Créer `packages/auto-form-builder/src/adapters/rhf.tsx` avec :

1. **Types internes** — interfaces hookant le type RHF brut
2. **Contexte privé** — `createContext<RHFContext | null>(null)`
3. **`rhfAdapter`** — objet `FormAdapter` avec `FormProvider` et `Field`

Ne pas importer `useFieldArray` directement ; l'utiliser via `form` casté.

## Implémentation complète

```tsx
"use client";

import { Controller, useForm } from "react-hook-form";
import { createContext, useContext } from "react";
import type {
	FieldProps,
	FormAdapter,
	FormAPI,
	FormProviderProps,
} from "./types";

interface RHFControl {
	getValues: () => Record<string, unknown>;
	control: object;
}

interface RHFForm extends RHFControl {
	handleSubmit: (
		onValid: (data: unknown) => void
	) => (e?: React.BaseSyntheticEvent) => void;
	reset: () => void;
	formState: { isSubmitting: boolean };
}

const RHFContext = createContext<RHFControl | null>(null);

export const rhfAdapter: FormAdapter = {
	name: "rhf",

	FormProvider({ defaultValues, onSubmit, children }: FormProviderProps) {
		const form = useForm({
			defaultValues: defaultValues ?? {},
		});

		const formAPI: FormAPI = {
			get values() {
				return form.getValues() as Record<string, unknown>;
			},
			get isSubmitting() {
				return form.formState.isSubmitting;
			},
			handleSubmit: () => {
				form.handleSubmit((data) => onSubmit?.(data))();
			},
			reset: () => form.reset(),
			appendFieldValue: (name: string, value: unknown) => {
				const current = (form.getValues(name) as unknown[]) ?? [];
				form.setValue(name, [...current, value]);
			},
			removeFieldValue: (name: string, index: number) => {
				const current = (form.getValues(name) as unknown[]) ?? [];
				form.setValue(
					name,
					current.filter((_, i) => i !== index)
				);
			},
		};

		return (
			<RHFContext.Provider value={form as unknown as RHFControl}>
				{children(formAPI)}
			</RHFContext.Provider>
		);
	},

	Field({ name, children }: FieldProps) {
		const ctrl = useContext(RHFContext);
		if (!ctrl) {
			throw new Error("rhfAdapter: missing FormProvider");
		}

		return (
			<Controller
				control={ctrl.control as never}
				name={name}
				render={({ field, fieldState }) =>
					children({
						value: field.value,
						onChange: (val: unknown) => field.onChange(val),
						onBlur: () => field.onBlur(),
						error: fieldState.error?.message,
						isTouched: fieldState.isTouched,
					})
				}
			/>
		);
	},
};
```

## Points d'attention

- **`appendFieldValue` / `removeFieldValue`** : RHF n'a pas d'API native comme TanStack (`pushFieldValue`). Utiliser `form.setValue()` avec lecture + filtrage. Le context store l'instance form castée en `RHFControl` pour exposer `control` (nécessaire pour `Controller`).
- **`form.handleSubmit`** : RHF nécessite `form.handleSubmit(onValid)` qui retourne une fonction. L'adapter `handleSubmit()` appelle cette fonction immédiatement.
- **`fieldState.error`** : RHF expose `error: FieldError` (avec `message: string`). L'adapter renvoie `error?.message` comme `string | undefined`. Pour le support `FieldError` (objet), on peut renvoyer `fieldState.error` directement.
- **`getValues()`** : RHF `getValues()` est synchrone (pas comme TanStack qui utilise `state.values`). Le getter `formAPI.values` l'appelle à chaque accès.
- **Dépendance** : Ajouter `react-hook-form` et `@hookform/resolvers` (optionnel) aux `dependencies` du `package.json` de auto-form-builder. Mettre en peerDependency si l'adaptateur est optionnel.

## Registre d'export

Ajouter dans `packages/auto-form-builder/src/adapters/index.ts` :

```ts
export { rhfAdapter } from "./rhf";
```

## Test

Créer un test similaire à `tests/adapters/tanstack.test.tsx` :

```tsx
import { describe, expect, it } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { rhfAdapter } from "../../src/adapters/rhf";

describe("rhfAdapter", () => {
	it("renders field with value", () => {
		render(
			<rhfAdapter.FormProvider defaultValues={{ name: "John" }}>
				{(form) => (
					<rhfAdapter.Field name="name">
						{(field) => <span data-testid="val">{field.value as string}</span>}
					</rhfAdapter.Field>
				)}
			</rhfAdapter.FormProvider>
		);
		expect(screen.getByTestId("val").textContent).toBe("John");
	});

	// Voir tanstack.test.tsx pour les autres cas
});
```

## Référence

- [React Hook Form documentation](https://react-hook-form.com)
- `packages/auto-form-builder/src/adapters/tanstack.tsx` — implémentation de référence
- `packages/auto-form-builder/src/adapters/types.ts` — interfaces complètes
