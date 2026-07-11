# auto-table-builder — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Create the `@code2-base-ui/auto-table-builder` package — a JSON Schema-driven table generator built on `@tanstack/react-table`. Single package with feature system, ColumnRegistry, and both hook-level and component-level APIs.

**Architecture:** Single package in the monorepo (`packages/auto-table-builder/`). Pas d'adapter — TanStack Table directement. Feature system avec `FeatureContract`. Sous-chemins d'export : `.`, `./registry`, `./cell-components`, `./testing`.

**Tech Stack:** TypeScript 6, React 19, vitest, `@tanstack/react-table` v8, `json-schema-toolkit` (FieldMeta, resolveSchema, traverseSchema), shadcn/ui (Table, Button, Checkbox, DropdownMenu), packages/ui.

## Global Constraints

- `verbatimModuleSyntax: true` — always `import type` for types
- `noUncheckedIndexedAccess: true` — array/index access always `| undefined`
- Indentation: tabs
- Quotes: double
- Type-first TDD: write `expectTypeOf` tests before any runtime implementation
- Imports from `json-schema-toolkit`: types from `@code2-base-ui/json-schema-toolkit`
- React 19, TypeScript 6
- Packages are private (monorepo), `"type": "module"`

---

### Task 1: Scaffold the package

**Files:**
- Create: `packages/auto-table-builder/package.json`
- Create: `packages/auto-table-builder/tsconfig.json`
- Create: `packages/auto-table-builder/src/index.ts` (barrel, empty exports for now)
- Create: `packages/auto-table-builder/vitest.config.ts`

**Interfaces:**
- Consumes: existing package convention (json-schema-toolkit, auto-form-builder as reference)
- Produces: runnable `pnpm --filter @code2-base-ui/auto-table-builder test` (even if 0 tests)
- Registers project in nx

---

### Task 2: buildColumns (pure function)

**Files:**
- Create: `packages/auto-table-builder/src/build-columns.ts`
- Create: `packages/auto-table-builder/tests/build-columns.test.ts`

**API:**
```ts
function buildColumns<TData>(
  schema: Record<string, unknown>,
  registry: ColumnRegistry,
  options?: { overrides?: Partial<Record<string, Partial<ColumnDef<TData>>>> }
): ColumnDef<TData>[]
```

**Tests:**
- `expectTypeOf` for return type
- Un schema object → 1 ColumnDef par propriété
- `accessorKey` correct
- `header` label dérivé du nom de propriété
- Merge avec `overrides` par id

---

### Task 3: ColumnRegistry

**Files:**
- Create: `packages/auto-table-builder/src/registry/index.ts`
- Create: `packages/auto-table-builder/tests/column-registry.test.ts`

**API:**
```ts
interface CellComponentProps<TData, TValue> {
  value: TValue
  row: Row<TData>
  column: Column<TData, TValue>
  table: Table<TData>
}

type CellComponent<TData = unknown, TValue = unknown> = ComponentType<CellComponentProps<TData, TValue>>

interface ColumnRegistry {
  register<T, F>(type: string, format: T extends undefined ? undefined : string, component: CellComponent<unknown, F>): void
  resolve(meta: { type: string; format?: string; widget?: string }): CellComponent | undefined
}
```

**Tests:**
- `register` + `resolve` round-trip
- `resolve` with format
- `resolve` fallback (sans format)
- `resolve` returns `undefined` pour inconnu

---

### Task 4: Cell components

**Files:**
- Create: `packages/auto-table-builder/src/cell-components/index.ts`
- Create: `packages/auto-table-builder/src/cell-components/cell-text.tsx`
- Create: `packages/auto-table-builder/src/cell-components/cell-email.tsx`
- Create: `packages/auto-table-builder/src/cell-components/cell-url.tsx`
- Create: `packages/auto-table-builder/src/cell-components/cell-date.tsx`
- Create: `packages/auto-table-builder/src/cell-components/cell-number.tsx`
- Create: `packages/auto-table-builder/src/cell-components/cell-boolean.tsx`
- Create: `packages/auto-table-builder/src/cell-components/cell-badge.tsx`
- Create: `packages/auto-table-builder/src/cell-components/cell-array.tsx`
- Create: `packages/auto-table-builder/src/cell-components/cell-object.tsx`
- Create: `packages/auto-table-builder/tests/cell-components.test.tsx`

**Interfaces:**
- Chaque composant accepte `CellComponentProps` et rend du JSX stylisé
- `CellEmail` → `mailto:` link
- `CellUrl` → link cliquable
- `CellDate` → formatage avec Intl
- `CellNumber` → aligné droite, formaté avec Intl.NumberFormat
- `CellBoolean` → icône Check / X (lucide-react)
- `CellBadge` → badge coloré (packages/ui Badge)
- `CellArray` → badge count ou pills
- `CellObject` → expand ou popover

**Tests:**
- Rendu avec @testing-library/react
- Formats conditionnels (email → mailto, uri → link)
- Valeurs null/undefined gérées

---

### Task 5: FeatureContract + feature types

**Files:**
- Create: `packages/auto-table-builder/src/features/types.ts`
- Create: `packages/auto-table-builder/tests/feature-types.test.ts`

