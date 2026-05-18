# Supabase Migrations

Run these files in order in the Supabase SQL Editor (Dashboard → SQL Editor → New query).

## Order

| File | What it does |
|------|-------------|
| `001_core_tables.sql` | Core tables: ideas, trends, market_insights, community_signals, idea_stats |
| `002_auth_tables.sql` | Auth tables: profiles, saved_ideas, claimed_ideas, agent_runs |
| `003_indexes.sql` | Performance indexes on all tables |
| `004_rls.sql` | Row Level Security policies + Data API GRANT statements |
| `005_triggers.sql` | `updated_at` automation + auto-create profile on signup |
| `006_seed.sql` | Sample data: 6 ideas, trends, market insights, community signals |

## Notes

- Run `001` through `005` on a fresh database before running `006`.
- `006_seed.sql` is optional for production — use it for development/staging only.
- `004_rls.sql` includes `GRANT` statements required for the Supabase Data API (REST). Without these, `anon`/`authenticated` roles cannot access tables even with RLS policies in place.
- The `handle_new_user` trigger in `005` auto-inserts a row into `profiles` when a user signs up via Supabase Auth. No manual profile creation needed.
