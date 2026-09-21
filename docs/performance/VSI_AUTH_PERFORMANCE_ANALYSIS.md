# VSI authentication performance analysis (Phase 2 investigation)

Date: 2026-09-20. Investigation only. **No code, database, RLS, Supabase configuration or environment was changed, and nothing was committed.**

Evidence labels: **[V]** read in the code and re-checked, **[M]** measured (by me here, or in the earlier audit), **[E]** shown by a local experiment in this investigation, **[D]** derived by arithmetic, **[U]** unverified, with what would verify it.

## 1. Current authentication request flow

### A page request (for example `/dashboard/tasks`) [V]

| Step | What runs | Network | Where |
|---|---|---|---|
| 1 | Middleware: `supabase.auth.getUser()` | **Supabase Auth `GET /user`** | `src/middleware.ts:56` |
| 2 | Middleware decides: signed-in user, or public path, or redirect to `/login` | none | `src/middleware.ts:78-99` |
| 3 | Layout and page start together. Both call `requireAgency()`, which calls the React-`cache`d `getSession()`, so the work runs once | | `src/lib/auth.ts:122,200` |
| 4 | `getSession`: `supabase.auth.getUser()` | **Supabase Auth `GET /user` (second call)** | `src/lib/auth.ts:148` |
| 5 | `getSession`: profile + organization read, filtered by `user.id` | PostgREST | `src/lib/auth.ts:150-153` |
| 6 | Page and layout data | PostgREST | pages, loaders |

Sequential trips before the page's own reads: **1, 4, 5** (three). The two Auth trips are the "duplicate" the audit found.

### An API request [V]

The middleware runs first, exactly as above (one Auth trip). Then, depending on the route:

| Route group (57 routes) | Route-level check | Extra Auth trips |
|---|---|---|
| 24 | `requireAgency()` | 1 (`getUser`) + profile read |
| 12 | `requireSuperAdmin` or `adminApiSession` | 1 + profile read |
| 2 | `getSession()` | 1 + profile read |
| 1 | `auth.getUser()` directly (`/api/notifications`, one per handler) | 1 |
| 1 | `CRON_SECRET` bearer token (public to the middleware) | 0 |
| **13** | **none, or Supabase client only** (RLS decides what data comes back) | **0: the middleware is the only session check** |
| 4 | none, and public to the middleware (`/api/auth/*` x2 sign-in, `/api/qa/*` x2) | 0 |

The 13 routes whose only session check is the middleware are: `/api/aio`, `/api/analyze`, `/api/check`, `/api/citation-content`, `/api/prompts/simulate`, `/api/rank`, `/api/resolve`, `/api/search`, `/api/serp-rankings`, `/api/notifications/clear-all` (no check at all), plus `/api/export`, `/api/messages` and `/api/notifications/[id]` (Supabase client, RLS decides). The four public ones are the two `/api/auth/*` sign-in routes and `/api/qa/check`, `/api/qa/login`. Nine of the 13 can call paid services (`/api/check`, `/api/aio`, `/api/rank`, `/api/serp-rankings`, `/api/search`, `/api/analyze`, `/api/resolve`, `/api/prompts/simulate`, `/api/citation-content`).

**No single handler verifies the session more than once** (checked per handler) [V]. The earlier note that chat verifies twice does not hold: each chat route calls `getSession()` once.

### Sign-in, callback and sign-out [V]

- Password sign-in runs in the browser (`signInWithPassword`). The Supabase client (`@supabase/ssr`) stores the session in cookies named `sb-<project>-auth-token`. Those cookies are **not HttpOnly** (the library default; the browser client must read them).
- Email confirmation and OAuth return to `/auth/callback`, which is a public path. It runs `exchangeCodeForSession` on the server, which sets the same cookies.
- The app also sets non-secret marker cookies (`vsi_session`, `vsi_user_email`, `vsi_user_name`). **They grant nothing** on a real Supabase project: they are honoured only when Supabase is a placeholder and `NODE_ENV` is not production (`src/lib/auth-rules.ts`), and there is a test for it.
- Sign-out: `supabase.auth.signOut()` in the browser (default scope is global), then the markers are cleared. This revokes the session on the Auth server.

