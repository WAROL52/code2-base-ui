# Tasks — auto-form (v2)

> **Méthode** : User valide chaque tâche avant exécution.
> **Priorités** : 🔴 Blocant → 🟡 Prioritaire → 🔵 Polish
> **Règle** : 1 PRD = 1 tâche. Pas de tâche qui fait plusieurs choses.

---

## ✅ TERMINÉ — T1 — Labels dans les champs

**Commit :** `cccadd3` — 15 fichiers, +326 lignes, 96 tests.

**Livré :**
- `FieldMeta.label: string` (obligatoire)
- `JsonSchema.title?: string`
- `humanizePath()` — camelCase + snake_case → Title (6 tests)
- `flatfields()` dérive label de `title` ou `humanizePath(key)` (3 tests)
- Auto-détection `uiWidget: "select"` pour les enum (2 tests)
- `ZodProvider` migré vers `z.toJSONSchema()` (55 lignes supprimées)
- `description` propagé correctement, séparé du label

---

## 🔴 B1 — Connecter les valeurs et onChange (EX-T3)

**PRD :** Les composants de champ doivent lire/écrire les valeurs du formulaire.

**Problème :** L'adapter `useField()` est un stub qui retourne `{ value: undefined, onChange: () => {} }`.
Les inputs (`InputField`, `CheckboxField`, etc.) ne sont pas connectés au `FieldController`.

**Solution :**
- Chaque composant doit lire `value`, `onChange`, `onBlur`, `error` depuis `useFieldContext()`
- Le `tanstackFormAdapter.useField()` doit retourner un controller réel connecté à l'état du formulaire
- `AutoField` doit passer le `FieldController` au composant (ou via contexte, déjà fait avec `FieldProvider`)
- Old utilisait `form.Field()` render-prop de TanStack
- Standardiser les props reçues par les composants (`FieldComponentProps` interface)

**Inspiration old :** `old/registry/types.ts:9-28` — interface `FieldComponentProps` standardisée.

**Tests :** Chaque composant doit avoir au moins 1 test : rendu + value + onChange + error.

**Fichiers :**
- `packages/auto-form-adapter-tanstack/src/tanstack-adapter.ts`
- `packages/auto-form-render-shadcn/src/components/*.tsx` (tous)
- `packages/auto-form/src/core/types.ts` (ajouter FieldComponentProps)
- `packages/auto-form-render-shadcn/tests/components/*.test.tsx`

---

## 🔴 B2 — Validation par champ (T2)

**PRD :** Chaque champ doit valider en temps réel (pas seulement au submit).

