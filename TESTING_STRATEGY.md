BetMate — Pragmatic E2E Test Strategy (Flows > Chess Edge Cases)

Goals
- Validate core money and wagering flows deterministically.
- Focus on Arcade (KBITZ) and Real (USDT) modes, deposits, settlement, and risk gating.
- Keep tests API-first for reliability; drive UI only to simulate user interactions where valuable.

What We Test
- Auth and wallet basics (already covered).
- Deposits (NOWPayments mock) with balance updates (covered and will add deltas).
- Wager placement and settlement:
  - Arcade WDL: fixed odds at bet time; simulator drives outcome; assert token balance delta.
  - Real Move: parimutuel with rake; advance chosen SAN; assert wager status and exact cash balance delta using winning_pool_share.
  - Real WDL: already covered; remains in suite.
- Risk gating:
  - Server rejections via per-bet and aggregate caps using admin overrides.
  - Ensure no balance debit on rejection and reason codes are returned.

Enablers
- Dev Simulator endpoints to advance moves or play short sequences.
- Admin risk overrides (in-memory) to force deterministic rejections and reset between tests.
- Balance APIs: /auth/jwt-signin, /auth/balance-history for precise assertions.

Suite Structure
- Smoke: auth+wallet, deposit mock, Arcade WDL settle, Real WDL settle.
- Full: adds Real Move settle and risk gating, plus optional edge cases.

Notes
- Tests create their own sample games; no external engine dependency.
- Real Move single-winner case yields payout of stake × (1 − rake); net delta may be negative due to rake.
- Tests rely on docker-compose defaults (dev admin key, faucet enabled, simulator enabled).

