# Package Creation Workflow

Processus standard pour créer un nouveau package dans ce monorepo.

## Étapes

### 1. Design

Invoquer le skill `/brainstorming` :
- Exploration du contexte
- Questions de clarification (une à la fois)
- Proposition de 2-3 approches avec recommandation
- Rédaction d'un design doc → `docs/superpowers/specs/YYYY-MM-DD-<topic>-design.md`
- Validation par l'utilisateur

### 2. Plan

Invoquer le skill `/writing-plans` :
- Découpage en tâches implémentables
- Plan → `docs/superpowers/plans/YYYY-MM-DD-<topic>.md`
- Chaque tâche est indépendante et vérifiable

### 3. Implémentation (TDD)

Pour chaque tâche du plan :
1. **Tests d'abord** — écrire les tests de types (`expectTypeOf`) avant le code
2. **Implémenter** — le code qui fait passer les tests
3. **Documenter** — ajouter les pages Fumadocs en parallèle (`apps/fumadocs/content/docs/<package>/`)
4. **Vérifier** :
   ```bash
   pnpm --filter <package> test           # tests runtime
   pnpm --filter <package> check-types    # tsc --noEmit
   pnpm --filter fumadocs build           # build doc
   ```

### 4. Intégration

- Ajouter le package au `registry.json` (GitHub Registry) si distribuable
- Ajouter une entrée dans `CONTEXT.md` (glossaire du domaine)
- Mettre à jour `AGENTS.md` (section du package)

### 5. Commit

```bash
git add <files>
git commit -m "feat(<package>): description"
git push origin master
```

## Rappels

- `verbatimModuleSyntax: true` — toujours `import type` pour les types
- `noUncheckedIndexedAccess: true` — accès tableau/index toujours `| undefined`
- Indentation : tabulations
- Quotes : doubles
- Tests : vitest avec `expectTypeOf` (types-first)
- Documentation : Fumadocs, en français
