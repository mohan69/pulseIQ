# PulseIQ Persistence

PulseIQ Assessment Workbench now has two data modes behind the same
`AssessmentRepository` interface.

## Memory Mode

Memory mode is the default:

```env
PULSEIQ_DATA_MODE=memory
```

It uses the existing `globalThis` in-memory store and seeds the deterministic
Bharat Heavy Fabrications demo automatically. This keeps local development,
demo routes, and golden tests working without PostgreSQL or `DATABASE_URL`.

## Database Mode

Database mode uses Prisma with PostgreSQL:

```env
DATABASE_URL="postgresql://pulseiq:change-me@localhost:5432/pulseiq?schema=public"
PULSEIQ_DATA_MODE=database
```

If `PULSEIQ_DATA_MODE=database` is selected without `DATABASE_URL`, the
workbench fails with a clear configuration error.

## Setup Commands

Generate the Prisma client:

```bash
npm run db:generate
```

Push the schema to PostgreSQL:

```bash
npm run db:push
```

Seed the Bharat Heavy Fabrications golden demo:

```bash
npm run db:seed
```

Then run the app with:

```bash
PULSEIQ_DATA_MODE=database npm run dev
```

On Windows PowerShell:

```powershell
$env:PULSEIQ_DATA_MODE="database"; npm run dev
```

## Demo Seed

The seed script writes the same demo data used by memory mode:

- Assessment id: `asm-bharat-heavy-fabrications`
- 8 sources
- 20 facts
- 5 truth layers
- 5 what-if scenarios
- 10 recommendations

The report is still composed at request time from persisted sources, facts, and
assessment outputs.

## Why Memory Remains Default

Memory mode remains default so the current deterministic demo and local
development workflow continue to work without database setup. This also keeps
golden regression tests independent from external services.

## Current Limitations

- No file upload or object storage yet.
- No auth or organization-level authorization yet.
- No live connectors yet.
- Database mode uses a single default internal organization until auth/tenant
  scoping is added.
- Tests do not require a real database; database seeding is verified manually
  through `npm run db:seed` after configuring PostgreSQL.
