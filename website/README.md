# BRICS Economic Growth Lab

## [Live Demo → https://brics-growth-insights.lovable.app](https://brics-growth-insights.lovable.app)

A research showcase and interactive dashboard for machine-learning analysis of economic growth across Brazil, Russia, India, China, and South Africa (2000–2024). Training covers 2000–2019; the held-out test period is 2020–2024. Models predict `Ingdp` (log GDP), not causal effects.

**Research repository:** https://github.com/aasthasethi28/brics-economic-growth-ml

The website source includes a TanStack Start / React / TypeScript frontend and a separate FastAPI prediction service. The published website does not by itself host that Python service or include trained models.

## Local setup

### Website

Install Node.js (a current LTS version) and Bun, then run from this website source folder:

```bash
bun install
bun run dev
```

Open http://localhost:8080. In a local `.env` file, set:

```dotenv
VITE_API_BASE_URL=http://localhost:8000
```

Restart the website after changing this value. Only put public configuration here: `VITE_` values are exposed to visitors. Never add private keys. Run frontend tests with `bun run test`.

### Prediction service — separate terminal

Use Python 3.10 or newer:

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
# Windows PowerShell instead: .venv\Scripts\Activate.ps1
pip install -r requirements.txt
cp .env.example .env
# Windows PowerShell instead: Copy-Item .env.example .env
uvicorn main:app --reload --port 8000
```

Check http://localhost:8000/api/health. Place your own fitted artifacts locally in `backend/artifacts/`, or configure their paths in `backend/.env`. See [backend setup and export instructions](backend/README.md) for exact filenames and feature order. No artifacts are bundled or fabricated; predictions return a clear `503 model_not_configured` error when the selected model is unavailable.

For a hosted prediction service, use an HTTPS service address for `VITE_API_BASE_URL` in the website's hosting configuration and set `CORS_ORIGINS=https://brics-growth-insights.lovable.app` in the service environment (append other allowed origins with commas). Rebuild/redeploy the website after changing its API address. A visitor's `localhost` is their own computer, not the deployed prediction service.

### Dashboard results

The dashboard starts empty. Use **Import results JSON** with verified results matching [src/data/schema.ts](src/data/schema.ts): `panel`, `metrics`, `predictions`, `correlation`, `vif`, and `importance`. CSV outputs must first be converted to this schema. Optional illustrative data is isolated in `src/data/demo.ts` and explicitly labelled; it is not research evidence. Keep private results JSON out of Git as well.

## GitHub sync: authorization and limitations

**Lovable cannot sync this project directly into an existing repository.** Connecting creates a **new private repository**, with two-way sync to one selected branch. It does not replace or merge into `aasthasethi28/brics-economic-growth-ml`.

1. **Desktop:** open the project name → Settings → Git (or chat **+ → Project → GitHub**).
2. **Mobile:** switch to Chat mode → **+ → Project → GitHub**, or **… → Settings → Git**.
3. A workspace owner/admin authorizes the Lovable GitHub app for their GitHub account or organization. A workspace/project owner/admin then connects this project. GitHub may also require organization-owner approval.
4. Review GitHub's requested permissions. Lovable requests write access for contents, pull requests, workflows, and administration, and read access to metadata. Prefer selected-repository access where available; ensure the newly created sync repository is included. Granting access to the existing research repository does **not** make it a supported sync destination.
5. Confirm the new repository name and sync status in Settings → Git. This must be completed by you in Lovable; a source-code change or the GitHub API connector does not establish Git sync.

See [official GitHub sync documentation](https://docs.lovable.dev/integrations/github).

## Represent the website in the existing research repository safely

Two safe options:

- **Link only:** add the Live Demo link above to the existing research README through a feature branch and pull request. Keep its current research content; do not replace that README with this one.
- **Include the website source:** after export, clone both repositories locally and create a feature branch in the research repository. Copy only reviewed website source into a **new, unused `website/` folder**, keeping this README at `website/README.md`. If that folder exists, choose another unused name. Add only the Live Demo link and a link to the website setup guide to the research repository's existing README.

For a source copy, include `src/`, `public/`, `backend/main.py`, `backend/requirements.txt`, `backend/README.md`, the placeholder `backend/artifacts/.gitkeep`, the secret-free `backend/.env.example`, package/lock files, and required root configuration files. Keep the website's `.gitignore` and `AGENTS.md` inside its new folder. **Never copy either repository's `.git` directory, dependencies, build output, real datasets, private results JSON, `.env` files containing secrets, or trained artifacts.** Review every copied file, including public assets and configuration, before staging it.

Review the pull request to ensure there are no changes to existing notebooks, research scripts, datasets, or research files. Do not force-push or merge unrelated repository histories. The research repository will **not** automatically sync with Lovable: transfer later website updates through reviewed pull requests, while the separate Lovable-created repository remains the sync source.

## Sensitive-file safeguards

The existing `.gitignore` excludes spreadsheets, CSV data, environment secrets, Python environments/caches, and the configured artifact folder except its empty `.gitkeep`. Secret-free `.env.example` templates are allowed. The root ignore file is read-only in this Lovable project and has not been changed.

The supplemental [safe-excludes.txt](safe-excludes.txt) template covers additional dataset/model formats and data/results folders. **Git does not apply this template automatically.** Merge its rules into `website/.gitignore` in the receiving repository before staging the website copy, preserving existing research ignore rules. Include this template when transferring the website files.

Before committing in your local clone, inspect:

```bash
git status --short
git diff --cached --name-only
git diff --cached
# Example check after copying into website/:
git check-ignore website/backend/.env website/backend/artifacts/xgboost.json
```

Ignore rules do not remove files already tracked by Git, and cannot identify secrets embedded in source or arbitrary JSON. Do not stage everything blindly. If sensitive files are already tracked, untrack them separately without deleting your local research, rotate any exposed secrets, and arrange history cleanup if needed; do not rewrite the Lovable-synced branch's published history casually.