**API:**
```ts
type FeatureValue<TOptions> = false | true | TOptions

interface SortingOptions {
  enable?: boolean
  enableMultiSort?: boolean
  state?: SortingState
  onSortingChange?: OnChangeFn<SortingState>
}

interface PaginationOptions {
  enable?: boolean
  state?: PaginationState
  onPaginationChange?: OnChangeFn<PaginationState>
  pageCount?: number
}

interface RowSelectionOptions {
  enable?: boolean
  enableMultiRowSelection?: boolean
  state?: RowSelectionState
  onRowSelectionChange?: OnChangeFn<RowSelectionState>
}

interface ColumnVisibilityOptions {
  enable?: boolean
  initialState?: VisibilityState
  state?: VisibilityState
  onColumnVisibilityChange?: OnChangeFn<VisibilityState>
}

// etc. pour columnResizing, columnPinning, expand
```

**FeatureContract:**
```ts
interface FeatureContract<TData, TOptions = Record<string, never>> {
  key: string
  slot: "toolbar" | "header" | "pagination" | "selection-info" | "body"
  Component: ComponentType<{ table: Table<TData>; options: TOptions }>
  getTableOptions?: (options: TOptions) => Partial<UseReactTableOptions<TData>>
}
```

**Tests:**
- `expectTypeOf` sur tous les types
- FeatureValue<SortingOptions> accepte `true`, `false`, `{ state: [] }`

---

### Task 6: Feature implementations (sorting, pagination, rowSelection, columnVisibility, columnResizing, columnPinning, expand)

**Files:**
- Create: `packages/auto-table-builder/src/features/sorting.tsx`
- Create: `packages/auto-table-builder/src/features/pagination.tsx`
- Create: `packages/auto-table-builder/src/features/row-selection.tsx`
- Create: `packages/auto-table-builder/src/features/column-visibility.tsx`
- Create: `packages/auto-table-builder/src/features/column-resizing.tsx`
- Create: `packages/auto-table-builder/src/features/column-pinning.tsx`
- Create: `packages/auto-table-builder/src/features/expand.tsx`
- Create: `packages/auto-table-builder/src/features/index.ts`
- Create: `packages/auto-table-builder/tests/features.test.tsx`

**Interfaces:**
- Chaque feature exporte son `FeatureContract` + son slot component
- `getTableOptions` retourne les options à passer à `useReactTable` (rowModels, callbacks)
- Le slot component rend le UI de la feature (ex: boutons Previous/Next pour pagination)

**Tests:**
- Chaque feature rend son composant de slot
- `getTableOptions` retourne les options correctes

---

### Task 7: Filtering feature (shadcn Filters integration)

**Files:**
- Create: `packages/auto-table-builder/src/features/filtering.tsx`
- Create: `packages/auto-table-builder/tests/filtering.test.tsx`

**API:**
```ts
interface FilteringOptions {
  fields: FilterFieldConfig[]
  filters: Filter[]
  onChange: (filters: Filter[]) => void
}

interface Filter {
  id: string
  field: string
  operator: string
  values: unknown[]
}

interface FilterFieldConfig {
  key: string
  label: string
  type: "text" | "select" | "multiselect"
  options?: { value: string; label: string }[]
  operators?: FilterOperator[]
  placeholder?: string
}

function createFilter(field: string, operator?: string, values?: unknown[]): Filter
```

**Interfaces:**
- Intègre le composant Filters de shadcn dans le slot `toolbar`
- Traduit les filtres en `columnFilters` pour TanStack Table
- Filtres OR pour `is_any_of`, AND pour les autres opérateurs

**Tests:**
- `createFilter()` produit le bon shape
- Rendu du composant Filters avec @testing-library/react

---

### Task 8: AutoColumn dispatcher + handlers

**Files:**
- Create: `packages/auto-table-builder/src/auto-column.tsx`
- Create: `packages/auto-table-builder/src/handlers/index.ts`
- Create: `packages/auto-table-builder/src/handlers/types.ts`
- Create: `packages/auto-table-builder/src/handlers/object-handler.tsx`
- Create: `packages/auto-table-builder/src/handlers/array-handler.tsx`
- Create: `packages/auto-table-builder/src/handlers/union-handler.tsx`
- Create: `packages/auto-table-builder/src/handlers/leaf-handler.tsx`
- Create: `packages/auto-table-builder/tests/auto-column.test.tsx`

**API:**
```ts
interface AutoColumnProps {
  fieldMeta: FieldMeta
  registry: ColumnRegistry
}
```
Retourne une `ColumnDef<TData>` configurée (pas du JSX — contrairement à AutoFormField).

**Handlers:**
- ObjectHandler → appelle `buildColumns` récursivement
- ArrayHandler → configure expand + subRows
- UnionHandler → sélecteur de variante
- LeafHandler → résout `registry.resolve(meta)` et configure `cell` + `accessorKey`

**Tests:**
- ObjectHandler génère les bonnes ColumnDef
- LeafHandler résout correctement dans le registry
- ArrayHandler configure subRows

---