**Dépendance :** B1 (besoin d'un onChange fonctionnel pour déclencher la validation).

**Solution :**
- Dans `tanstackFormAdapter`, sur chaque `onChange`, valider le champ individuellement
- Utiliser `provider.getFieldMeta(path)` et `zodSchema.shape[key].safeParse()`
- Propager l'erreur via `FieldController.error` → affichée par `FieldError`
- Old utilisait `validators.onChange` de TanStack

**Tests :** onChange déclenche la validation, erreur s'affiche dans FieldError.

**Fichiers :**
- `packages/auto-form-adapter-tanstack/src/tanstack-adapter.ts`
- `packages/auto-form-adapter-tanstack/tests/tanstack-adapter.test.ts`

---

## 🟡 P1 — Standardized FieldComponentProps

**PRD :** Les composants de champ doivent suivre un contrat d'interface clair.

**Problème :** Actuellement les composants reçoivent `{...fieldMeta}` via `props: Record<string, unknown>`.
Pas de typage, pas de contrat. Old a `FieldComponentProps` avec `field, label, value, onChange, error, placeholder, id, className, disabled`.

**Solution :**
- Créer une interface `FieldComponentProps` partagée
- Typer les composants avec cette interface plutôt que `Record<string, unknown>`
- Le `FieldController` passé via `useFieldContext()` fait partie du contrat

**Tests :** Types (`expectTypeOf`) sur les props des composants.

**Fichiers :**
- `packages/auto-form/src/core/types.ts`
- `packages/auto-form-render-shadcn/src/components/*.tsx`

---

## 🟡 P2 — Options enum → Select/Radio (T5 suite)

**PRD :** Les champs enum doivent afficher des options cliquables.

**Problème :** `FieldMeta.enum` contient `["admin", "user"]` mais les composants attendent
`options: { value, label }[]`. Pas de conversion.

**Dépendance :** B1 (pour que onChange/value fonctionnent).

**Solution :**
- Normaliser dans les composants : `(props.enum ?? []).map(v => ({ value: v, label: v }))`
- Ou normaliser dans `flatfields()` en stockant aussi les options
- Old convertissait via le traverser

**Tests :** SelectField affiche les bonnes options depuis un enum.

**Fichiers :**
- `packages/auto-form-render-shadcn/src/components/select-field.tsx`
- `packages/auto-form-render-shadcn/src/components/radio-group-field.tsx`

---

## 🟡 P3 — Bouton submit par défaut (T6)

**PRD :** AutoForm doit avoir un bouton submit par défaut sans children.

**Solution :**
- Si `children` est `undefined`, inclure un `Button type="submit"` après les champs
- Désactiver pendant `isSubmitting`
- Old l'avait en racine du formulaire

**Tests :** Le formulaire sans children a un submit, avec children n'en a pas.

**Fichiers :**
- `packages/auto-form/src/core/factory.tsx`
- `packages/auto-form/tests/core/factory.test.ts`

---

## 🟡 P4 — Gestion récursive des objets (T7)

**PRD :** Les objets nichés dans le schéma doivent être rendus via FieldGroup.

**Problème :** `AutoField` ignore `fieldMeta.properties` pour les champs de type "object".
Le `FieldGroup` existe mais n'est pas utilisé.

**Solution :**
- Dans `AutoField`, détecter `type === "object"` et `properties`
- Résoudre le composant via registry (type "object")
- Itérer les sous-champs avec la layout strategy

**Tests :** Un schéma avec `address: { street, city }` rend un FieldGroup avec sous-champs.

**Fichiers :**
- `packages/auto-form/src/core/factory.tsx`
- `packages/auto-form/tests/core/factory.test.ts`

---

## 🔵 P5 — Adaptateur TanStack réel (T8)

**PRD :** L'adapter doit utiliser le vrai `@tanstack/react-form`.

**Problème :** Stub in-memory. Pas de dirty tracking réel, pas de submission handling.

**Dépendance :** B1 + B2.

**Solution :**
- Importer `useForm` de `@tanstack/react-form`
- Wrapper dans `FormStateAdapter`

**Tests :** Intégration avec le vrai TanStack.

**Fichiers :**
- `packages/auto-form-adapter-tanstack/src/tanstack-adapter.ts`
- `packages/auto-form-adapter-tanstack/package.json`

---

## 🔵 P6 — i18n messages d'erreur (T9)

**PRD :** Messages d'erreur traduisibles en français.

**Inspiration old :** `old/core/i18n.ts` — 40 lignes, `registerLocale()`, `getMessages()`.

**Solution :**
- Copier l'approche old dans le ZodProvider ou json-schema-toolkit
- Paramétrer les messages Zod avec les traductions

**Tests :** Messages traduits, fallback anglais.

**Fichiers :**
- Nouveau fichier i18n dans `auto-form-provider-zod`
- `packages/auto-form-provider-zod/src/zod-provider.ts`

---

## 🔵 P7 — x-ui-* extensions via Zod meta (T10)

**PRD :** Widget, hidden, order, readonly via `.meta()`.

**Problème :** `z.toJSONSchema()` produit du JSON Schema standard. Les extensions custom doivent être lues via `.meta()`.

**Solution :**
- Lire les propriétés additionnelles de `.meta()` après `z.toJSONSchema()`
- Les stocker dans `FieldMeta.uiWidget`, etc.

**Tests :** `.meta({ widget: "textarea" })` → `uiWidget: "textarea"`.

**Fichiers :**
- `packages/auto-form-provider-zod/src/zod-provider.ts`

---

## 🔵 P8 — Type guards (T13)

**PRD :** Exporter des type guards pour les consumers.

**Inspiration old :** `old/core/guards.ts` — `isFieldPrimitive`, `isFieldObject`, `isFieldArray`, `isFieldEnum`, `isFieldUnion`, `assertFieldMeta`, `isJsonSchema`.

**Solution :**
- Ajouter les guards dans `json-schema-toolkit/src/utils/type-guards.ts`
- Exporter depuis l'index

**Tests :** Types + runtime.

**Fichiers :**
- `packages/json-schema-toolkit/src/utils/type-guards.ts`

---

## Résumé

| # | Priorité | Tâche | Ancien # | Effort | Dépendances |
|---|---|---|---|---|---|
| T1 | ✅ | Labels, enum→select, z.toJSONSchema | T1 | M | — |
| B1 | 🔴 | Connecter valeurs et onChange | T3 | M | — |
| B2 | 🔴 | Validation par champ | T2 | M | B1 |
| P1 | 🟡 | Standardized FieldComponentProps | *Nouveau* | S | B1 |
| P2 | 🟡 | Options enum → Select/Radio | T5 | S | B1 |
| P3 | 🟡 | Bouton submit par défaut | T6 | S | — |
| P4 | 🟡 | Gestion récursive des objets | T7 | M | — |
| P5 | 🔵 | Adapter TanStack réel | T8 | L | B1+B2 |
| P6 | 🔵 | i18n | T9 | M | — |
| P7 | 🔵 | x-ui-* via Zod meta | T10 | M | — |
| P8 | 🔵 | Type guards | T13 | XS | — |

## Inspirations old à récupérer

| Module old | Utilité | Priorité | À mettre dans |
|---|---|---|---|
| `resolver.ts` | $ref + allOf resolution | V2 | json-schema-toolkit |
| `normalizer.ts` | Union discriminant detection | V2 | json-schema-toolkit |
| `i18n.ts` | Messages d'erreur traduits | P6 | auto-form-provider-zod |
| `guards.ts` | Type guards runtime | P8 | json-schema-toolkit |
| `utils.ts:getUiOptions()` | x-ui-* parser | P7 | json-schema-toolkit |
| `utils.ts:getLabel()` | Label derivation (dépassé par T1) | — | — |
| `utils.ts:inferTSType()` | TS type inference | V2 | json-schema-toolkit |
| `registry/types.ts` | FieldComponentProps interface | P1 | auto-form-render-shadcn |
