<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

# Architecture
- Frontend never computes or fabricates research numbers; dashboard reads only imported JSON (src/data/schema.ts) or clearly-labelled demo data isolated in src/data/demo.ts — keeps research integrity.
- Predictions come only from the separate FastAPI service in /backend (URL via VITE_API_BASE_URL) — real fitted artifacts live outside the repo.
