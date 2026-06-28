# PRD — T1 : Labels dans les champs de formulaire

## Problem Statement

Les formulaires générés par `auto-form` n'affichent aucun label au-dessus des champs. L'utilisateur voit des inputs nus, sans indication sur ce qu'il doit saisir. Le rendu est illisible et inutilisable.

La cause racine est que `FieldMeta` ne contient pas de champ `label`. Les composants (`InputField`, `SelectField`, etc.) affichent conditionnellement `{label && <FieldLabel>...}` — comme `label` n'est jamais fourni, rien n'apparaît.

## Solution

Ajouter un champ `label: string` obligatoire dans `FieldMeta`, dérivé automatiquement depuis le `title` JSON Schema ou, en fallback, depuis le nom de la propriété humanisé (camelCase + snake_case → Title Case).

Le ZodProvider utilise `z.toJSONSchema()` (API native Zod v4) pour générer un JSON Schema Draft 2020-12 complet, incluant `title` (depuis `.meta({ title })`) et `description`. Le `title` alimente le `label` ; la `description` reste le helper text affiché sous le champ.

Les champs avec `enum` sont automatiquement résolus en `uiWidget: "select"` pour que le registry les achemine vers `SelectField`.

## User Stories

1. En tant que développeur intégrant un formulaire auto-généré, je veux que chaque champ affiche un label lisible, afin que le formulaire soit utilisable sans configuration manuelle.

2. En tant que développeur, je veux pouvoir spécifier un label personnalisé via `.meta({ title: "..." })` dans mon schéma Zod, afin de contrôler le texte affiché.

3. En tant que développeur, je veux que les labels soient dérivés automatiquement des noms de propriété (camelCase et snake_case), afin de ne pas avoir à spécifier manuellement chaque label.

4. En tant que développeur, je veux que les champs enum soient rendus comme des listes déroulantes (`SelectField`), afin d'offrir une UX correcte sans configuration supplémentaire.

5. En tant que développeur, je veux que la `description` du champ reste affichée comme texte d'aide sous le champ (et non comme label), afin d'avoir à la fois un titre et des instructions.

## Implementation Decisions

### `FieldMeta.label: string` (obligatoire)

Le `label` est toujours présent dans `FieldMeta`. Il n'est jamais `undefined`. Les composants de champ n'ont pas à gérer de fallback — c'est la responsabilité du SchemaProvider.

### Priorité de résolution du label

1. `title` du JSON Schema (ex: `z.string().meta({ title: "Email address" })`)
2. Dérivation via `humanizePath(path)` où `path` est le nom de la propriété

### `humanizePath(path)` — utilitaire de transformation

Transforme les clés machine en labels lisibles :
- `"name"` → `"Name"`
- `"email_address"` → `"Email Address"`
- `"fullName"` → `"Full Name"`
- `"shippingAddressStreet"` → `"Shipping Address Street"`

Support : camelCase ET snake_case, capitalisation du premier caractère de chaque mot.

Placé dans `json-schema-toolkit/src/utils/` comme fonction exportée.

### `JsonSchema.title?: string`

Ajouté pour conformité JSON Schema Draft 2020-12. Alimenté par `z.toJSONSchema()` via `.meta({ title })`.

### `z.toJSONSchema()` remplace `zodToJsonSchema()` manuel

Avantages :
- Support natif de `title`, `description`, `format`, `enum`, `required`, `default`
- Support des futurs types Zod (unions, discriminants)
- Moins de code à maintenir
- Production d'un JSON Schema Draft 2020-12 valide

Inconvénient : nécessite Zod v4+ (déjà en place — `zod@4.4.3`).

### Auto-détection `uiWidget: "select"` pour les enum

Dans `flatfields()`, si un champ a `enum` et pas d'`uiWidget` explicite, on pose `uiWidget: "select"`. Le registry achemine alors vers `SelectField`.

### Séparation label / description

- `label` = titre du champ (affiché au-dessus, via `<FieldLabel>`)
- `description` = texte d'aide (affiché en dessous, via `<FieldDescription>`)

Les deux peuvent cohabiter via `.meta({ title: "...", description: "..." })`.

## Testing Decisions

### Seam principal : `flatfields()`

Le test le plus haut niveau possible est celui de `flatfields()`, qui est déjà testé dans `packages/json-schema-toolkit/tests/utils/flatfields.test.ts`. C'est le point d'entrée unique de la transformation JSON Schema → FieldMeta.

Ce qu'il faut tester :
- `flatfields()` produit un `label` pour chaque champ, dérivé du `title` ou du `path`
- Si `title` présent, il est utilisé comme `label`
- Si `title` absent, `label` = `humanizePath(path)`
- Les champs enum reçoivent `uiWidget: "select"`
- `description` reste indépendant de `label`

Tests de types :
- `FieldMeta.label` est `string` (pas `string | undefined`)

### Seam secondaire : `ZodProvider`

Après la migration vers `z.toJSONSchema()` :
- `ZodProvider` produit les bons `fields` avec `label`, `description`, `enum`, `uiWidget`
- `z.toJSONSchema()` est bien appelé
- `.meta({ title, description })` est correctement propagé

### Prior art

Les tests existants dans `flatfields.test.ts` utilisent `describe`/`it`/`expect` de vitest. Le nouveau test `humanizePath` suivra le même pattern : `packages/json-schema-toolkit/tests/utils/humanize-path.test.ts`.

Les tests de types existent dans `json-schema-toolkit/tests/types.test.ts` — ajouter une assertion `expectTypeOf` pour `FieldMeta.label`.

## Out of Scope

- Validation par champ (onChange) — sera traité dans T2
- Connecter les valeurs et onChange aux composants — sera traité dans T3
- Indicateur requis (*) — sera traité dans T4
- i18n des messages d'erreur — sera traité dans T9
- Support `x-ui-*` extensions — sera traité dans T10

## Further Notes

- `description` était auparavant utilisé dans `flatfields()` mais n'est pas affiché par tous les composants. T3 connectera correctement `description` à `<FieldDescription>`.
- Le ZodProvider actuel a un mapping manuel `zodToJsonSchema()` qui sera entièrement remplacé par `z.toJSONSchema()`. C'est un breaking change interne — les tests existants du ZodProvider devront être mis à jour.
- `z.toJSONSchema()` génère un `$schema: "https://json-schema.org/draft/2020-12/schema"` en en-tête. Cela n'affecte pas `flatfields()` qui lit les propriétés de manière générique.
