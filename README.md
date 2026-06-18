# Interview Experience Intelligence Platform

EdTech platform that catalogs interview experiences from companies (Adobe, Google, Samsung, …), presents them to students as visually rich infographic pages, and provides an internal team with analytics dashboards.

**Status:** Steps 1 / 2 / 3 complete. The foundation is wired (Next.js + Prisma + Supabase + email/password auth), the full data layer is in place (every model migrated, taxonomy seeded, storage bucket provisioned, Zod schemas mirroring every Prisma model, diagnostic page at `/admin/db-check`), and the admin submission wizard at `/admin/interviews/new` captures and atomically persists a full interview tree. The student-facing infographic page lands in Step 4.

## Tech stack

- **Next.js 15** (App Router) + TypeScript strict mode
- **Tailwind CSS v4** + **shadcn/ui**
- **Prisma 6** ORM
- **Supabase** — Postgres, Auth (email/password), Storage
- Deploys to **Vercel**

## Prerequisites

- **Node.js 20+** (tested on Node 22)
- A **Supabase project** (free tier is fine). Create one at <https://supabase.com>.

## Local setup

```bash
# 1. Clone and install
git clone <this-repo>
cd Interview_experience
npm install

# 2. Configure environment
cp .env.example .env.local
# Then open .env.local and fill in the five values described below.
# Also create a .env file with DATABASE_URL and DIRECT_URL — Prisma CLI
# only reads .env (not .env.local). Both files are gitignored.

# 3. Apply the Prisma schema to your Supabase Postgres
npx prisma migrate dev

# 4. Seed taxonomy (topics, companies, feature flags)
npx prisma db seed

# 5. Apply the Supabase Storage bucket + RLS policies
npx prisma db execute --file supabase/migrations/0001_storage.sql --schema prisma/schema.prisma

# 6. Run the dev server
npm run dev
```

Open <http://localhost:3000>. Sign up, then visit `/admin/db-check` to confirm the data layer is wired.

## Environment variables

All five are required. The `.env.example` file contains commented placeholders.

