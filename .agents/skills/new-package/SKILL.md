---
name: new-package
description: Walk through the full package creation workflow — design → spec → plan → TDD → doc → registry. Invoke with `/new_package <name> : <description>`.
---

# new-package

Crée un nouveau package dans ce monorepo en suivant le workflow défini dans
[PACKAGE-WORKFLOW.md](../../../PACKAGE-WORKFLOW.md).

**Invocation :** `/new_package <name> : <description>`
- `<name>` — nom du package (kebab-case, ex: `auto-form`)
- `<description>` — optionnelle, une ligne sur le rôle du package

## Contexte du projet

Ce projet est un monorepo **Better-T-Stack** orchestré par **Nx** + **pnpm workspaces**.
Tu as accès aux MCP servers suivants :
- **nx** — pour comprendre la structure du workspace, explorer les projets,
  visualiser les dépendances, lancer des targets
- **shadcn** — pour ajouter des composants UI, gérer les registres, les presets
- **better-t-stack** — pour ajouter des addons au projet (fumadocs, opentui, etc.)

## Règles

1. **TDD strict** — tests de types (`expectTypeOf`) avant le code d'implémentation
2. **Documentation en parallèle** — pages Fumadocs créées pendant l'implémentation,
   pas après
3. **Tout commit doit passer** : `pnpm test` + `pnpm check-types` (ou `tsc --noEmit`)
   + `pnpm --filter fumadocs build`
4. **Distribution** — tout nouveau package distribuable est ajouté au `registry.json`
5. **Vocabulaire** — les termes du domaine sont ajoutés à `CONTEXT.md` au fur et à mesure
6. **AGENTS.md** — mis à jour avec la section du nouveau package

## Pré-vérification

Avant de commencer, valide que :
- Le nom du package n'existe pas déjà dans `packages/`
- Le nom suit le format kebab-case
- Le scope est adapté à un seul package (si c'est trop gros, suggère un découpage)

## Processus

### 1. Design

- Invoque le skill `/brainstorming` pour explorer et concevoir le package
- Utilise **Nx MCP** (`nx_nx_docs`, `nx_nx_visualize_graph`) pour comprendre
  les dépendances avec les packages existants
- Le design doc va dans `docs/superpowers/specs/YYYY-MM-DD-<name>-design.md`
- **Completion :** design doc écrit, validé par l'utilisateur, commité

### 2. Plan

- Invoque le skill `/writing-plans` pour découper en tâches
- Le plan va dans `docs/superpowers/plans/YYYY-MM-DD-<name>.md`
- Utilise **Nx MCP** pour identifier les dépendances entre projets
- Chaque tâche doit être indépendante et vérifiable
- **Completion :** plan écrit, validé, commité

### 3. Scaffold

Si le package n'a pas d'infrastructure spécifique (ex: besoin d'un addon
better-t-stack), crée la structure minimale :

```bash
mkdir -p packages/<name>/src
```

Ajoute `package.json` et `tsconfig.json` en suivant les conventions du monorepo
(vérifier avec un fichier existant comme `packages/json-schema-toolkit/package.json`).

Pour les packages avec UI (React), utiliser **shadcn MCP** pour initialiser
la configuration appropriée.

**Utilise Nx MCP** :
- `nx_nx_docs` pour la configuration Nx du nouveau projet
- Vérifie que le projet est correctement enregistré dans `nx.json`

### 4. Implémentation (TDD)

Pour chaque tâche du plan :
1. **Tests d'abord** — `expectTypeOf` avant le code (vitest)
2. **Implémenter** — code qui fait passer les tests
3. **Documenter** — pages Fumadocs dans `apps/fumadocs/content/docs/<name>/`
   (au moins : index, installation, api-reference)
4. **Vérifier** :
   ```bash
   pnpm --filter @code2-base-ui/<name> test
   pnpm --filter @code2-base-ui/<name> check-types
   pnpm --filter fumadocs build
   ```

### 5. Intégration

- Ajouter le package au `registry.json` (GitHub Registry) si distribuable
- Ajouter une entrée dans `CONTEXT.md`
- Mettre à jour `AGENTS.md` avec la section du nouveau package
- Mettre à jour le `meta.json` de Fumadocs pour la navigation
- Utiliser **shadcn MCP** pour valider le registre :
  ```bash
  npx shadcn@latest registry validate ./registry.json
  ```

### 6. Finalisation

- Vérifier que tout le workspace compile :
  ```bash
  pnpm check-types
  ```
- Committer :
  ```bash
  git add -A
  git commit -m "feat(<name>): description"
  git push origin master
  ```

## Notes

- Le package `config` fournit `tsconfig.base.json` — l'étendre, pas le dupliquer
- Les dépendances communes sont dans le `catalog:` du `package.json` racine
- Pour les composants React, privilégier `packages/ui` (shadcn) comme dépendance
- Les MCP servers (nx, shadcn, better-t-stack) sont disponibles toute la session
