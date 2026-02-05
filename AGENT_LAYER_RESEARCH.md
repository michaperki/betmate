# BetMate / OpenClaw Session Research – “Layer on Top of Codex/Claude Code”

Date: 2026-02-05

This document summarizes *how you and the OpenClaw agent actually worked together* during the BetMate work, based on a review of the raw OpenClaw session JSONL transcript.

Primary data source:
- `~/.openclaw/agents/main/sessions/16a20195-eb65-4a16-8f8c-a654b85ae403.jsonl`

Goal of this document:
- Extract **observable interaction patterns** (plans/checklists, file touches, tool usage loops)
- Provide **product requirements** for a UI/“layer” that sits above Codex / Claude Code and makes these workflows first-class

---

## 1) What the collaboration looked like (observed workflow)

### A. High-level loop
1. You state a goal + constraints (e.g. *frontend-only*, *one big commit*, *don’t upgrade deps to satisfy warnings*, etc.).
2. Agent explores repo state via shell (`exec`) + search (`rg`) + targeted file reads.
3. Agent performs *surgical edits* (`edit`) and validates with builds/tests (`exec` + long-running `process` polls).
4. Agent commits/pushes and reports back with commit hashes + deployment status.
5. When blocked (missing env vars / staging DB), agent pivots to gathering the missing info via platform CLI (Heroku).

### B. “Plan/checklist” behavior
The agent frequently emits “next step” guidance, and occasionally a structured plan, but this is mostly **unstructured text** embedded in assistant messages.

What *was* clearly checklist-shaped in this work:
- UI redesign pages to update (admin pages) and verify
- Staging build failure triage steps
- Security review priority list

**Implication for your UI layer:** to support checklists reliably, you’ll likely want a *first-class checklist artifact* that’s separate from plain chat.

---

## 2) Tool usage frequency (from the transcript)

Counts are from tool calls recorded in the JSONL.

Top-level tool usage:
- `process`: **401**
- `exec`: **112**
- `edit`: **28**
- `read`: **11**
- `browser`: **2**
- `write`: **1**
- `sessions_spawn`: **1** (attempted; blocked by allowlist)

### Interpretation
- **`process` dominates** because any non-trivial `exec` (builds, pushes) becomes: `exec` → repeated `process.poll` loops. Your UI should treat this as a single “running command” with streaming output, not 400 separate events.
- **`exec`** is the primary exploration + validation mechanism.
- **`edit`** is used for precise patching once the target text is located.
- **`read`** is used sparingly; `exec` + `rg` + `sed` is often used instead for partial reads.

---

## 3) Recently viewed / modified files (observed)

This is inferable *directly* from OpenClaw tool calls because `read/edit/write` include explicit file paths.

### Most edited files (frequency)
(Counted by number of `edit` tool calls targeting that path)
- `backend/src/controllers/admin_email_controller.ts` — **8** edits
- `frontend/src/components/BettingPanel/component.tsx` — **6** edits
- `backend/src/controllers/admin_users_controller.ts` — **4** edits
- `frontend/src/containers/Dashboard/component.tsx` — **2** edits
- `frontend/src/containers/AdminRiskPage/component.tsx` — **2** edits

### Other touched files (sample)
- `frontend/src/utils/currency.ts`
- `frontend/src/utils/wagerErrorText.ts`
- `frontend/src/components/HelpFAQ/component.tsx`
- `.gitignore`
- `SECURITY_REVIEW.md` (created via `write`)

### Reads observed (sample)
- `frontend/src/components/BettingPanel/component.tsx`
- `frontend/src/components/HelpFAQ/component.tsx`
- `frontend/src/utils/wagerErrorText.ts`
- `backend/src/services/email_service.ts`

**Implication for your UI layer:** “recently viewed files” and “hot files this session” is very feasible if your layer consumes tool-call metadata.

---

## 4) Common command patterns (exec → process)

### A. “Search then open context”
- `rg -n "pattern" <path>`
- `sed -n 'start,endp' file.ts`

This yields fast local context without loading full files into the model.