| Variable                          | Where to find it                                                                       | Notes                                                                                                          |
| --------------------------------- | -------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| `NEXT_PUBLIC_SUPABASE_URL`        | Supabase dashboard → **Project Settings → API** → *Project URL*                        | Public, safe to expose to the browser.                                                                         |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY`   | Same screen → *anon / public* key                                                      | Public, safe to expose to the browser. RLS enforces access.                                                    |
| `SUPABASE_SERVICE_ROLE_KEY`       | Same screen → *service\_role* key                                                      | **Server-only.** Bypasses RLS. Never expose to the browser, never commit.                                      |
| `DATABASE_URL`                    | **Project Settings → Database → Connection string → Transaction pooler** (`6543`)      | Pooled connection used by the app at runtime in serverless environments. Append `?pgbouncer=true&connection_limit=1`. |
| `DIRECT_URL`                      | **Project Settings → Database → Session pooler** (port `5432`, pooler hostname)        | Used by `prisma migrate` for schema changes. The literal "Direct connection" (`db.<ref>.supabase.co:5432`) is IPv6-only on Supabase free tier — prefer the session pooler. |

`.env.local` and `.env` are both gitignored — never commit real values.

## Database & Storage

The full schema is defined in [`prisma/schema.prisma`](prisma/schema.prisma): three core entities (`Interview → Round → Question`), a controlled-vocabulary `Topic` table joined to questions via `QuestionTopic`, `Company`, `Asset`, `User`, `Bookmark`, `FeatureFlag`, and all related enums.

| Task                            | Command                                                                                                |
| ------------------------------- | ------------------------------------------------------------------------------------------------------ |
| Apply schema changes            | `npx prisma migrate dev`                                                                               |
| Reseed taxonomy (idempotent)    | `npx prisma db seed`                                                                                   |
| Apply storage bucket & policies | `npx prisma db execute --file supabase/migrations/0001_storage.sql --schema prisma/schema.prisma`      |
| Inspect tables (GUI)            | `npx prisma studio`                                                                                    |
| Validate schema                 | `npx prisma validate`                                                                                  |
| Deploy migrations to prod       | `npx prisma migrate deploy`                                                                            |

**Storage migration apply options:** the storage SQL lives in `supabase/migrations/0001_storage.sql` and creates the `assets` bucket plus four RLS policies (public read, authenticated insert/update/delete). Apply it either via the `prisma db execute` command above (recommended — uses your existing `DIRECT_URL`) or by pasting the file's contents into **Supabase dashboard → SQL Editor → Run**. The script is idempotent (drops policies before recreating, `on conflict do nothing` on the bucket insert).

**Storage helper:** [`lib/storage.ts`](lib/storage.ts) exposes `uploadAsset(file, "interviews" | "rounds", ownerId)`, `getPublicUrl(path)`, and `deleteAsset(path)`. Object keys are namespaced as `{prefix}/{ownerId}/{uuid}-{sanitized-name}` for collision-proof, traceable storage.

**Zod validations:** [`lib/validations/`](lib/validations/) mirrors every Prisma model — one schema per model plus a composite `interviewFullCreateSchema` that matches the wizard payload landing in Step 3. Enums use `z.nativeEnum(...)` against the generated Prisma enums, so renames/additions in the schema break the schemas at compile time.

**Diagnostic page:** [`/admin/db-check`](app/admin/db-check/page.tsx) is the canonical "is everything wired?" page. Auth-required. Reads from every model, lists topics-by-category with sample names, dumps companies and feature flags, prints the logged-in user's Prisma row, shows zeroes for the still-empty fact tables, and calls Supabase Storage `listBuckets()` to confirm `assets` exists.

## Admin workflow

The submission wizard at [`/admin/interviews/new`](app/admin/interviews/new/page.tsx) captures a full interview process (metadata → rounds → questions → assets) and persists it atomically. Auth-required and role-guarded: only users with `role = ADMIN` or `PANELIST` in the Prisma `User` table can create / edit / delete. Students hit a redirect.

| You want to…                                | Where to go                                                                          |
| ------------------------------------------- | ------------------------------------------------------------------------------------ |
| See every interview                         | [`/admin/interviews`](app/admin/interviews/page.tsx) (paginated 25/page)             |
| Create a new interview                      | [`/admin/interviews/new`](app/admin/interviews/new/page.tsx) (4-step wizard)         |
| Read the full nested tree of one interview  | `/admin/interviews/[id]`                                                             |
| Replace an existing interview               | `/admin/interviews/[id]/edit`                                                        |
| Delete an interview (cascades + storage)    | The "Delete" button on the list or detail page (confirmation dialog)                 |

**Promote yourself to PANELIST or ADMIN.** New signups land as `STUDENT`. Either open `npx prisma studio` and edit your `User.role`, or run:

```bash
echo "UPDATE \"User\" SET role = 'ADMIN' WHERE email = 'YOU@example.com';" \
  | npx prisma db execute --stdin --schema prisma/schema.prisma
```

**The wizard, in four steps:**

1. **Metadata** — company picker (autocomplete; type a new name to create on submit), role + level + year + season + on/off-campus, optional source / CGPA cutoff / total selected, candidate profile (CGPA, branch, grad year, background), final outcome, biggest tip.
2. **Rounds** — add cards with up/down arrows to reorder. Round numbers renumber automatically. Each card collects name, type, duration, mode, # interviewers, style, outcome, key learnings.
3. **Questions** — for each round, add questions. Title + statement + category + difficulty are required. **Topic options are filtered by the chosen category** (Topic table → `category` column). Changing category clears prior topic selections (with a toast). Per-question approach / time given / time taken / solved status / follow-ups / reference URL are optional.
4. **Assets & review** — upload an optional interview-level PDF/DOCX and optional per-round PDF/DOCX (10 MB cap, uploads to Supabase Storage immediately). Add external links (LeetCode lists, blog writeups). Preview the full payload, then submit.

The wizard runs on one React Hook Form instance; navigation is gated per step via Zod `trigger()`. In create mode, the form autosaves to `localStorage['interview-draft-v1']` every 800ms and restores on reload. "Discard draft" clears it.

Submission goes through one of two Server Actions in [`app/_actions/interview.ts`](app/_actions/interview.ts):

- `createFullInterview(payload)` — auth-guards, Zod-validates, then writes the entire `Interview → Round → Question → QuestionTopic + Asset` tree in a single `prisma.$transaction` via the pure helper `lib/interview/write.ts#createInterviewTree`. New companies are upserted inside the same transaction.
- `updateFullInterview(id, payload)` — same guards, but uses `replaceInterviewTree`: deletes existing rounds (cascade kills questions + topic joins + round-level assets) and interview-level assets, updates the interview row in place, recreates everything from the new payload. Then, **after the transaction commits**, orphaned storage objects are deleted best-effort.
- `deleteInterview(id)` — collects asset URLs, deletes the row (cascade), then deletes storage objects.

