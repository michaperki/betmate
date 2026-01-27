
## Dev Directions Doc: Move Menu Transitions (toggleable variants)

### Goal

Implement **3–5 sleek, non-invasive transition styles** for the left “Move Menu” tiles (Move A/B/C/D) that animate when:

* the **set of candidate moves changes** (new SAN/UCIs, new ordering, new scores), and/or
* a move **enters/leaves** the visible list.

Make the transition style **toggleable** via:

* a **single feature flag** (env/localStorage), and optionally
* a small **UI toggle** in dev builds.

---

## Assumptions

* Frontend is **React + TypeScript**.
* You can add **Framer Motion** (recommended) or use pure CSS transitions.
* The Move Menu is a component with a list like:

  ```ts
  type MoveCandidate = {
    id: string;      // stable per move, e.g. `${uci}` or `${uci}-${ply}`
    label: string;   // "Nf3" etc
    score: number;   // 100, 90...
    // ...whatever else
  }
  ```

If you currently don’t have stable IDs: **create them first** (critical for clean animations).

---

## Deliverables

1. `MoveMenu.tsx` updated to support `transitionVariant`.
2. `moveMenuTransitions.ts` exporting `MoveMenuTransitionVariant` + config.
3. Optional: `MoveMenuTransitionToggle.tsx` for dev.
4. A quick “demo harness” route or story (if you have Storybook) that swaps candidate lists every 1–2s to visually evaluate.

---

## Step-by-step Implementation Plan

### 1) Add Framer Motion (preferred)

From `frontend/`:

```bash
pnpm add framer-motion
# or npm i framer-motion
```

### 2) Define variants + feature flag

Create:
`frontend/src/features/moveMenu/moveMenuTransitions.ts`

```ts
export type MoveMenuTransitionVariant =
  | "none"
  | "fade"
  | "slide"
  | "flip"
  | "stack"
  | "morph";

export const DEFAULT_MOVE_MENU_TRANSITION: MoveMenuTransitionVariant = "fade";

export function getMoveMenuTransitionVariant(): MoveMenuTransitionVariant {
  // Priority: localStorage override -> env -> default
  const fromLs = typeof window !== "undefined"
    ? (window.localStorage.getItem("bm_move_menu_transition") as MoveMenuTransitionVariant | null)
    : null;

  if (fromLs) return fromLs;

  const fromEnv = (import.meta as any)?.env?.VITE_MOVE_MENU_TRANSITION as MoveMenuTransitionVariant | undefined;
  if (fromEnv) return fromEnv;

  return DEFAULT_MOVE_MENU_TRANSITION;
}
```

Add to `.env.local`:

```bash
VITE_MOVE_MENU_TRANSITION=fade
```

### 3) Update MoveMenu to animate list diffs

In `MoveMenu.tsx`, wrap the list with `AnimatePresence` and each tile with `motion.div`.

Core rules:

* **Use stable keys**: `key={move.id}`
* Use `layout` for smooth reorder (Framer’s FLIP).
* Use `AnimatePresence mode="popLayout"` (or `"sync"`) for enter/exit.

Skeleton:

```tsx
import { AnimatePresence, motion } from "framer-motion";
import { getMoveMenuTransitionVariant, MoveMenuTransitionVariant } from "./moveMenuTransitions";

type Props = {
  moves: MoveCandidate[];
  transitionVariant?: MoveMenuTransitionVariant;
};

export function MoveMenu({ moves, transitionVariant }: Props) {
  const variant = transitionVariant ?? getMoveMenuTransitionVariant();

  return (
    <div className="flex flex-col gap-4">
      <AnimatePresence initial={false} mode="popLayout">
        {moves.map((m) => (
          <MoveTile key={m.id} move={m} variant={variant} />
        ))}
      </AnimatePresence>
    </div>
  );
}

function MoveTile({ move, variant }: { move: MoveCandidate; variant: MoveMenuTransitionVariant }) {
  const v = tileMotionByVariant(variant);

  return (
    <motion.div
      layout
      initial={v.initial}
      animate={v.animate}
      exit={v.exit}
      transition={v.transition}
      className="rounded-xl border border-white/10 bg-white/5 h-[140px] flex items-end justify-between p-4"
    >
      <div className="text-white/90 font-medium">{move.label}</div>
      <div className="text-white/70">{move.score}</div>
    </motion.div>
  );
}
```

### 4) Implement 5 transition options

Create in the same file or `moveMenuTransitions.motion.ts`:

