# Research Protocol — Collecting Real Facts & Logo

Every reel MUST be backed by genuine research saved in `public/research.json`.
Never invent numbers, repo names, release versions, or paper benchmarks.

---

## 1. Information Requirements

A valid `research.json` MUST contain:
1. `name`: Official project/topic name (e.g., "Google harness2")
2. `repo`: GitHub repository or paper URL (e.g., "google-research/harness2")
3. `site`: Documentation/site domain (e.g., "harness2.github.io")
4. `logoPath`: SVG or high-res PNG path in `public/logos/`
5. `keyMetrics`: 4–6 genuine numerical statistics (e.g., `+6.0`, `+0.3`, `+11.5`, `score 61.2`)
6. `coreMechanism`: Exact technical command, flags, or configuration (e.g., `--k 1 --mode parallel`)
7. `competitorBaseline`: What it was evaluated against (e.g., "Direct prompting GPT-4o")

---

## 2. Research Steps

1. **Search official GitHub/Paper**:
   Look for release notes, arXiv paper abstracts, benchmark tables, and CLI argument documentation.
2. **Fetch Brand/Repo Logo**:
   - Save official SVG to `public/logos/<topic>.svg` (or PNG).
   - If no logo exists, create a clean vector monogram with brand hex colors.
3. **Write `public/research.json`**:
   Validate that all numbers match the official source before scripting.
