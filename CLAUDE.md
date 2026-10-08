# CLAUDE.md

Instructions for Claude Code in this repo. Read this first every session.

## Who I'm working with

Shravan Lad, a beginner coder (intro Python + intro data science at Cornell, no web dev experience). This is their first coding project. They want to **ship it and understand it**. Everything lives on GitHub and runs in a cloud environment (no local laptop storage).

- Explain jargon the first time it appears, in plain English.
- Balance learning and shipping. Don't dump big blocks of code without explaining them.
- **Don't make big decisions without asking.** Taste matters a lot here. Offer a recommendation, then let Shravan choose.
- Use they/them if you ever need a pronoun for Shravan and they haven't said otherwise.

## The project

A personal website: one place to get to know Shravan Lad, professionally and personally. Fully static (plain HTML, CSS and a little JavaScript, hosted on GitHub Pages). Live at `shhravan.github.io/personal-website`; later `shravanlad.com`.

Source of truth docs (read before building):
- `docs/PRD.md`: what we're building and why
- `docs/DESIGN.md`: how it should look and feel
- `docs/TECH_RULES.md`: technical rules (written before the first build slice)
- `todo.md`: thin slices, one at a time
- `LEARNING.md`: running notes of what each slice taught

## Workflow

1. Short docs from Q&A: PRD, DESIGN, TECH_RULES (about a page each).
2. `todo.md` of thin slices.
3. Git setup and a hello-world page deployed early.
4. For each slice:
   1. new branch
   2. **plan first** and wait for Shravan's OK
   3. build
   4. Shravan checks it in the browser
   5. open a PR
   6. explain back what the code does in plain English
   7. add to `LEARNING.md`
5. Polish at the end.

## Rules

- One slice per branch and PR. Keep PRs small and reviewable.
- Never push to `main` directly. Never open a PR without being asked, except as the workflow above says.
- Reference sites are inspiration only. **Adapt and customize; never copy** their code, text, images or artwork.
- Placeholder content is fine (bio, project descriptions, photos). Mark it clearly, and help Shravan draft the real copy.
- Out of scope for v1: login, database, accounts, blog admin or comments, print sales, live Spotify integration, dark mode, heavy animation. See the PRD.
- Voice on the site is lowercase and casual (see DESIGN).
- Keep things simple. Prefer fewer files and no build tools or frameworks unless TECH_RULES says otherwise.