The transactional logic is exercised by [`scripts/test-create.ts`](scripts/test-create.ts) — run `npx tsx scripts/test-create.ts` to validate create → replace → delete end-to-end without going through the UI.

## Verification (local)

1. **DB diagnostic** — sign up, log in, visit <http://localhost:3000/admin/db-check>. Topics ≈ 144, Companies = 10, Feature flags = 3, `assets` bucket status: OK.
2. **Signup** — visit <http://localhost:3000/signup>, create an account. You should be redirected to `/admin` (or `/login` if your Supabase project has email-confirmation enabled — confirm and log in).
3. **Profile sync** — in Supabase dashboard → **Table editor → User**, see a new row with your email and `role = STUDENT`.
4. **Protected route** — visit `/admin` while logged out; you should be redirected to `/login`.
5. **Logout** — clicking *Logout* should return you to `/` and clear the session.

## Available scripts

| Script               | What it does                                                                       |
| -------------------- | ---------------------------------------------------------------------------------- |
| `npm run dev`        | Start the dev server (Turbopack)                                                   |
| `npm run build`      | Production build                                                                   |
| `npm run start`      | Run the production build                                                           |
| `npm run lint`       | ESLint                                                                             |
| `npm run typecheck`  | `tsc --noEmit` (strict mode)                                                       |
| `npm run db:migrate` | `prisma migrate dev` — apply schema changes & generate client                      |
| `npm run db:seed`    | `prisma db seed` — idempotent seed of topics, companies, and feature flags         |
| `npm run db:studio`  | `prisma studio` — visual DB browser                                                |

## Deploying to Vercel

1. Push this repo to GitHub.
2. In Vercel: **New Project → Import** the repo. The framework preset is auto-detected as Next.js.
3. Under **Environment Variables**, add all five variables from `.env.local`.
4. Deploy. Vercel runs `npm install` (which triggers `prisma generate` via the `postinstall` hook) and `npm run build`.
5. Visit the deployed `/admin/db-check` URL after logging in to confirm the production data layer is wired.

If you add migrations later, run `npx prisma migrate deploy` against your production DB. The storage SQL only needs to run once per Supabase project — re-running it is safe (idempotent).

## Project layout

```
app/
├── (auth)/
│   ├── login/                # /login — email/password form (Suspense-wrapped for useSearchParams)
│   └── signup/               # /signup — creates Supabase user + Prisma profile
├── admin/                    # protected routes
│   ├── db-check/             # /admin/db-check — diagnostic page reading every model
│   └── interviews/           # /admin/interviews — list / new / [id] / [id]/edit
├── _actions/                 # Server actions (createUserProfile, signOut, interview CRUD, asset upload)
├── layout.tsx
└── page.tsx                  # Landing
components/
├── MarkdownRenderer.tsx      # server-only unified pipeline: remark-parse + remark-gfm + remark-rehype + rehype-sanitize + @shikijs/rehype + rehype-stringify
├── forms/wizard/             # 4-step submission wizard (client; one RHF instance)
└── ui/                       # shadcn/ui primitives (mostly @base-ui/react under the hood)
lib/
├── auth/                     # requireAdminOrPanelist() + Unauthorized/Forbidden errors
├── db.ts                     # Prisma client singleton
├── interview/                # createInterviewTree / replaceInterviewTree — pure transaction helpers
├── slug.ts                   # slugify() helper
├── storage.ts                # uploadAsset / getPublicUrl / deleteAsset (Supabase Storage)
├── utils.ts                  # cn() helper
├── supabase/                 # @supabase/ssr helpers (client / server / middleware)
└── validations/              # Zod schemas mirroring every Prisma model + composite wizard schema
prisma/
├── schema.prisma             # Full data model
├── migrations/               # Prisma migration history
└── seed.ts                   # Idempotent seed: 144 topics, 10 companies, 3 feature flags
scripts/
└── test-create.ts            # End-to-end create/replace/delete cycle through the pure helper
supabase/
└── migrations/
    └── 0001_storage.sql      # assets bucket + RLS policies
middleware.ts                 # Refreshes session, guards /admin/*
```

## Roadmap

Steps 1 / 2 / 3 are done. Step 4 builds the student-facing infographic page (the visual showpiece). Future work: public catalog & company pages, analytics dashboards, taxonomy management UI, Google OAuth, Cloudflare CDN, Sentry/PostHog/Resend integrations.
#   p r e p _ t r a c k  
 