#### Variant A: `fade` (subtle crossfade)

* Best default. Almost invisible but feels polished.

```ts
function tileMotionByVariant(variant: MoveMenuTransitionVariant) {
  switch (variant) {
    case "fade":
      return {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        exit: { opacity: 0 },
        transition: { duration: 0.18 },
      };
```

#### Variant B: `slide` (tiny horizontal nudge + fade)

* Looks modern; still low-noise.

```ts
    case "slide":
      return {
        initial: { opacity: 0, x: -8 },
        animate: { opacity: 1, x: 0 },
        exit: { opacity: 0, x: -8 },
        transition: { duration: 0.20 },
      };
```

#### Variant C: `flip` (FLIP reorder emphasis, minimal enter/exit)

* Use `layout` + very small scale to “snap” reorder elegantly.

```ts
    case "flip":
      return {
        initial: { opacity: 0, scale: 0.985 },
        animate: { opacity: 1, scale: 1 },
        exit: { opacity: 0, scale: 0.985 },
        transition: { type: "spring", stiffness: 520, damping: 38, mass: 0.7 },
      };
```

#### Variant D: `stack` (staggered cascade)

* Tiles animate in/out with small stagger; sleek but a bit more “motion”.
* Implement **stagger on parent** + child variants.

  * Parent:

    ```tsx
    <motion.div
      initial="initial"
      animate="animate"
      exit="exit"
      variants={{
        animate: { transition: { staggerChildren: 0.03 } },
      }}
    >
    ```
  * Tile:

    ```ts
    case "stack":
      return {
        initial: { opacity: 0, y: 6 },
        animate: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: 6 },
        transition: { duration: 0.18 },
      };
    ```

#### Variant E: `morph` (soft blur/defocus crossfade)

* Very “premium”; keep blur subtle to avoid looking like lag.

```ts
    case "morph":
      return {
        initial: { opacity: 0, filter: "blur(2px)" },
        animate: { opacity: 1, filter: "blur(0px)" },
        exit: { opacity: 0, filter: "blur(2px)" },
        transition: { duration: 0.22 },
      };
```

#### Variant F: `none` (baseline)

```ts
    case "none":
    default:
      return {
        initial: false,
        animate: {},
        exit: {},
        transition: { duration: 0 },
      };
  }
}
```

---

## 5) Handle “same moves, updated scores” without re-mounting

If the move list stays the same but scores change, don’t remount tiles (keys remain stable).
Add a **micro-animate** on the score text only:

* briefly brighten / pulse when `score` changes.

Implementation idea:

* `useEffect` per tile detects `score` change and toggles a `flash` state for 150ms.
* Apply Tailwind class: `text-white` → `text-white/90` with transition, or use `motion.span` with opacity.

Keep it subtle.

---

## 6) Add a dev-only toggle UI (optional but recommended)

Create `MoveMenuTransitionToggle.tsx`:

* a small dropdown in a dev HUD (bottom left) that writes:

  * `localStorage.setItem("bm_move_menu_transition", variant)`
  * `window.location.reload()` (or better: state update)

Only render when:

* `import.meta.env.DEV` is true, OR
* `VITE_SHOW_DEV_TOOLS=true`

---

## 7) Branch plan (if you want branch-per-variant)

If you’d rather review each style isolated:

```bash
git checkout -b ui/move-menu-transition-fade
git checkout -b ui/move-menu-transition-slide
git checkout -b ui/move-menu-transition-flip
git checkout -b ui/move-menu-transition-stack
git checkout -b ui/move-menu-transition-morph
```

But preferred: **single branch** with toggle, so you can A/B instantly.

---

## 8) Quick acceptance checklist

* ✅ No layout jump; tiles maintain spacing.
* ✅ Reordering is smooth (no “teleport”).
* ✅ Enter/exit are subtle (≤ 250ms).
* ✅ Works at all breakpoints you’ve wireframed.
* ✅ No animation when nothing changed.
* ✅ Reduced-motion users respected:

  * if `prefers-reduced-motion`, force `variant="none"`.

---

## Notes specific to your current layout

From your screenshot: tiles are large and “ambient” already, so the best defaults are:

* **fade** or **slide** (least invasive),
* **flip** as the “feels premium but still quiet” option.

If you want, I can also write the exact `MoveMenuTransitionToggle` UI (Tailwind + shadcn select) and a tiny “demo harness” component that cycles mock move lists so you can judge transitions fast.
