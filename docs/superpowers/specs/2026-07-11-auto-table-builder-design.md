# auto-table-builder — Design Document

## Objectif

Génération automatique de tableaux à partir de JSON Schema, basée sur `@tanstack/react-table`.
Framework composable en deux niveaux (hook + composant), avec feature system enfichable.

```
Schema + Data → useAutoTable → instance TanStack Table + colonnes générées
Schema + Data → AutoTable → table clé en main avec rendu shadcn
```

## Principes

- **Pas d'adapter** — `@tanstack/react-table` intégré directement
- **Nomenclature table-native** — column, pas field ; structure miroir de auto-form-builder
- **Deux niveaux d'API** — `useAutoTable` (hook, flexibilité totale), `AutoTable` (composant, clé en main)
- **Feature-driven** — chaque feature activée par la présence de son prop (`true | false | FeatureOptions`)
- **Feature Contract** — chaque feature implémente `FeatureContract<TData, TOptions>` avec slot de rendu
- **Composants utilitaires** — `AutoTablePagination`, `AutoTableViewOptions`, `AutoTableToolbar` exportés
- **Distribution** — package npm + GitHub Registry

## Architecture

```
Schema ──→ buildColumns() ──→ ColumnDef[]
Data   ──→ useAutoTable() ──→ instance Table<TData>
                                    │
                                    ▼
                              AutoTable (rendu shadcn)
                              ├── toolbar slot (filtering)
                              ├── table headers (sorting + columnVisibility)
                              ├── table body (cell rendering via ColumnRegistry)
                              └── pagination slot
```

## API publique

### useAutoTable (hook)

```ts
function useAutoTable<TData>(config: {
  schema: Record<string, unknown>
  data: TData[]
  registry: ColumnRegistry
  columns?: ColumnDef<TData>[]
  columnOverrides?: Partial<Record<string, Partial<ColumnDef<TData>>>>
  sorting?: true | SortingOptions
  pagination?: true | PaginationOptions
  filtering?: true | FilteringOptions
  rowSelection?: true | RowSelectionOptions
  columnVisibility?: true | ColumnVisibilityOptions
  columnResizing?: true | ColumnResizingOptions
  columnPinning?: true | ColumnPinningOptions
  expand?: true | ExpandOptions
  features?: Record<string, FeatureContract<TData>>
}): Table<TData>
```

### AutoTable (composant)

```tsx
<AutoTable
  schema={schema}
  data={data}
  registry={registry}
  sorting
  pagination
  filtering={{ fields, filters, onChange }}
  toolbar={<CustomToolbar />}
/>
```

### AutoTableBuilder (render-prop)

```tsx
<AutoTableBuilder schema={schema} data={data} registry={registry}>
  {({ table, columns }) => <CustomTable table={table} />}
</AutoTableBuilder>
```

### buildColumns (pure)

```ts
function buildColumns<TData>(
  schema: Record<string, unknown>,
  registry: ColumnRegistry,
  options?: { columnOverrides?: Partial<Record<string, Partial<ColumnDef<TData>>>> }
): ColumnDef<TData>[]
```

## Feature System

### FeatureContract

```ts
interface FeatureContract<TData, TOptions = Record<string, never>> {
  key: string
  slot: "toolbar" | "header" | "pagination" | "selection-info" | "body"
  Component: ComponentType<{ table: Table<TData>; options: TOptions }>
  getTableOptions?: (options: TOptions) => Partial<...>  // options passées à useReactTable
}
```

### Features

| Feature | Slot | Options | Description |
|---------|------|---------|-------------|
| `sorting` | header | `state?`, `onChange?`, `enableMulti?` | Tri sur les headers |
| `pagination` | pagination | `state?`, `onChange?`, `pageCount?` | Pagination (client ou server) |
| `filtering` | toolbar | `fields`, `filters`, `onChange` | Filtres avancés (shadcn Filters) |
| `rowSelection` | selection-info | `state?`, `onChange?` | Checkbox row selection |
| `columnVisibility` | toolbar | `state?`, `onChange?` | Toggle colonnes |
| `columnResizing` | header | `resizeMode?` | Drag resize handles |
| `columnPinning` | header | `state?`, `pinned?` | Colonnes épinglées |
| `expand` | body | `state?`, `onChange?` | Lignes expand |