### Token refresh [V, from the library source]

The access token lasts `jwt_expiry` (3600 s in the local config; the hosted value is **[U]**, verifiable from any real token's `exp - iat`). When less than 90 s remain, the first call that loads the session refreshes it with the refresh token, and the rotated tokens are written back through the cookie `setAll` callback. **Only the middleware can write cookies to the browser**: in a Server Component `cookieStore.set` throws and the code swallows it (`src/lib/supabase/server.ts`). The middleware also copies refreshed cookies onto the request so the page renders with the new token (`src/middleware.ts:35-46`).

## 2. Exact duplicate calls

| | Middleware call | `getSession` call |
|---|---|---|
| Code | `supabase.auth.getUser()` at `middleware.ts:56` | `supabase.auth.getUser()` at `auth.ts:148` |
| Endpoint | Supabase Auth `GET /user` | the same |
| Token sent | the access token from the request's `sb-*-auth-token` cookie | the same token (refreshed by the middleware first if it was expiring) |
| Response | the full user object | the same user object |
| What the code keeps | only whether a user exists (`!!user`) | `user.id` (profile filter, `session.userId`) and `user.email` (`session.email`) |

Answers to the specific questions:

- **Do they return the same information?** Yes. Same endpoint, same token, same response. The middleware discards everything except "a user exists". [V]
- **Does either do extra security validation?** No. Both are the identical call. The Auth server checks the token signature and expiry, that the user still exists, and that the token's session is still active (the library documents this: a `session_id` with no active session means the user signed out and the session is removed locally). [V from the library source; the server side is the library's description, **[U]** for banned users]
- **What does the middleware add?** The redirect gate for non-public paths, the token refresh with cookie propagation, and the project-cookie set for deep links. [V]
- **What does `getSession` add?** The profile read (role, organization, disabled flags). The disabled-account and disabled-organization checks (`isAccountBlocked`) are **database-level**, run on every render, and do not depend on the Auth call. [V]
- **Does anything downstream rely on the middleware's result?** **No.** No server code reads a header the middleware sets, and the code never forwards the middleware's user. The only implicit dependencies are (a) the redirect gate and (b) the cookie-refresh side effect. [V: grep for `headers()`, `x-` headers and the `vsi_*` cookies]
- **Does the middleware protect routes that must stay protected?** Yes. Every non-public path requires a signed-in user, including `/onboarding` and the 13 API routes above that have no other session check. Public paths: `/`, `/login`, `/privacy`, `/r`, `/qa`, `/api/qa`, `/api/cron`, `/api/auth`, `/auth/callback`. [V]
- **Do Server Components need fresh Auth state?** They need an **authenticated identity** (`id`, and `email` for display and the audit log's `actor_email`). They do **not** use the Auth server for any authorization decision: role, organization and disabled state all come from the database on every render. Email is never used to authorize (verified after the allowlist removal). [V]
- **Would cookie/session refresh change if one call were removed?** Only if the **middleware's** call were removed without replacing its refresh, because Server Components cannot persist a refresh. Removing `getSession`'s call changes nothing about refresh. [V]

Measured cost of one Auth call from this machine to Tokyo: about **170-185 ms** (the middleware call: median 203 ms vs 32 ms for the same redirect without a session) [M, from the audit]. I assume `getSession`'s call costs the same, since it is the same call [D].

## 3. What each call validates

| | Middleware `getUser` | `getSession` `getUser` |
|---|---|---|
| Signature and expiry | Yes (server side) | Yes (server side) |
| Session still active (not signed out elsewhere) | Yes | Yes |
| User still exists | Yes | Yes |
| Token refresh | Yes, and persists cookies | Can refresh, cannot persist |
| Route protection | Yes (redirect) | No (returns null; the caller redirects) |
| Profile, role, disabled flags | No | Yes (from the database, not from the token) |

## 4. Security-sensitive behaviour that must be preserved

1. Unauthenticated requests never reach a protected page or API route. [V]
2. A forged, tampered or expired token is rejected. [E: local verification rejects all three; see section 5]
3. **A signed-out or revoked session is rejected promptly** for every route that passes through the middleware today, including the 13 routes whose only session check is the middleware. This is the one property that a "local verification" change can weaken. Signing out revokes the session; a validly signed, unexpired token stays cryptographically valid until it expires (up to `jwt_expiry`).
4. Role, organization and disabled state are read from the database on each render and never from a token claim or client input. [V]
5. Identity is never taken from client-supplied data: no client user id, role or organization id is trusted. [V]
6. RLS is untouched and remains the data-access authority (PostgREST validates the JWT itself for every query). [V]
7. Cookie refresh keeps working (middleware persists it; otherwise refresh-token rotation can invalidate the session). [V]
8. Fail closed: if authentication cannot be established (Supabase unreachable, invalid token), the request is treated as signed out. [V for today's behaviour]
9. The placeholder-URL development session stays impossible against a real project. [V, tested]

## 5. Possible approaches

### What a local check can and cannot do (facts for every option) [E]

Tested with `@supabase/auth-js` 2.112.4 (the installed version), a throw-away key pair, a fake project URL and a counter on every outbound request:

| Case | Result | Network |
|---|---|---|
| valid ES256 token, first use in the process | accepted | one JWKS fetch |
| valid ES256 token, later uses | accepted in **1-8 ms** | **none** |
| a new client instance in the same process | accepted | **none** (the key cache is module-level, 10-minute TTL) |
| expired token | rejected ("JWT has expired") | none |
| signed by a different key | rejected ("Invalid JWT signature") | none |
| tampered payload (`sub` changed) | rejected | none |
| `HS256`-labelled or `alg=none` token | falls back to the Auth server, which rejected it | one `/user` call |
| unknown key id | falls back to the Auth server | JWKS + `/user` |

Two consequences: forged tokens fail in every case, and every fallback is safe because it goes to the Auth server. **What a local check cannot do is notice a revoked session**, because it never asks the server. That is the trade-off in every option below.

**Signing keys.** The hosted project publishes one **ES256** key at its JWKS endpoint [M], so its user tokens should verify locally. That the tokens in real cookies are ES256 with that key's `kid` is **[U]**: it needs one real login (decode the header of the cookie's access token). If they were HS256, the library silently falls back to the Auth server and the change would save nothing (never unsafe).

### Option A: keep the middleware's call and forward its result

The middleware puts the verified user id and email into a request header, and `getSession` reads that header instead of calling Auth.

- **Security:** highest risk. Any code that trusts a header depends on the middleware always running and always overwriting a client-sent copy; a bypass would let a client choose its own identity. It could only be made safe by signing the header with a new server-only secret (new secret management, replay window, three code paths in the middleware that build responses).
- **Refresh:** unchanged (middleware still refreshes).
- **Trips saved:** 1 (removes `getSession`'s call).
- **Complexity:** high.
- **Files:** `src/middleware.ts`, `src/lib/auth.ts`, a new signing helper, deployment configuration.
- **Regressions:** header spoofing if any step is missed; the header is visible in logs.
- **Its one advantage:** it works even if the tokens were HS256.

### Option B: keep the middleware only as the online check and refresher; verify the token locally in `getSession`

`getSession` replaces `getUser()` with `getClaims()` and takes `id` (`sub`) and `email` from the verified claims. The middleware is unchanged.

- **Security:** the signature and expiry are still cryptographically verified on every server render; forged and expired tokens are rejected [E]. **Every request still goes through the middleware's online `getUser`**, which has just confirmed in the same request that the session is active, so the revocation behaviour of every existing route (including the 13 that rely only on the middleware) is **unchanged**. The only loss is defence in depth: if the middleware were ever bypassed, a revoked but unexpired token would be accepted by `getSession` for up to `jwt_expiry`. Role, organization and disabled state still come from the database, never from claims.
- **Session refresh:** unchanged. The middleware still refreshes and persists cookies, and `getClaims` reads the refreshed cookie. It calls `getSession` internally, which would refresh only inside the 90 s margin that the middleware has already handled.
- **Trips saved:** **1 on every page and every route that calls `getSession`/`requireAgency`/`requireSuperAdmin`/`adminApiSession`** (about 80 files: 38 API routes (24+12+2) and the dashboard and admin pages and layouts).
- **Complexity:** low. About 20 lines in `getSession` plus tests.
- **Files:** `src/lib/auth.ts` only (and its tests). `src/app/api/notifications/route.ts` could later use the same helper for its own `getUser`.
- **Potential regressions:** (1) if real tokens are HS256, no gain (falls back); (2) `email` in the token is stale until the next refresh if a user changes it (up to `jwt_expiry`; used only for display and `audit_log.actor_email`); (3) the first request per server process (and once per 10 minutes) pays a JWKS fetch; (4) the mocks in the existing tests would change.

### Option C: move verification to the server and make the middleware light

- **C1: the middleware uses `getClaims()` (local verification plus refresh); `getSession` keeps its online `getUser()`.**
  - **Security:** the online check moves from "every request" to "wherever a route or page calls `getSession`". The **13 routes that rely only on the middleware lose their online revocation check** (including nine that can spend money), unless each is given its own check. Pages are unaffected (they all call `requireAgency` or `requireSuperAdmin`). This matches the Next.js guidance that a proxy should do cheap optimistic checks and verification belongs next to the data, and the current Supabase Next.js pattern.
  - **Refresh:** must keep working: `getClaims()` without an argument calls `getSession()`, which refreshes and persists through the middleware's cookie callback. Needs a test with an expiring token.
  - **Trips saved:** 1 (the middleware's), **and it applies to every request type**: API polls, prefetches and RSC navigations, not only pages that call `getSession`. The 15-second messages poll and the notifications calls would each stop paying about 170 ms and stop hitting the Auth server.
  - **Complexity:** low to medium.
  - **Files:** `src/middleware.ts`, its tests, and (to close the revocation gap) `requireAgency()` added to the sensitive routes.
  - **Regressions:** the revocation gap above; cost of Auth-server load moves rather than disappears.
- **C2: remove the middleware's call entirely and let the layout do everything.**
  - **Not viable:** without a refresh in the middleware, Server Components cannot persist a rotated token, and the browser keeps a spent refresh token. Not considered further.

### Option D: other approaches within the existing architecture

- **D1: run `getUser()` and the profile read in parallel.** This needs the user id before the profile query, which would have to come from an unverified read of the cookie's token. The query is authenticated by that same token in the database, so it would not be exploitable, but it is a manual decode and it saves a trip without removing a request. **Not recommended.**
- **D2: share the middleware's result through React `cache`.** Impossible: the middleware runs in a different runtime and context from the render.
- **D3: local verification in both places (B + C1).** Removes both trips, but there is then **no online session check anywhere**: sign-out revocation takes up to `jwt_expiry` to take effect everywhere. Only defensible if the owner accepts that window and the paid routes get their own check. **Not recommended as a first step.**
- **D4: reduce the cost of the remaining call instead** (run the app in the same region as Supabase). Independent of all of the above and complementary.

### Comparison

| | Trips saved | Applies to | Revocation behaviour | Complexity | Needs ES256 |
|---|---|---|---|---|---|
| A: forward via header | 1 | pages + session routes | unchanged | high (new secret) | no |
| **B: local verify in `getSession`** | **1** | **pages + session routes** | **unchanged** (middleware still online) | **low** | **yes** |
| C1: local verify in middleware | 1 | **every request** | **weakened** on 13 routes | low-medium | yes |
| D3: both local | 2 | everything | **weakened everywhere** | medium | yes |

## 6. Recommended approach

**Option B**, delivered in one small change to `getSession`, with these conditions:

1. **Confirm the token algorithm first.** Sign in once and check that the access token's header is `ES256` with a `kid` present in the project's JWKS. If not, do not proceed (the change would be a no-op).
2. **Fail closed.** Any `getClaims` error (expired, bad signature, JWKS unreachable, malformed) returns "no session", exactly as a failed `getUser` does today.
3. **Take only `sub` and `email` from the claims.** Never read a role, organization or permission from the token; keep the database profile read and the disabled checks unchanged. The profile query is filtered by the verified `sub`.
4. **Leave the middleware exactly as it is**, so every request keeps its online session check and the refresh behaviour does not change.

Why B over the others: it removes a trip on every authenticated page and every route that uses `getSession`, with **no change to which sessions are accepted** (the middleware still asks the Auth server on every request), the smallest and most reversible code change, and no new secret. C1 saves more requests but weakens revocation on nine paid routes. A only wins if the tokens were HS256.

**Decision for the owner (not made here):** whether to go further later. C1 would also remove the middleware's call from every request type, at the cost of the revocation gap on the 13 routes, which could be closed by adding `requireAgency()` to the nine paid ones (a change that also fixes the missing organization check the audit noted).

## 7. Expected performance impact

- **Option B: one fewer sequential Auth trip on the shared chain.** Dashboard pages go from 3 to 2 sequential trips after the middleware (4 to 3 counting it). At the measured 170-185 ms per Auth call from India to Tokyo that is **about 170-185 ms less per page load** [D]; with the app in the same region as Supabase it would be about 10-20 ms [D].
- **Local cost:** 1-8 ms per verification, no network [E]. **First request per process, and once every 10 minutes, adds one JWKS fetch** (a single trip, shared by all clients in the process) [E].
- **API routes that call `getSession`** (38 routes) save the same trip. Routes with no session check and the notification and message polls do **not** change under B.
- **Option C1 would additionally** remove about 170 ms from every API poll and prefetch [D], and cut the Auth-server traffic roughly in half.
- These are estimates from measured per-call costs. **A real before/after needs the login and a project** (see the Phase 1 results, section 7).

## 8. Tests required before implementation

**Unit tests (repository, no network).**

1. `getSession` with a verified claims result returns the session with `userId = sub` and `email = claim`, and **never calls `getUser`**.
2. `getSession` returns `null` for each `getClaims` error: expired, invalid signature, malformed token, JWKS unreachable, no cookie.
3. The profile read is filtered by the verified `sub`; a session's role, organization and `isPilot` come only from the profile row, even when the token carries `role`, `app_metadata` or `user_metadata` claims claiming `super_admin`.
4. Existing behaviour is preserved: disabled user and disabled organization return `null`, a user without an organization is sent to `/onboarding`, `requireSuperAdmin` sends members away, `adminApiSession` returns 401/403 (all existing tests keep passing with the auth mock updated).
5. The middleware still calls `getUser` (network) and still redirects unauthenticated requests: pins the property that the online check stays.
6. A revoked session (Auth server answers 403 `session_not_found`) is rejected at the middleware and redirects to `/login`. Today's tests do not cover this.

**Integration test against a fake Auth server (recommended; no Supabase project needed).** Run a built server against a local mock that implements `/auth/v1/user`, `/auth/v1/token?grant_type=refresh_token`, `/.well-known/jwks.json` and the profile read, with tokens signed by a throw-away ES256 key. Assert, per page request, **exactly one `/user` call** (middleware) and zero from `getSession`; that a token inside the 90 s refresh window is refreshed once, the new cookies reach both the browser and the page render, and the next request uses them (guards the refresh-token-rotation hazard); that a JWKS outage fails closed; and that a forged token is redirected.

**One real check.** With the real project and one real login: decode the access-token header (`alg`, `kid`) and confirm it matches the JWKS key, measure `exp - iat` for the hosted token lifetime, and confirm the per-request Supabase call sequence now shows one `/user` call.

**Security regression checks.** Confirm no code path reads a role or organization from a token or a header; confirm the placeholder-URL development session is still refused against a real project (existing test).

**Not required but useful.** A test that `getClaims` verification cost stays under a few milliseconds when the key cache is warm.

## 9. What is not verified

- **[U]** That real user tokens are ES256 with the published key. (Needs one login.)
- **[U]** The hosted `jwt_expiry` (the local config says 3600).
- **[U]** That the Auth server rejects banned users on `/user`.
- **[U]** The end-to-end refresh-cookie behaviour in a running server; the design relies on the documented middleware pattern, which the current middleware already implements.
- **[U]** Real per-page timings for the Auth calls (no login was available).

Existing tests: all 201 pass with two workers. In the default parallel run on this memory-starved machine, one to four tests intermittently hit the 5-second timeout on first module import; each passes when its file is run alone.
