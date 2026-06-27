# AGENTS.md — AI agent instructions for this repo

Purpose

- Help AI coding agents become productive quickly when editing this Next.js + Payload CMS project for sharing maths teaching resources.

Quick commands

- Install: `npm install` (uses `npm` by default)
- Dev: `npm run dev`
- Build: `npm run build`
- Start (prod): `npm run start`
- Run Payload CLI: `npm run payload`
- Generate types/import map: `npm run generate:types`, `npm run generate:importmap`
- Tests: `npm run test` (runs `test:int` + `test:e2e`)

Important places to look (link, don't copy)

- Project README: [README.md](README.md)
- Environment template: [.env.example](.env.example)
- Docker compose: [compose.yml](compose.yml)
- Next config: [next.config.ts](next.config.ts)
- Payload config (collections, globals, plugins): [src/payload.config.ts](src/payload.config.ts)
- Authentication strategy and helpers: [src/strategies/auth0.ts](src/strategies/auth0.ts), [src/lib/auth0.ts](src/lib/auth0.ts)
- Plugins (form/search/seo) and payment flag: [src/plugins/index.ts](src/plugins/index.ts)
- Collections directory (content models): [src/collections/](src/collections/)
- Frontend entry: [src/app/(frontend)/](<src/app/(frontend)/>)
- Payload admin entry: [src/app/(payload)/admin/](<src/app/(payload)/admin/>)
- Tests: [tests/int/](tests/int/) and [tests/e2e/](tests/e2e/)
- CI / linting configs: [vitest.config.mts](vitest.config.mts), [playwright.config.ts](playwright.config.ts), [eslint.config.mjs](eslint.config.mjs)

What agents should do (concise guidance)

- Prefer linking to existing docs instead of embedding large docs. See README for full setup.
- Before running or changing DB-backed code, ensure `.env` is configured (copy from `.env.example`) or use `compose.yml` for local Postgres.
- For schema/collection changes: update `src/collections/*`, then run `npm run generate:types` and run tests. Avoid destructive DB migrations without coordination.
- Authentication: Auth0 is used. Check `src/strategies/auth0.ts` and `src/collections/Users` before touching auth flows.
- Payments: payments are not enabled by default (see `payment: false` in `src/plugins/index.ts`). Search for payment processor code before adding payment integrations.
- Testing: run `npm run run test:int` for quick checks; run e2e (`npm run run test:e2e`) only when necessary or in CI.
- Formatting/linting: run `npm run run lint` and `prettier` before commits.
- Avoid committing secrets or `.env` files. Use CI secrets or `.env` templates.

Common tasks and pointers

- Add a content model: update `src/collections/`, add frontend rendering in `src/blocks/` or `src/app/(frontend)/`, run `npm run generate:types`.
- Update admin UI: payload admin is configured in `src/payload.config.ts` and [src/app/(payload)/admin/].
- Debugging auth problems: replicate locally with `compose.yml` + `.env`, create seeded user tests in `tests/helpers/`.

Proposed next customizations

- Create a short skill for "add-content-model" that scaffolds a collection and its frontend render block.
- Add CI-focused instructions (how to run tests in CI) if desired.

If anything is unclear or you want this in `.github/copilot-instructions.md` instead, tell me which sections to move or expand.