Chaque feature suit le pattern `true | false | FeatureOptions` :
- `sorting` absent ou `false` → désactivé
- `sorting: true` → activé, non-contrôlé
- `sorting: { state, onChange }` → activé, contrôlé

### Shadcn Filters Integration

Le module **filtering** est un module externalisé basé sur le composant Filters de shadcn :

```tsx
import { createFilter, Filters, type Filter, type FilterFieldConfig } from "..."
```

- `Filter` : `{ id: string, field: string, operator: string, values: T[] }`
- `FilterFieldConfig` : `{ key, label, type: "text"|"select"|"multiselect", options?, operators? }`
- `createFilter(field, operator?, values?)` — helper pour créer un filtre
- Intégré avec TanStack Table via `columnFilters` state + `getFilteredRowModel()`

## ColumnRegistry

Nouveau registre dédié aux cellules de tableau (pas de réutilisation de FieldRegistry) :

```ts
interface ColumnRegistry {
  register(type: string, format: string | undefined, component: CellComponent): void
  resolve(meta: { type: string; format?: string; widget?: string }): CellComponent | undefined
}
```

Composants par défaut :

| Type JSON | Format | Composant | Rendu |
|-----------|--------|-----------|-------|
| `string` | — | `CellText` | texte simple |
| `string` | `email` | `CellEmail` | lien `mailto:` |
| `string` | `uri` | `CellUrl` | lien cliquable |
| `string` | `date`, `date-time` | `CellDate` | formaté |
| `number`, `integer` | — | `CellNumber` | aligné droite, formaté |
| `boolean` | — | `CellBoolean` | icône/badge |
| `string` avec `enum` | — | `CellBadge` | badge coloré |
| `array` | — | `CellArray` | pills / count |
| `object` | — | `CellObject` | expand ou popover |

## Dispatcher et Handlers

### AutoColumn

Dispatche un `FieldMeta` vers le handler approprié (comme AutoFormField mais pour colonnes) :

```
FieldMeta.kind → handler
  object  → ObjectHandler  (1 propriété → 1 colonne)
  array   → ArrayHandler   (nested → expand)
  union   → UnionHandler   (colonne conditionnelle)
  primitive → LeafHandler  (type simple → ColumnRegistry)
```

### Handlers

- **ObjectHandler** — itère `children`, génère une `ColumnDef` par propriété
- **ArrayHandler** — config d'expand pour les array nested
- **UnionHandler** — sélecteur de variante
- **LeafHandler** — résout le composant depuis `ColumnRegistry`, définit `cell` + `accessorKey`

## AutoTable (composant clé en main)

Structure de rendu :

```
<div className="w-full">
  <div className="toolbar">           ← toolbar slot
    <AutoTableViewOptions />          (si columnVisibility activé)
    <Filters />                        (si filtering activé)
    {children}                         (toolbar custom)
  </div>
  <div className="overflow-x-auto rounded-md border">
    <Table>
      <TableHeader>
        <TableRow>
          {headerGroup.headers.map(header => (
            <TableHead>
              {header.isPlaceholder ? null : flexRender(...)}
              <AutoTableSortIcon />     (si sorting activé)
              <AutoTableResizeHandle />  (si columnResizing activé)
            </TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.length ? rows.map(row => (
          <TableRow data-state={row.getIsSelected() && "selected"}>
            {row.getVisibleCells().map(cell => (
              <TableCell>{flexRender(...)}</TableCell>
            ))}
          </TableRow>
        )) : (
          <TableRow><TableCell colSpan={n}>No results.</TableCell></TableRow>
        )}
      </TableBody>
    </Table>
  </div>
  <div className="flex items-center py-4">
    <AutoTableSelectionInfo />          (si rowSelection activé)
    <AutoTablePagination />             (si pagination activé)
  </div>
</div>
```

