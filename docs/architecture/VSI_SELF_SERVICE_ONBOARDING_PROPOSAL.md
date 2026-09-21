# Self-service workspace creation

**Status: prepared, not applied.** The migration is `supabase/migrations/039_self_service_workspace.sql`.
Nothing has been run against the Supabase project. To apply it: review, then `supabase db push`.

## Why it is needed

A new account made from the "Create account" form gets a profile with no organization
(`handle_new_user()`). The browser can't fix that itself:

- `trg_guard_profile_privileged_columns` (migration 037) rejects a signed-in user changing their own
  `profiles.role` or `profiles.agency_id`.
- The only functions that create an organization and link a profile, `complete_onboarding()` and
  `claim_invite()`, need an invite code.

## What the migration adds

One function, `public.create_own_organization(p_agency_name text, p_slug text) returns uuid`. It changes no
table, policy or trigger, and leaves `complete_onboarding`, `claim_invite` and `validate_invite` alone.

| Property | How |
|---|---|
| Caller is always the signed-in user | `auth.uid()`. There is no user id, role, agency id or permission argument. |
| Must be signed in | Rejects `auth.uid() is null` (`Not signed in`). `anon` has no EXECUTE at all. |
| Can't choose a role | It never writes `profiles.role`. A new account keeps `pilot` (the column default); an existing `super_admin` stays `super_admin`. |
| Can't join or move to an existing organization | It only `INSERT`s a new `agencies` row. An existing slug fails with `Organization slug is already in use`. |
| One organization per account | The caller's profile row is locked (`FOR UPDATE`), and a profile with an `agency_id` is rejected (`Account is already set up`, the same message `complete_onboarding` uses). Concurrent and repeated calls can't create two. |
| Disabled account | Rejected. |
| Validation | Name: trimmed, 1 to 80 characters, no control characters. Slug: `^[a-z0-9]([a-z0-9-]{0,62}[a-z0-9])?$`. |
| Privilege | `SECURITY DEFINER`, `search_path = public`. The function owner bypasses the profile guard, exactly as `complete_onboarding` does. |
| Grants | `revoke all ... from public, anon`, `grant execute ... to authenticated`. (Supabase's default privileges would otherwise grant `anon` EXECUTE, which is why `complete_onboarding` is executable by `anon` today.) |
| Doesn't rely on broad INSERT policies | It does not use the `agencies` insert policies (below). |

**Role.** The role model has only `super_admin` and `pilot` (`profiles_role_check`, migration 038). There is no
`owner`, so the workspace creator is a normal `pilot`.

## Limits: nothing is invented

The function sets no limits. The new agency gets the column defaults that already exist:

| Limit | Value for a self-service workspace | Where it comes from |
|---|---|---|
| Searches (`max_keywords`) | 10 | column default (migration 006), enforced by `keyword_limit_trigger` |
| Pilot flag (`is_pilot`) | true | column default (migration 006) |
| Projects (`max_clients`) | none (null = unlimited) | column has no default; migration 020 only set `1` on rows that existed then, and `complete_onboarding` leaves it null too |

**Open decision, deliberately not made here:** every project can spend search API credits, and open sign-up
means anyone can create a workspace with no project cap. If you want one, set `max_clients` (for example
`1`) as a separate, reviewed change: either an extra column in the function's `INSERT`, or a change to the
column default. The earlier draft of this proposal hard-coded `10` searches and `1` project; that was a
placeholder and is removed.

## Existing hole this does not fix

`agencies` still has two INSERT policies with `WITH CHECK (true)`: `auth_users_create_own_agency`
(migration 006) and `auth_users_can_create_agency`. Any signed-in user can insert an organization row
directly. The new flow does not use them, and the application never inserts into `agencies` from the browser
(`grep` finds no `from("agencies").insert`), so they can be dropped in a separate, reviewed change. This
migration leaves them alone.

## Abuse controls (outside the database)

Open sign-up also needs Supabase Auth settings: email confirmation on, CAPTCHA, and rate limits. The
confirmation link goes to `<site>/auth/callback`, which must be in Authentication, URL Configuration,
Redirect URLs.

## How it was tested (locally, never against the remote)

- `supabase/tests/self_service_workspace_checks.sql` runs 42 checks against a throw-away local Postgres built
  from the Supabase image with migrations 001 to 039 applied. It uses the real `authenticated` and `anon`
  roles, the real 037 guard trigger and the real invite functions. It ends with a deliberate error so
  everything rolls back. Result: all 42 pass.
- Mutation check: replacing the function with a broken version (writes the role, no already-set-up guard)
  makes 24 of those checks fail, so the checks do detect problems.
- Concurrency check: two simultaneous calls from one account. The second waits for the first, then is
  rejected; exactly one organization exists.
- Application tests (`src/lib/workspace.test.ts`) cover how the onboarding page calls it and reports errors.
