Enable "Confirm email" in Supabase
Add logging and analytics
i18n

find . -type f \( -name "_.ts" -o -name "_.tsx" \) -not -path "_/node_modules/_" | while read -r file; do echo "// $file"; cat "$file"; echo -e "\n"; done > combined_output.txt

Immediate next: finish what testing "started"

The suite covers pure logic in two packages. It does not cover:

Any of apps/app — no hook tests (useCreateTask, useMoveTask, etc.), no component tests, nothing exercising the actual Supabase calls or React rendering.
SortableList/List/AsyncList themselves — only the pagination math (getPageNumbers) is tested, not the components that consume it.
The SQL/RPC layer (move_task) — no test ever exercised the fractional-midpoint logic or the "missing neighbor" tolerance fix directly against a database.
