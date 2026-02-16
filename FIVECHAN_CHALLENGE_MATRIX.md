# 5chan Anti-Spam Challenge Matrix (Proposed)

## Quick Reference

| User | Excluded? | Captcha? | Pending? |
|---|---|---|---|
| Mods | Yes (role match) | No | No |
| Trusted, under rate limit | Yes (activity+age+rate match) | No | No |
| Trusted, over rate limit | No (rate limit breaks the match) | Yes | Yes |
| Any author, under 5 failures/hr | Yes (failure rate under limit) | Depends on trust | Depends on trust |
| Any author, 5+ failures/hr | No (failure rate exceeded) | Hard reject | N/A |

This document proposes a `settings.challenges` profile for 5chan-style boards:

- Split `post` and `reply` challenge behavior.
- Require captcha + pending approval for untrusted users on both posts and replies.
- Trusted users bypass captcha only when under the rate limit AND meeting activity + age thresholds.
- When trusted users exceed the rate limit, they fall back to captcha + pending approval instead of a hard reject.
- Block authors who fail captcha too many times (5+ failures/hr) with a hard reject and progressive cooldown.
- Do not modify `_defaultSubplebbitChallenges`; apply this via `subplebbit.edit`.

## Challenges JSON (JSONC with inline comments)

```jsonc
{
  "settings": {
    "challenges": [
      {
        // Brute-force gate.
        // Authors who fail captcha 5+ times per hour get hard-rejected.
        // The hard reject itself increments the failure counter, creating
        // a progressive cooldown that keeps them locked out.
        "name": "fail",
        "description": "Blocks authors with excessive failed captcha attempts.",
        "options": {
          "error": "Too many failed attempts. Try again later."
        },
        "exclude": [
          // Mod bypass.
          { "role": ["moderator", "admin", "owner"] },

          // Anyone under 5 failed attempts per hour is excluded (allowed through).
          // Once failures hit 5/hr, this exclude stops matching and the fail
          // challenge applies, hard-rejecting the author.
          { "rateLimit": 5, "rateLimitChallengeSuccess": false }
        ]
      },
      {
        // Post captcha gate.
        // Untrusted users or trusted users exceeding rate limit must solve captcha
        // and go to pending approval.
        "name": "captcha-canvas-v3",
        "description": "Post captcha for untrusted or rate-exceeded users.",
        "pendingApproval": true,
        "options": {
          "characters": "6",
          "width": "280",
          "height": "96",
          "colors": "#2f9e44,#1c7ed6,#e8590c"
        },
        "exclude": [
          // Only for posts.
          { "publicationType": { "reply": true } },

          // Mod bypass (no rate limit).
          { "role": ["moderator", "admin", "owner"] },

          // Trusted bypass requires sustained activity + account age + under rate limit.
          // If rate limit is exceeded, trust bypass stops matching and captcha+pending kicks in.
          { "postCount": 10, "firstCommentTimestamp": 604800, "rateLimit": 3, "rateLimitChallengeSuccess": true },
          { "replyCount": 20, "firstCommentTimestamp": 604800, "rateLimit": 3, "rateLimitChallengeSuccess": true }
        ]
      },
      {
        // Reply captcha gate.
        // Untrusted users or trusted users exceeding rate limit must solve captcha;
        // replies go to pending approval.
        "name": "captcha-canvas-v3",
        "description": "Reply captcha for untrusted or rate-exceeded users.",
        "pendingApproval": true,
        "options": {
          "characters": "5",
          "width": "260",
          "height": "90",
          "colors": "#2f9e44,#1c7ed6,#e8590c"
        },
        "exclude": [
          // Only for replies.
          { "publicationType": { "post": true } },

          // Mod bypass (no rate limit).
          { "role": ["moderator", "admin", "owner"] },

          // Trusted bypass requires activity + account age + under rate limit.
          // Thresholds match post captcha since reply flooding via sybil accounts
          // is the most practical spam vector.
          { "postCount": 10, "firstCommentTimestamp": 604800, "rateLimit": 6, "rateLimitChallengeSuccess": true },
          { "replyCount": 20, "firstCommentTimestamp": 604800, "rateLimit": 6, "rateLimitChallengeSuccess": true }
        ]
      }
    ]
  }
}
```

## Why This Design

The profile is designed around three abuse patterns on 5chan-style boards:

1. Captcha brute-forcing (automated solving).
2. Thread creation spam.
3. In-thread reply flood.

It uses different controls for each path so moderation load stays bounded while normal replying stays usable.