### Task 9: useAutoTable hook

**Files:**
- Create: `packages/auto-table-builder/src/use-auto-table.ts`
- Create: `packages/auto-table-builder/tests/use-auto-table.test.tsx`

**API:**
```ts
function useAutoTable<TData>(config: {
  schema: Record<string, unknown>
  data: TData[]
  registry: ColumnRegistry
  columns?: ColumnDef<TData>[]
  columnOverrides?: Partial<Record<string, Partial<ColumnDef<TData>>>>
  features?: Record<string, FeatureContract<TData>>
  sorting?: FeatureValue<SortingOptions>
  pagination?: FeatureValue<PaginationOptions>
  rowSelection?: FeatureValue<RowSelectionOptions>
  columnVisibility?: FeatureValue<ColumnVisibilityOptions>
  columnResizing?: FeatureValue<ColumnResizingOptions>
  columnPinning?: FeatureValue<ColumnPinningOptions>
  expand?: FeatureValue<ExpandOptions>
}): Table<TData>
```

**Interfaces:**
- Résoud `schema` → `FieldMeta[]` via `resolveSchema` + `traverseSchema` (json-schema-toolkit)
- Génère `ColumnDef[]` via `buildColumns`
- Fusionne les options de feature dans `useReactTable`
- Gère l'état des features non-contrôlées via `useState` interne

**Tests:**
- Instance retournée non-null
- Colonnes générées correctes
- Features activées dans les options

---

### Task 10: AutoTableBuilder render-prop

**Files:**
- Create: `packages/auto-table-builder/src/auto-table-builder.tsx`
- Create: `packages/auto-table-builder/tests/auto-table-builder.test.tsx`

**API:**
```ts
interface AutoTableBuilderProps<TData> {
  schema: Record<string, unknown>
  data: TData[]
  registry: ColumnRegistry
  children: (props: { table: Table<TData>; columns: ColumnDef<TData>[] }) => ReactNode
  columns?: ColumnDef<TData>[]
  columnOverrides?: Partial<Record<string, Partial<ColumnDef<TData>>>>
  sorting?: FeatureValue<SortingOptions>
  pagination?: FeatureValue<PaginationOptions>
  // ...autres features feature props
}

function AutoTableBuilder<TData>(props: AutoTableBuilderProps<TData>): ReactNode
```

**Tests:**
- Render-prop reçoit la bonne instance
- Les features sont relayées à `useAutoTable`

---

### Task 11: AutoTable composant

**Files:**
- Create: `packages/auto-table-builder/src/auto-table.tsx`
- Create: `packages/auto-table-builder/tests/auto-table.test.tsx`

**API:**
```ts
interface AutoTableProps<TData> {
  schema: Record<string, unknown>
  data: TData[]
  registry: ColumnRegistry
  columns?: ColumnDef<TData>[]
  columnOverrides?: Partial<Record<string, Partial<ColumnDef<TData>>>>
  toolbar?: ReactNode
  className?: string
  sorting?: FeatureValue<SortingOptions>
  pagination?: FeatureValue<PaginationOptions>
  filtering?: FeatureValue<FilteringOptions>
  rowSelection?: FeatureValue<RowSelectionOptions>
  columnVisibility?: FeatureValue<ColumnVisibilityOptions>
  columnResizing?: FeatureValue<ColumnResizingOptions>
  columnPinning?: FeatureValue<ColumnPinningOptions>
  expand?: FeatureValue<ExpandOptions>
}
```

**Tests:**
- Rend un tableau avec headers + body
- Empty state quand data est vide
- Features activées rendent les bons slots

---

### Task 12: Composants utilitaires

**Files:**
- Create: `packages/auto-table-builder/src/auto-table-pagination.tsx`
- Create: `packages/auto-table-builder/src/auto-table-view-options.tsx`
- Create: `packages/auto-table-builder/src/auto-table-toolbar.tsx`
- Create: `packages/auto-table-builder/tests/utility-components.test.tsx`

**API:**
```ts
function AutoTablePagination<TData>({ table }: { table: Table<TData> }): ReactNode
function AutoTableViewOptions<TData>({ table }: { table: Table<TData> }): ReactNode
function AutoTableToolbar<TData>({ table, children }: { table: Table<TData>; children?: ReactNode }): ReactNode
```

**Tests:**
- Rendu correct avec une instance mock
- Pagination : boutons Previous/Next, page info

---

### Task 13: Documentation Fumadocs

**Files:**
- Create: `apps/fumadocs/content/docs/auto-table-builder/index.mdx`
- Create: `apps/fumadocs/content/docs/auto-table-builder/installation.mdx`
- Create: `apps/fumadocs/content/docs/auto-table-builder/api-reference.mdx`
- Create: `apps/fumadocs/content/docs/auto-table-builder/examples.mdx`
- Modify: `apps/fumadocs/content/docs/meta.json` (sidebar)

---

### Task 14: Intégration

**Files:**
- Modify: `registry.json` — ajouter le package
- Modify: `AGENTS.md` — section auto-table-builder
- Modify: `CONTEXT.md` — déjà fait, vérifier
- Vérifier : `pnpm check-types`
