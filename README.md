
# NestForge Starter
<p align="center">
  <img src="landing/src/assets/logo.svg" width="150" alt="NestForge logo" />
</p>


<p align="center">
  <a href="https://www.npmjs.com/package/create-nestforge"><img src="https://img.shields.io/npm/v/create-nestforge?style=flat-square&logo=npm&color=780f20" alt="npm version"></a>
  <a href="https://www.npmjs.com/package/create-nestforge"><img src="https://img.shields.io/npm/dm/create-nestforge?style=flat-square&label=downloads&color=780f20" alt="npm downloads"></a>
  <a href="https://github.com/mouloud240/NestForge"><img src="https://img.shields.io/github/stars/mouloud240/NestForge?style=flat-square&logo=github&color=780f20" alt="GitHub stars"></a>
  <a href="LICENSE"><img src="https://img.shields.io/npm/l/create-nestforge?style=flat-square&label=license&color=780f20" alt="License"></a>
  <a href="https://nodejs.org"><img src="https://img.shields.io/badge/node-%3E%3D%2022-780f20?style=flat-square&logo=node.js&logoColor=white" alt="Node.js &gt;= 22"></a>
  <a href="https://github.com/mouloud240/NestForge"><img src="https://img.shields.io/badge/tests-24%20passing-780f20?style=flat-square&label=tests" alt="Tests passing"></a>
  <a href="https://github.com/mouloud240/NestForge"><img src="https://img.shields.io/badge/PRs-welcome-780f20?style=flat-square" alt="PRs welcome"></a>
</p>

`create-nestforge` is a command-line tool that scaffolds a production-ready
NestJS project. Answer a couple of prompts and you get a working application you
can build on top of — picking between an Express + REST API and an Express +
GraphQL (Apollo) API.

## Capabilities

The generated project ships with:

- **Interactive scaffolding** — prompts for project name and variant, then
  creates the project in the directory where you ran the command.
- **Non-interactive mode** — `--project-name`, `--variant`, `--oauth-providers`,
  `--target-dir`, `--git`, `--no-git`, `--help`, and `--version` flags for automation and CI.
- **Express + REST** — a NestJS API with URI versioning (`/api/v1`).
- **Express + GraphQL** — an Apollo (code-first) `/graphql` endpoint layered
  over the REST API, with auth and user resolvers plus per-request
  DataLoaders.
- **Auth-ready** — Passport local and Google OAuth strategies (Google selectable
  at scaffold time), Redis-backed sessions, guards, DTO validation,
  email-verification codes, and password reset.
- **WebSocket gateway** — socket.io gateway with a Redis adapter for
  horizontal scaling and 1-to-1 messaging.
- **Background jobs** — BullMQ queues for mail and upload processing.
- **Mailer** — `@nestjs/mail` with HTML templates and typed `Mailable`
  classes for verification and password-reset emails. Transport is picked by
  `MAIL_TRANSPORT` (`file` writes `.eml` files in dev, `smtp` or `resend` for
  real delivery).
- **Prod-grade abstractions** — repository pattern (`USER_REPOSITORY` token),
  upload service behind an injectable token, config via `registerAs`, so you
  swap implementations without touching callers.
- **Testing suite** — Suites-based unit tests (`TestBed.solitary`) with a
  configured Vitest setup.
- **Docker support** — dev and production Dockerfiles, a `compose.yaml` with
  Redis, Postgres, and a Traefik reverse proxy, plus a PM2 ecosystem file.
- **Security baseline** — Helmet, native Fetch-Metadata CSRF protection
  (`app.enableCsrfProtection()` with `CSRF_TRUSTED_ORIGINS`), global rate
  limiting with Redis-backed storage.
- **Observability** — Swagger/Scalar docs at `/api-docs`, Terminus health
  checks, Winston logging with request context.
- **Boots without a database** — persistence is a no-op stub by default, so you
  can start building immediately.

## Quickstart

```bash
npx create-nestforge
```

You will be asked for a project name and which variant to scaffold, then the CLI
copies the template (layering the GraphQL overlay when selected), sets the
package name, and creates a `.env` from the example. The project is created in
the current directory, named after the project.

## Running the generated project

### Docker (recommended)

The compose stack brings up the app, Redis, and Traefik, so nothing else needs
to be installed locally:

```bash
cd my-nest-app
cp .env.example .env
docker compose up
```

The app is served through Traefik at `http://localhost` (port 80).

### Manual

This route requires Redis running locally:

```bash
docker run -p 6379:6379 redis:latest
```

Then:

```bash
cd my-nest-app
pnpm install
cp .env.example .env
pnpm start:dev
```

The app runs on `http://localhost:3000`. Interactive API docs are at
`/api-docs` (Scalar on top of the OpenAPI document).

## Monorepo layout

```
.
├── cli/            # create-nestforge (interactive scaffolder)
├── templates/
│   ├── base/       # Express + REST + Redis-session NestJS app (no-op defaults)
│   └── graphql/    # GraphQL overlay applied over base
└── landing/        # Astro docs site
```

## Development

```bash
pnpm install

# Build everything (CLI, template, landing)
pnpm build

# Run the template app in watch mode
pnpm dev:base

# Tests
pnpm test

# Lint
pnpm lint
```

## Workspace scripts

| Command             | Description                                  |
| ------------------- | -------------------------------------------- |
| `pnpm build:cli`    | Build the CLI and bundle the base template   |
| `pnpm build:base`   | Type-check and compile the base template     |
| `pnpm test:base`    | Run the base template unit tests             |
| `pnpm dev:base`     | Run the base template in watch mode          |

## Template notes

- `USER_REPOSITORY` is a no-op stub. Add a real repository when you are ready to
  persist users.
- OAuth providers can be selected at scaffold time. The registry auto-disables
  providers whose environment variables are not configured.
- Rate limiting is enabled globally via `ThrottlerGuard`.
- `QueueModule` is registered as a global module (`@Global`) because queues will
  be used across many parts of the app. If that is not the case, drop `@Global`
  and import `QueueModule` where it is needed instead.
- The GraphQL variant mounts `/graphql` (Apollo Sandbox in development) and
  keeps the full REST API.
- CSRF protection uses Nest's native Fetch-Metadata protection
  (`app.enableCsrfProtection()` in `main.ts`, no tokens or cookies).
  Cross-origin state-changing requests must come from `CSRF_TRUSTED_ORIGINS`
  (falls back to `FRONTEND_URL`); cookie-parser stays registered for sessions.

## License

MIT © Mouloud Hasrane