### Challenge 0 (`fail`, brute-force gate) stops automated captcha solving

- Goal: limit captcha-solving attempts so that ML/OCR-based solvers and human captcha farms cannot try indefinitely.
- Mechanism:
  - Tracks failed challenge attempts via `rateLimitChallengeSuccess: false`.
  - Authors under 5 failures/hr are excluded (allowed through to captcha challenges).
  - At 5+ failures/hr, the `fail` challenge applies and hard-rejects the author.
  - The hard reject itself counts as a failure (`addToRateLimiter` records `challengeSuccess: false`), so the author accumulates failures faster than tokens regenerate — a progressive cooldown.
  - Mods are always excluded via role bypass.

### Challenge 1 (`captcha-canvas-v3`, post-only, `pendingApproval: true`) protects scarce thread slots

- Goal: new/untrusted users should not consume thread capacity cheaply. Trusted users who exceed the rate limit also get captcha + pending instead of a hard reject.
- Why strict on posts:
  - 5chan board capacity is finite (commonly `per_page * pages`, e.g. `150` total threads).
  - Each post can trigger long-tail moderation/storage costs.
- Mechanism:
  - Applies only to posts (replies are excluded by publication type).
  - Trusted users bypass only if they meet activity + age thresholds AND are under the rate limit (3 posts/hour).
  - If a trusted user exceeds the rate limit, the exclude rule stops matching and they must solve captcha + go to pending approval.
  - Untrusted users always must solve captcha and successful post is marked pending approval.

### Challenge 2 (`captcha-canvas-v3`, reply-only, `pendingApproval: true`) also gates untrusted replies

- Goal: require friction for untrusted repliers and route their replies through moderator review. Same rate-limit fallback as posts.
- Why pending on replies:
  - A spammer who solves the captcha would otherwise get replies published immediately.
  - Pending approval ensures moderators can catch spam that slips past the captcha.
- Mechanism:
  - Applies only to replies.
  - Trusted users bypass only if they meet activity + age thresholds AND are under the rate limit (6 replies/hour).
  - If a trusted user exceeds the rate limit, they fall back to captcha + pending approval.
  - Untrusted users always solve captcha; successful reply is marked pending approval.

### Why these trust rules

- `role` bypass: mods should never be blocked by anti-spam controls.
- Post captcha bypass (stricter — thread slots are scarce):
  - `postCount >= 10` **plus** `firstCommentTimestamp >= 7 days` **plus** `rateLimit <= 3/hr`
  - `replyCount >= 20` **plus** `firstCommentTimestamp >= 7 days` **plus** `rateLimit <= 3/hr`
- Reply captcha bypass (same activity thresholds as posts — reply flooding via sybil accounts is the most practical spam vector):
  - `postCount >= 10` **plus** `firstCommentTimestamp >= 7 days` **plus** `rateLimit <= 6/hr`
  - `replyCount >= 20` **plus** `firstCommentTimestamp >= 7 days` **plus** `rateLimit <= 6/hr`
- Why require activity AND age AND rate limit:
  - Standalone activity counts are easy to game (farm approvals quickly on a new account).
  - Standalone age is easy to game (create account, wait, then spam).
  - Rate limit prevents trusted users from bursting — exceeding the limit downgrades them to captcha + pending instead of hard-rejecting.
  - Requiring all three makes captcha bypass significantly harder to abuse.
- Why trust decays naturally:
  - Archived posts are purged from the subplebbit database, so `postCount`/`replyCount` decrease over time.
  - Sleeper accounts that stop participating lose their trusted status as old content is archived.

## Reviewer Notes (Important Behavior)

- `exclude` semantics:
  - One exclude object is AND logic.
  - Exclude array is OR logic.
- `pendingApproval` only applies to comment publications and only when challenge verification succeeds with at least one non-excluded pending challenge.
- `postCount/replyCount` trust checks count only non-pending comments.
- Rate limiter state is memory-resident (process restart resets buckets).
- The `fail` challenge's `rateLimitChallengeSuccess: false` tracks ALL failed challenge outcomes across the subplebbit, not just failures from a specific challenge.

## Source References

### Plebbit-js internals

- Exclude evaluation semantics (AND within item, OR across array):
  - `src/runtime/node/subplebbit/challenges/exclude/exclude.ts:40`
  - `src/runtime/node/subplebbit/challenges/exclude/exclude.ts:57`
  - `src/runtime/node/subplebbit/challenges/exclude/exclude.ts:95`