### B. “Fix → build → repeat”
- edit patch
- `npm run build` or `npm run build-dev`
- `process.poll` until completion

### C. “Git hygiene”
- `git status -sb`
- `git diff --stat`
- `git add ... && git commit -m ... && git push ...`

### D. Platform triage (Heroku)
- `heroku ps/releases/logs/config:get`
- plugin install to access builds output

---

## 5) What artifacts emerged (things your layer should make explicit)

### A. File activity timeline
A useful UI would show:
- chronological list: “Read X”, “Edited Y”, “Wrote Z”, “Ran build command”, “Pushed to remote”, etc.
- ability to click into diffs (from `edit` toolResult details) or open file at line.

### B. Task plans / checklists
You repeatedly benefited from:
- a plan across multiple pages/files
- a “done / in progress / blocked” view

But in the transcript, plans are usually plain text.

**Recommendation:** add a tool/artifact like:
- `createChecklist(title, items[])`
- `tickChecklistItem(id, itemId)`

Then render it in the UI and keep it synced.

### C. Long-running command sessions
Because `process.poll` is so frequent, you want a UI component like:
- “Run #42: npm run build-dev”
  - status: running/succeeded/failed
  - live log
  - duration
  - exit code

Treat each run as a single object.

### D. Environment / deployment context
In the BetMate work, a lot of friction came from:
- staging env var mismatch
- missing MONGODB_URI locally
- Heroku remote confusion

A layer could store:
- known remotes per repo
- known app names per environment
- last successful deploy commit per target

---

## 6) Proposed data model for your “layer”

### Entities
- **Session**
  - id, startedAt, channel (whatsapp), repo contexts
- **Run** (group `exec` + subsequent `process.poll`)
  - command, cwd, startedAt/endedAt, exitCode, stdout/stderr stream
- **FileTouch**
  - path, kind (read/edit/write), timestamp, diff summary
- **Checklist**
  - title, items[{text, status, linksToFiles?, linksToRuns?}]
- **Decision / Constraint**
  - “frontend-only”, “no dependency updates”, “one big commit ok”, etc.

### Derived views
- “Recently viewed files” = last N FileTouch where kind=read/edit
- “Hot files” = count(FileTouch by path)
- “Tool usage” = histogram by tool name
- “Command success rate” = runs succeeded / total

---

## 7) Implementation notes (how to compute this from JSONL)

### Tool-call histogram
```bash
jq -r 'select(.type=="message") | .message.content[]? | select(.type=="toolCall") | .name' \
  ~/.openclaw/agents/main/sessions/<id>.jsonl | sort | uniq -c | sort -rn
```

### File touches (read/edit/write)
```bash
jq -r 'select(.type=="message") | .message.content[]? | select(.type=="toolCall" and (.name=="read" or .name=="edit" or .name=="write"))
  | .name + "\t" + ( .arguments.path? // .arguments.file_path? // "" )' \
  ~/.openclaw/agents/main/sessions/<id>.jsonl
```

### Grouping exec+poll into a “Run”
- `exec` returns a session id for long processes.
- subsequent `process.poll` references that session id.
- group by `process.sessionId` with timestamps.

---

## 8) What I’d want to know from you (to design the layer correctly)

1. Do you want the layer to be **OpenClaw-specific** (consuming its JSONL), or provider-agnostic (Codex CLI, Claude Code, etc.)?
2. Should checklists be:
   - model-generated but user-editable?
   - persisted across sessions?
   - attachable to commits/PRs?
3. Should “recent files” be inferred passively (from tool calls), or also include *manual pinning* by the user?
4. Do you want to expose raw tool arguments/output in the UI, or provide a curated, safe summary view?

---

## Appendix: Limitations of this analysis
- This analysis is based on **one** primary OpenClaw session file (it’s the only one present in `agents/main/sessions/` on this machine right now).
- Some file activity occurs via `exec` (e.g., `sed`, `rg`) and is not always captured as explicit `read` tool calls.
- “Plans” are not consistently structured in a machine-readable way; you’ll likely want explicit artifacts/tools for that.
