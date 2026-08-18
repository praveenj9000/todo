Enable "Confirm email" in Supabase
Add logging and analytics
i18n

only fodler
find . -type f \( -name "_.ts" -o -name "_.tsx" \) -not -path "_/node_modules/_" | while read -r file; do echo "// $file"; cat "$file"; echo -e "\n"; done > combined_output.txt

subfolder
find . -type f \( -name "_.ts" -o -name "_.tsx" \) -not -path "_/node_modules/_" | while read -r file; do echo "// $file"; cat "$file"; echo -e "\n"; done > combined_output.txt

Immediate next: finish what testing "started"

The suite covers pure logic in two packages. It does not cover:

Any of apps/app — no hook tests (useCreateTask, useMoveTask, etc.), no component tests, nothing exercising the actual Supabase calls or React rendering.
SortableList/List/AsyncList themselves — only the pagination math (getPageNumbers) is tested, not the components that consume it.
The SQL/RPC layer (move_task) — no test ever exercised the fractional-midpoint logic or the "missing neighbor" tolerance fix directly against a database.

enable ruleset in github, settings > RuleSet > Enforcement - Enable it and save

pnpm --filter @todo/app exec expo start --web

Accessibility axe / Playwright, Performance Lighthouse/Playwright, Linting, Dependency vulnerabilities, API/security tests, Database/RLS tests, SAST, DAST, penetration test

| Layer                      | Tool / approach                          | When                               |
| -------------------------- | ---------------------------------------- | ---------------------------------- |
| Unit tests                 | **Vitest**                               | Every commit/PR                    |
| E2E                        | **Playwright**                           | Every PR                           |
| Type checking              | TypeScript                               | Every commit/PR                    |
| Linting                    | ESLint                                   | Every commit/PR                    |
| Dependency vulnerabilities | `pnpm audit` / Dependabot-style scanning | CI / regularly                     |
| API/security tests         | Automated security tests                 | Every PR                           |
| Database/RLS tests         | Supabase SQL tests                       | Every PR                           |
| SAST                       | CodeQL/Semgrep                           | CI                                 |
| DAST                       | OWASP ZAP                                | CI/nightly                         |
| Full penetration test      | Manual pentest                           | Before production / major releases |