- `postCount/replyCount` pulls from DB counts:
  - `src/runtime/node/subplebbit/challenges/exclude/exclude.ts:81`
  - `src/runtime/node/subplebbit/challenges/exclude/exclude.ts:84`
- Rate limit behavior and keying:
  - `src/runtime/node/subplebbit/challenges/exclude/rate-limiter.ts:44`
  - `src/runtime/node/subplebbit/challenges/exclude/rate-limiter.ts:56`
  - `src/runtime/node/subplebbit/challenges/exclude/rate-limiter.ts:99`
  - `src/runtime/node/subplebbit/challenges/exclude/rate-limiter.ts:107`
- Pending approval decision path:
  - `src/runtime/node/subplebbit/challenges/index.ts:345`
  - `src/runtime/node/subplebbit/challenges/index.ts:349`
- Pending filter used in count queries:
  - `src/runtime/node/subplebbit/db-handler.ts:1124`
  - `src/runtime/node/subplebbit/db-handler.ts:2137`
  - `src/runtime/node/subplebbit/db-handler.ts:2146`
- `author.subplebbit` enrichment source for challenge requests:
  - `src/runtime/node/subplebbit/local-subplebbit.ts:2067`
  - `src/runtime/node/subplebbit/local-subplebbit.ts:2076`

### 5chan behavior reference

- Board capacity and bump-limit model:
  - https://github.com/Rinse12/5chan_board_custom_community/blob/main/README.md
- Archiver implementation of capacity and bump-limit handling:
  - https://github.com/Rinse12/5chan_board_custom_community/blob/main/src/archiver.ts

## Outcome Matrix

| User Type | Publication Type | Challenge Prompt? | Pending Approval? | Why |
|---|---|---:|---:|---|
| Mods (`moderator/admin/owner`) | Post | No | No | Role excludes all challenge gates. |
| Mods (`moderator/admin/owner`) | Reply | No | No | Role excludes all challenge gates. |
| Any author, 5+ captcha failures/hr | Any | Hard reject (no captcha) | N/A | Brute-force gate (Challenge 0) blocks after 5 failures/hr with progressive cooldown. |
| Trusted (`postCount >= 10` + `age >= 7 days`), under 3 posts/hr | Post | No | No | Captcha bypassed by activity+age+rate limit. |
| Trusted (`postCount >= 10` + `age >= 7 days`), over 3 posts/hr | Post | Yes (`captcha-canvas-v3`) | Yes | Rate limit exceeded; trust bypass stops matching, falls back to captcha+pending. |
| Trusted (`postCount >= 10` + `age >= 7 days`), under 6 replies/hr | Reply | No | No | Captcha bypassed by activity+age+rate limit. |
| Trusted (`postCount >= 10` + `age >= 7 days`), over 6 replies/hr | Reply | Yes (`captcha-canvas-v3`) | Yes | Rate limit exceeded; trust bypass stops matching, falls back to captcha+pending. |
| Trusted (`replyCount >= 20` + `age >= 7 days`), under 3 posts/hr | Post | No | No | Captcha bypassed by activity+age+rate limit. |
| Trusted (`replyCount >= 20` + `age >= 7 days`), over 3 posts/hr | Post | Yes (`captcha-canvas-v3`) | Yes | Rate limit exceeded; falls back to captcha+pending. |
| Trusted (`replyCount >= 20` + `age >= 7 days`), under 6 replies/hr | Reply | No | No | Captcha bypassed by activity+age+rate limit. |
| Trusted (`replyCount >= 20` + `age >= 7 days`), over 6 replies/hr | Reply | Yes (`captcha-canvas-v3`) | Yes | Rate limit exceeded; falls back to captcha+pending. |
| New user (no trust rule matched) | Post | Yes (`captcha-canvas-v3`) | Yes | Must pass post captcha; successful post goes to pending approval. |
| New user (no trust rule matched) | Reply | Yes (`captcha-canvas-v3`) | Yes | Must pass reply captcha; successful reply goes to pending approval. |

## Notes

- This complements, not replaces, board lifecycle controls (thread capacity `150` and bump limit `300`) from your archiver flow.
- `postCount`/`replyCount` trust checks use approved comments only (pending comments are excluded from those counts).
- Trust decays naturally: archived posts are purged from the database, reducing `postCount`/`replyCount` over time.
- Votes are not accepted on 5chan boards, so no vote-specific challenge rules are needed.
- Tune `rateLimit` and trust thresholds by board type:
  - Fast boards: lower reply rate limit, higher trust thresholds.
  - Slow boards: higher reply rate limit, lower trust thresholds.
