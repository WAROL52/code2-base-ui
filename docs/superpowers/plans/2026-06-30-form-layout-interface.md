# FormLayout — Interface de rendu UI découplée de shadcn

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remplacer les imports concrets de shadcn dans `AutoForm`/`AutoFormField` par une interface `FormLayout` injectable, avec une implémentation par défaut shadcn.

**Architecture:** Créer une interface `FormLayout` (5 composants : FieldSet, FieldGroup, FieldLegend, FieldDescription, SubmitButton). L'interface vit dans `src/layout/types.ts`. Un React context (`FormLayoutCtx`) distribue le layout dans l'arbre. `AutoForm` reçoit un layout optionnel (par défaut `shadcnLayout` depuis `src/layout/shadcn.tsx`), le place dans le contexte. `AutoFormField` lit le layout depuis le contexte au lieu d'importer depuis `@code2-base-ui/ui`.

**Tech Stack:** React 19 context, shadcn/ui, TanStack Form

## Global Constraints

- `verbatimModuleSyntax: true` — toujours `import type` pour les types
- Indentation : tabulations (Biome config)
- TDD types-first : `expectTypeOf` avant implémentation
- Pipeline : `pnpm check` (Biome) → `pnpm check-types` → `pnpm test` — zéro warning/error
- Pas de breaking change : la prop `layout` est optionnelle, comportement par défaut identique à l'avant
- Namespace de layout : `@code2-base-ui/auto-form-builder/layout` (nouveau sous-chemin d'export)

---

## File Structure

### Nouveaux fichiers

| Fichier | Responsabilité |
|---------|---------------|
| `src/layout/types.ts` | Interface `FormLayout` (5 composants) |
| `src/layout/context.tsx` | `FormLayoutCtx`, `useFormLayout()` hook |
| `src/layout/shadcn.tsx` | `shadcnLayout` — implémentation par défaut (shadcn) |
| `src/layout/index.ts` | Barrel exports du sous-chemin layout |
| `tests/layout/types.test.ts` | Type tests pour `FormLayout` |
| `tests/layout/shadcn.test.tsx` | Runtime tests pour `shadcnLayout` |

### Fichiers modifiés

| Fichier | Changement |
|---------|-----------|
| `src/types.ts` | Ajout prop optionnelle `layout?: FormLayout` |
| `src/auto-form.tsx` | Remplacer imports shadcn par `FormLayoutCtx.Provider` + `useFormLayout()` |
| `src/auto-form-field.tsx` | Remplacer imports shadcn par `useFormLayout()` |
| `src/index.ts` | Ajouter `export * from "./layout"` |
| `package.json` | Ajouter sous-chemin `"./layout"` dans exports |
| `tests/auto-form.test.tsx` | Ajouter test custom layout |
| `tests/auto-form-field.test.tsx` | Ajouter test layout via contexte |

---

### Task 1: Interface FormLayout + contexte

**Files:**
- Create: `packages/auto-form-builder/src/layout/types.ts`
- Create: `packages/auto-form-builder/src/layout/context.tsx`
- Test: `packages/auto-form-builder/tests/layout/types.test.ts`

**Interfaces:**
- Produces: `FormLayout` interface (5 composants), `FormLayoutCtx` (React context), `useFormLayout()` hook

- [ ] **Step 1: Write the failing type test**

Create `tests/layout/types.test.ts`:

```tsx
import type React from "react";
import { describe, expect, expectTypeOf, it } from "vitest";
import type { FormLayout } from "../../src/layout/types";

describe("FormLayout type shape", () => {
  it("has FieldSet component", () => {
    expectTypeOf<FormLayout["FieldSet"]>().toMatchTypeOf<
      React.ComponentType<{ children: React.ReactNode; className?: string }>
    >();
  });

  it("has FieldGroup component", () => {
    expectTypeOf<FormLayout["FieldGroup"]>().toMatchTypeOf<
      React.ComponentType<{ children: React.ReactNode }>
    >();
  });

  it("has FieldLegend component", () => {
    expectTypeOf<FormLayout["FieldLegend"]>().toMatchTypeOf<
      React.ComponentType<{ children: React.ReactNode; className?: string }>
    >();
  });

  it("has FieldDescription component", () => {
    expectTypeOf<FormLayout["FieldDescription"]>().toMatchTypeOf<
      React.ComponentType<{ children: React.ReactNode }>
    >();
  });

  it("has SubmitButton component", () => {
    expectTypeOf<FormLayout["SubmitButton"]>().toMatchTypeOf<
      React.ComponentType<{
        children?: React.ReactNode;
        disabled?: boolean;
        isSubmitting?: boolean;
      }>
    >();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
pnpm --filter @code2-base-ui/auto-form-builder test tests/layout/types.test.ts
```

Expected: FAIL — `FormLayout` module not found

- [ ] **Step 3: Write the minimal types file**

Create `src/layout/types.ts`:

```tsx
import type { ComponentType, ReactNode } from "react";

export interface FormLayout {
  FieldSet: ComponentType<{ children: ReactNode; className?: string }>;
  FieldGroup: ComponentType<{ children: ReactNode }>;
  FieldLegend: ComponentType<{ children: ReactNode; className?: string }>;
  FieldDescription: ComponentType<{ children: ReactNode }>;
  SubmitButton: ComponentType<{
    children?: ReactNode;
    disabled?: boolean;
    isSubmitting?: boolean;
  }>;
}
```

- [ ] **Step 4: Create the context file**

Create `src/layout/context.tsx`:

```tsx
"use client";

import { createContext, useContext } from "react";
import type { FormLayout } from "./types";

export const FormLayoutCtx = createContext<FormLayout | null>(null);

export function useFormLayout(): FormLayout {
  const ctx = useContext(FormLayoutCtx);
  if (!ctx) {
    throw new Error(
      "useFormLayout: no FormLayout found in context. " +
        "Wrap your component tree with AutoForm (which provides a default layout) " +
        "or provide a FormLayoutCtx.Provider manually."
    );
  }
  return ctx;
}
```

- [ ] **Step 5: Run type tests to verify they pass**

```bash
pnpm --filter @code2-base-ui/auto-form-builder test tests/layout/types.test.ts
```

Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add packages/auto-form-builder/src/layout/types.ts \
       packages/auto-form-builder/src/layout/context.tsx \
       packages/auto-form-builder/tests/layout/types.test.ts
git commit -m "feat(auto-form-builder): add FormLayout interface and context"
```

---

### Task 2: Implémentation par défaut shadcnLayout

**Files:**
- Create: `packages/auto-form-builder/src/layout/shadcn.tsx`
- Create: `packages/auto-form-builder/tests/layout/shadcn.test.tsx`

**Interfaces:**
- Consumes: `FormLayout` from Task 1
- Produces: `shadcnLayout: FormLayout` — default shadcn-based implementation

- [ ] **Step 1: Write the failing test**

Create `tests/layout/shadcn.test.tsx`:

```tsx
import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { shadcnLayout } from "../../src/layout/shadcn";

describe("shadcnLayout", () => {
  it("renders FieldSet with tag and children", () => {
    const { container } = render(
      <shadcnLayout.FieldSet className="test-class">
        <div data-testid="child">inside</div>
      </shadcnLayout.FieldSet>
    );
    expect(container.querySelector("fieldset")).toBeTruthy();
    expect(container.querySelector(".test-class")).toBeTruthy();
  });

  it("renders FieldGroup with children", () => {
    const { container } = render(
      <shadcnLayout.FieldGroup>
        <div data-testid="child" />
      </shadcnLayout.FieldGroup>
    );
    expect(container.querySelector("div")).toBeTruthy();
  });

  it("renders FieldLegend with text", () => {
    const { container } = render(
      <shadcnLayout.FieldLegend>Title</shadcnLayout.FieldLegend>
    );
    expect(container.textContent).toBe("Title");
  });

  it("renders FieldDescription with text", () => {
    const { container } = render(
      <shadcnLayout.FieldDescription>Help text</shadcnLayout.FieldDescription>
    );
    expect(container.textContent).toBe("Help text");
  });

  it("renders SubmitButton with default text", () => {
    const { container } = render(<shadcnLayout.SubmitButton />);
    const btn = container.querySelector("button[type='submit']");
    expect(btn).toBeTruthy();
    expect(btn?.textContent).toBe("Envoyer");
  });

  it("renders SubmitButton with custom children", () => {
    const { container } = render(
      <shadcnLayout.SubmitButton>Save</shadcnLayout.SubmitButton>
    );
    expect(container.querySelector("button")?.textContent).toBe("Save");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
pnpm --filter @code2-base-ui/auto-form-builder test tests/layout/shadcn.test.tsx
```

Expected: FAIL — `shadcnLayout` not exported

- [ ] **Step 3: Write the shadcn implementation**

Create `src/layout/shadcn.tsx`:

```tsx
"use client";

import {
  FieldDescription,
  FieldGroup,
  FieldLegend,
  FieldSet,
} from "@code2-base-ui/ui/components/field";
import type { FormLayout } from "./types";

export const shadcnLayout: FormLayout = {
  FieldSet: ({ children, className }) => (
    <FieldSet className={className}>{children}</FieldSet>
  ),
  FieldGroup: ({ children }) => <FieldGroup>{children}</FieldGroup>,
  FieldLegend: ({ children, className }) => (
    <FieldLegend className={className}>{children}</FieldLegend>
  ),
  FieldDescription: ({ children }) => <FieldDescription>{children}</FieldDescription>,
  SubmitButton: ({ children, disabled = false }) => (
    <button
      className="mt-4 rounded-md bg-primary px-4 py-2 text-primary-foreground transition-colors hover:bg-primary/90"
      disabled={disabled}
      type="submit"
    >
      {children ?? "Envoyer"}
    </button>
  ),
};
```

- [ ] **Step 4: Run test to verify it passes**

```bash
pnpm --filter @code2-base-ui/auto-form-builder test tests/layout/shadcn.test.tsx
```

Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add packages/auto-form-builder/src/layout/shadcn.tsx \
       packages/auto-form-builder/tests/layout/shadcn.test.tsx
git commit -m "feat(auto-form-builder): add shadcnLayout default implementation"
```

---

### Task 3: Barrel exports + package.json sous-chemin

**Files:**
- Create: `packages/auto-form-builder/src/layout/index.ts`
- Modify: `packages/auto-form-builder/src/index.ts`
- Modify: `packages/auto-form-builder/package.json`

**Interfaces:**
- Produces: sub-path `@code2-base-ui/auto-form-builder/layout`

- [ ] **Step 1: Create layout barrel**

Create `src/layout/index.ts`:

```tsx
export { useFormLayout, FormLayoutCtx } from "./context";
export { shadcnLayout } from "./shadcn";
export type { FormLayout } from "./types";
```

- [ ] **Step 2: Update main barrel**

Modify `src/index.ts` — replace the existing content:

```tsx
export * from "./adapters";
export * from "./auto-form";
export * from "./auto-form-builder";
export * from "./auto-form-field";
export * from "./layout";
```

- [ ] **Step 3: Update package.json exports**

Modify `packages/auto-form-builder/package.json` — add `"./layout"` export:

```json
"exports": {
  ".": "./src/index.ts",
  "./adapters": "./src/adapters/index.ts",
  "./layout": "./src/layout/index.ts"
},
```

- [ ] **Step 4: Verify imports work**

```bash
pnpm --filter @code2-base-ui/auto-form-builder check
pnpm --filter @code2-base-ui/auto-form-builder check-types
```

Expected: PASS (both commands)

- [ ] **Step 5: Commit**

```bash
git add packages/auto-form-builder/src/layout/index.ts \
       packages/auto-form-builder/src/index.ts \
       packages/auto-form-builder/package.json
git commit -m "feat(auto-form-builder): add layout sub-path export"
```

---

### Task 4: Ajouter layout à AutoFormProps

**Files:**
- Modify: `packages/auto-form-builder/src/types.ts`

**Interfaces:**
- Consumes: `FormLayout` from Task 1
- Produces: updated `AutoFormProps` with `layout?` prop

- [ ] **Step 1: Modify AutoFormProps**

Replace the content of `src/types.ts`:

```tsx
import type { FieldRegistry } from "@code2-base-ui/json-schema-toolkit";
import type { ReactNode } from "react";
import type { FormAdapter } from "./adapters/types";
import type { FormLayout } from "./layout/types";

export interface AutoFormProps {
  adapter: FormAdapter;
  children?: ReactNode;
  className?: string;
  defaultValues?: Record<string, unknown>;
  layout?: FormLayout;
  onSubmit?: (data: unknown) => void | Promise<void>;
  registry: FieldRegistry;
  schema: Record<string, unknown>;
}
```

- [ ] **Step 2: Verify types**

```bash
pnpm --filter @code2-base-ui/auto-form-builder check-types
```

Expected: PASS

- [ ] **Step 3: Commit**

```bash
git add packages/auto-form-builder/src/types.ts
git commit -m "feat(auto-form-builder): add layout prop to AutoFormProps"
```

---

### Task 5: Consommer layout dans AutoForm

**Files:**
- Modify: `packages/auto-form-builder/src/auto-form.tsx`

**Interfaces:**
- Consumes: `FormLayout`, `shadcnLayout`, `FormLayoutCtx` from Tasks 1-2
- Consumes: updated `AutoFormProps` from Task 4
- Produces: AutoForm wrapping children with `FormLayoutCtx.Provider`

- [ ] **Step 1: Write the failing test**

Add to `tests/auto-form.test.tsx` — append after existing tests:

```tsx
import type { FormLayout } from "../src/layout";

it("renders with custom layout", () => {
  const customLayout: FormLayout = {
    FieldSet: ({ children }) => (
      <div data-testid="custom-fieldset">{children}</div>
    ),
    FieldGroup: ({ children }) => (
      <div data-testid="custom-group">{children}</div>
    ),
    FieldLegend: ({ children }) => (
      <div data-testid="custom-legend">{children}</div>
    ),
    FieldDescription: ({ children }) => (
      <div data-testid="custom-desc">{children}</div>
    ),
    SubmitButton: () => (
      <button data-testid="custom-submit" type="submit">
        Save
      </button>
    ),
  };

  render(
    <AutoForm
      adapter={tanstackAdapter}
      layout={customLayout}
      registry={mockRegistry}
      schema={testSchema}
    />
  );

  expect(screen.getByTestId("custom-fieldset")).toBeDefined();
  expect(screen.getByTestId("custom-legend")).toBeDefined();
  expect(screen.getByTestId("custom-desc")).toBeDefined();
  expect(screen.getByTestId("custom-group")).toBeDefined();
  expect(screen.getByTestId("custom-submit")).toBeDefined();
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
pnpm --filter @code2-base-ui/auto-form-builder test tests/auto-form.test.tsx
```

Expected: FAIL — AutoForm still imports shadcn directly, doesn't use `layout`

- [ ] **Step 3: Modify auto-form.tsx**

Replace the entire content of `src/auto-form.tsx`:

```tsx
"use client";

import { AutoFormBuilder } from "./auto-form-builder";
import { AutoFormField } from "./auto-form-field";
import { FormLayoutCtx } from "./layout/context";
import { shadcnLayout } from "./layout/shadcn";
import type { AutoFormProps } from "./types";

export function AutoForm({
  schema,
  adapter,
  registry,
  defaultValues,
  onSubmit,
  className,
  children,
  layout = shadcnLayout,
}: AutoFormProps) {
  return (
    <AutoFormBuilder
      adapter={adapter}
      defaultValues={defaultValues}
      onSubmit={onSubmit}
      schema={schema}
    >
      {({ fields, form }) => (
        <FormLayoutCtx.Provider value={layout}>
          <form
            className={className}
            onSubmit={(e) => {
              e.preventDefault();
              e.stopPropagation();
              form.handleSubmit();
            }}
          >
            <layout.FieldSet>
              {"title" in schema && typeof schema.title === "string" && (
                <layout.FieldLegend className="mb-2">
                  {schema.title}
                </layout.FieldLegend>
              )}
              {"description" in schema &&
                typeof schema.description === "string" && (
                  <layout.FieldDescription>
                    {schema.description}
                  </layout.FieldDescription>
                )}
              <layout.FieldGroup>
                {fields.map((field) => (
                  <AutoFormField
                    adapter={adapter}
                    fieldMeta={field}
                    key={field.path}
                    registry={registry}
                  />
                ))}
              </layout.FieldGroup>
            </layout.FieldSet>
            {children ?? <layout.SubmitButton />}
          </form>
        </FormLayoutCtx.Provider>
      )}
    </AutoFormBuilder>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

```bash
pnpm --filter @code2-base-ui/auto-form-builder test tests/auto-form.test.tsx
```

Expected: PASS (both old tests + new custom layout test)

- [ ] **Step 5: Run full check**

```bash
pnpm --filter @code2-base-ui/auto-form-builder check
pnpm --filter @code2-base-ui/auto-form-builder check-types
pnpm --filter @code2-base-ui/auto-form-builder test
```

Expected: PASS (all 3)

- [ ] **Step 6: Commit**

```bash
git add packages/auto-form-builder/src/auto-form.tsx \
       packages/auto-form-builder/tests/auto-form.test.tsx
git commit -m "feat(auto-form-builder): AutoForm consumes layout via context"
```

---

### Task 6: Consommer layout dans AutoFormField via contexte

**Files:**
- Modify: `packages/auto-form-builder/src/auto-form-field.tsx`
- Modify: `packages/auto-form-builder/tests/auto-form-field.test.tsx`

**Interfaces:**
- Consumes: `useFormLayout()` from Task 1
- Consumes: `FormLayoutCtx` from Task 1

- [ ] **Step 1: Write the failing test**

Add to `tests/auto-form-field.test.tsx` — append after existing test:

```tsx
import { FormLayoutCtx } from "../src/layout";
import type { FormLayout } from "../src/layout";

it("renders object field with custom layout from context", () => {
  const customLayout: FormLayout = {
    FieldSet: ({ children }) => (
      <div data-testid="ctx-fieldset">{children}</div>
    ),
    FieldGroup: ({ children }) => (
      <div data-testid="ctx-group">{children}</div>
    ),
    FieldLegend: ({ children }) => (
      <div data-testid="ctx-legend">{children}</div>
    ),
    FieldDescription: ({ children }) => (
      <div data-testid="ctx-desc">{children}</div>
    ),
    SubmitButton: () => null,
  };

  const objectFieldMeta: FieldMeta = {
    path: "address",
    type: "object",
    label: "Address",
    description: "Your address",
    kind: "object",
    children: [
      {
        path: "address.street",
        type: "string",
        label: "Street",
        kind: "primitive",
      },
    ],
  };

  render(
    <FormLayoutCtx.Provider value={customLayout}>
      <tanstackAdapter.FormProvider defaultValues={{}}>
        {(_formAPI) => (
          <AutoFormField
            adapter={tanstackAdapter}
            fieldMeta={objectFieldMeta}
            registry={{ resolve: mockResolve } as unknown as FieldRegistry}
          />
        )}
      </tanstackAdapter.FormProvider>
    </FormLayoutCtx.Provider>
  );

  expect(screen.getByTestId("ctx-fieldset")).toBeDefined();
  expect(screen.getByTestId("ctx-legend")).toBeDefined();
  expect(screen.getByTestId("ctx-desc")).toBeDefined();
  expect(screen.getByTestId("ctx-group")).toBeDefined();
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
pnpm --filter @code2-base-ui/auto-form-builder test tests/auto-form-field.test.tsx
```

Expected: FAIL — AutoFormField still imports shadcn directly

- [ ] **Step 3: Modify auto-form-field.tsx**

Replace the entire content of `src/auto-form-field.tsx`:

```tsx
"use client";

import type {
  FieldMeta,
  FieldRegistry,
} from "@code2-base-ui/json-schema-toolkit";
import type { FormAdapter } from "./adapters/types";
import { useFormLayout } from "./layout/context";

export interface AutoFormFieldProps {
  adapter: FormAdapter;
  fieldMeta: FieldMeta;
  registry: FieldRegistry;
}

export function AutoFormField({
  fieldMeta,
  adapter,
  registry,
}: AutoFormFieldProps) {
  const layout = useFormLayout();
  const { path, label, description, uiHidden, placeholder } = fieldMeta;

  if (uiHidden) {
    return null;
  }

  if (fieldMeta.kind === "object" && fieldMeta.children) {
    return (
      <layout.FieldSet className="border-l pl-4">
        {label && <layout.FieldLegend className="mb-2">{label}</layout.FieldLegend>}
        {description && <layout.FieldDescription>{description}</layout.FieldDescription>}
        <layout.FieldGroup>
          {fieldMeta.children.map((child) => (
            <AutoFormField
              adapter={adapter}
              fieldMeta={child}
              key={child.path}
              registry={registry}
            />
          ))}
        </layout.FieldGroup>
      </layout.FieldSet>
    );
  }

  const Component = registry.resolve(fieldMeta);

  return (
    <adapter.Field name={path}>
      {(field) => (
        <Component
          className={fieldMeta.uiReadonly ? "opacity-50" : ""}
          disabled={fieldMeta.uiReadonly}
          error={field.error}
          field={fieldMeta}
          id={path}
          key={path}
          label={label}
          onChange={(val: unknown) => field.onChange(val)}
          placeholder={placeholder}
          value={field.value}
        />
      )}
    </adapter.Field>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

```bash
pnpm --filter @code2-base-ui/auto-form-builder test tests/auto-form-field.test.tsx
```

Expected: PASS (both old test + new context test)

- [ ] **Step 5: Run full check**

```bash
pnpm --filter @code2-base-ui/auto-form-builder check
pnpm --filter @code2-base-ui/auto-form-builder check-types
pnpm --filter @code2-base-ui/auto-form-builder test
```

Expected: PASS (all 3)

- [ ] **Step 6: Commit**

```bash
git add packages/auto-form-builder/src/auto-form-field.tsx \
       packages/auto-form-builder/tests/auto-form-field.test.tsx
git commit -m "feat(auto-form-builder): AutoFormField consumes layout via context"
```

---

### Task 7: Nettoyage final — dépendances optionnelles

**Files:**
- Modify: `packages/auto-form-builder/package.json`

**Interfaces:**
- No new interfaces. Move `@code2-base-ui/ui` to peerDependencies optional.

- [ ] **Step 1: Update package.json**

Modify the `dependencies` and `peerDependencies` in `package.json`:

```json
"dependencies": {
  "@code2-base-ui/json-schema-toolkit": "workspace:*",
  "@tanstack/react-form": "catalog:"
},
"peerDependencies": {
  "@code2-base-ui/ui": "workspace:*",
  "react": "^19.2.6",
  "react-dom": "^19.2.6"
},
"peerDependenciesMeta": {
  "@code2-base-ui/ui": {
    "optional": true
  }
},
```

Explanation: `@code2-base-ui/ui` devient une peerDependency optionnelle. Si l'utilisateur fournit son propre layout (pas `shadcnLayout`), il n'a pas besoin de `@code2-base-ui/ui`. Si l'utilisateur utilise le layout par défaut, il doit avoir `@code2-base-ui/ui` installé.

Note: Puisque `shadcnLayout` importe depuis `@code2-base-ui/ui`, ce fichier ne peut être chargé que si la peer dep est présente. Les utilisateurs qui fournissent un layout custom n'importeront jamais `shadcnLayout` et n'auront pas l'erreur.

- [ ] **Step 2: Verify**

```bash
pnpm --filter @code2-base-ui/auto-form-builder check-types
```

Expected: PASS (Biome peut se plaindre de `@code2-base-ui/ui` importé dans `shadcn.tsx` si la dep n'est pas listée en dependencies, mais on vient de la mettre en peerDependencies donc c'est OK)

- [ ] **Step 3: Commit**

```bash
git add packages/auto-form-builder/package.json
git commit -m "chore(auto-form-builder): move @code2-base-ui/ui to optional peer dep"
```

---

### Task 8: Vérification finale intégrale

**Files:**
- (none, just verification)

- [ ] **Step 1: Run everything**

```bash
pnpm --filter @code2-base-ui/auto-form-builder check
pnpm --filter @code2-base-ui/auto-form-builder check-types
pnpm --filter @code2-base-ui/auto-form-builder test
```

Expected: All 3 PASS. Zéro warning, zéro erreur.

- [ ] **Step 2: Vérifier les imports dans le reste du monorepo**

L'utilisateur de AutoForm (comme le demo) peut maintenant passer un layout personnalisé sans toucher au code du package. Vérifier qu'aucun autre endroit n'importe les anciens composants field directement:

```bash
rg "from \"@code2-base-ui\/ui\/components\/field\"" --type ts packages/auto-form-builder/
```

Expected: Only `src/layout/shadcn.tsx` imports from `@code2-base-ui/ui/components/field`. No other files in the package.

- [ ] **Step 3: Commit**

```bash
git commit -m "chore: final verification — all checks pass"
```
