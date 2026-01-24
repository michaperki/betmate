Context: Featured Card clocks showing “Scheduled”, CORS preflight failures, and request correlation

Date: 2026-01-21

What we changed
- Backend CORS: Added X-Request-Id/X-Trace-Id to allowed headers and introduced env-driven origins (ALLOWED_ORIGINS) to avoid preflight blocks when FE sends custom headers.
- Request IDs: Added AsyncLocalStorage-backed middleware to capture/propagate a request ID, auto-attached to logs and passed to the microservice as x-trace-id/x-request-id.
- Featured Card bug: The Featured endpoint occasionally returned status=not_started even mid-game (moves > 0) when the Lichess stream “start” event was missed or not yet processed. We:
  - Mark game_status=in_progress on first move as a fallback in the Lichess stream handler.
  - Treated any game with move_hist length > 0 as live in the Featured/Details DTOs and included clocks accordingly.
  - Added FE hydration to fetch clocks once if the featured DTO is missing them.
- Tagging: Removed hardcoded/high‑stakes fallback. Only show tag when meaningful (currently “Time Trouble” when live and a clock ≤ threshold). Keep meta line showing speed/source.

Why this took multiple attempts
- Initial hypothesis: featured selection preferred a not_started game; solution was to prefer in-progress. This helped but did not address the core issue where status remained not_started even after moves (missing “start” event path). The FE still showed “Scheduled”.
- We then added server-side DTO logic to infer live when move_number > 0 and added a stream fallback to set in_progress on first move. This addressed the true root cause.
- The CORS error appeared after we introduced X-Request-Id on the FE. We resolved it by explicitly allowing the header in CORS config. This was a straightforward preflight mismatch.

Verification
- Dashboard loaded: Featured card shows LIVE and ticking clocks; no “Scheduled” during mid-game. If clocks absent in featured payload, they hydrate after one detail fetch.
- CORS: No more preflight errors for X-Request-Id; FE requests succeed.
- Logs include trace_id correlated with FE and microservice calls.

Follow-ups
- Optional: switch CORS allowedHeaders to reflect incoming Access-Control-Request-Headers dynamically to avoid future misses.
- Optional: pool/exposure-based secondary signals behind an admin flag if we want richer tags without implying big stakes.