## Sous-chemins d'export

```json
{
  ".": "./src/index.ts",
  "./registry": "./src/registry/index.ts",
  "./cell-components": "./src/cell-components/index.ts",
  "./testing": "./src/testing.tsx"
}
```

## Structure du package

```
packages/auto-table-builder/
├── package.json
├── tsconfig.json
├── src/
│   ├── index.ts                        # AutoTable, useAutoTable, buildColumns
│   ├── auto-table.tsx                  # Composant AutoTable
│   ├── auto-table-builder.tsx          # Render-prop builder
│   ├── use-auto-table.ts               # Hook principal
│   ├── build-columns.ts                # buildColumns (pure)
│   ├── auto-column.tsx                 # Dispatcher récursif
│   ├── handlers/
│   │   ├── index.ts
│   │   ├── object-handler.tsx
│   │   ├── array-handler.tsx
│   │   ├── union-handler.tsx
│   │   └── leaf-handler.tsx
│   ├── features/
│   │   ├── types.ts                    # FeatureContract
│   │   ├── sorting.tsx
│   │   ├── pagination.tsx
│   │   ├── filtering.tsx
│   │   ├── row-selection.tsx
│   │   ├── column-visibility.tsx
│   │   ├── column-resizing.tsx
│   │   ├── column-pinning.tsx
│   │   └── expand.tsx
│   ├── registry/
│   │   └── index.ts                    # ColumnRegistry
│   ├── cell-components/
│   │   ├── index.ts
│   │   ├── cell-text.tsx
│   │   ├── cell-email.tsx
│   │   ├── cell-url.tsx
│   │   ├── cell-date.tsx
│   │   ├── cell-number.tsx
│   │   ├── cell-boolean.tsx
│   │   ├── cell-badge.tsx
│   │   ├── cell-array.tsx
│   │   └── cell-object.tsx
│   └── testing.tsx                     # Helpers de test
├── tests/
│   ├── build-columns.test.ts
│   ├── use-auto-table.test.tsx
│   ├── auto-column.test.tsx
│   └── features.test.tsx
```

## Dépendances

- `@code2-base-ui/json-schema-toolkit` — FieldMeta, FieldRegistry (base), resolveSchema, traverseSchema
- `@code2-base-ui/ui` — composants shadcn (Table, Button, DropdownMenu, Checkbox, Input, Badge)
- `@tanstack/react-table` (peer) — v8
- `lucide-react` — icônes (ArrowUpDown, ChevronLeft, etc.)

## Non-goals (V1)

- Export CSV/Excel
- Inline editing
- Drag-and-drop row reorder
- Tree table (hiérarchique)
- Multi-sort (V2)
- Column footer aggregations (V2)

## Plan d'implémentation (ordre des tickets)

1. **Scaffold** — package.json, tsconfig.json, nx registration, structure des dossiers
2. **buildColumns** — fonction pure de génération de colonnes depuis schema (tests types-first)
3. **ColumnRegistry** — registre dédié + tests
4. **Cell components** — CellText, CellEmail, CellUrl, CellDate, CellNumber, CellBoolean, CellBadge, CellArray, CellObject
5. **FeatureContract** — interface, types, helpers
6. **Features** — sorting, pagination, rowSelection, columnVisibility, columnResizing, columnPinning, expand (une par PR ou commit)
7. **Filtering feature** — intégration shadcn Filters (createFilter, FilterFieldConfig, Filter)
8. **AutoColumn + handlers** — dispatcher récursif, object/array/union/leaf handlers
9. **useAutoTable** — hook qui assemble buildColumns + features + useReactTable
10. **AutoTableBuilder** — render-prop builder (comme AutoFormBuilder)
11. **AutoTable** — composant clé en main avec rendu shadcn
12. **AutoTablePagination, AutoTableViewOptions, AutoTableToolbar** — composants utilitaires
13. **Documentation Fumadocs** — pages installation, api-reference, examples
14. **Intégration** — registry.json, AGENTS.md, meta.json
