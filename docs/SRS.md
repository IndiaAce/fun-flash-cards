# Spaced repetition in Compagnon

## The choice: FSRS

Compagnon schedules reviews with **FSRS** (Free Spaced Repetition Scheduler), via the maintained
[`ts-fsrs`](https://github.com/open-spaced-repetition/ts-fsrs) package.

**Why FSRS over SM-2 (the classic Anki algorithm):**

- **It models memory, not just intervals.** Each card carries a *stability* (how long the memory
  lasts) and a *difficulty* (how hard it is for you), and the scheduler targets an explicit
  **retention** probability. SM-2 only nudges an ease factor up or down — it has no notion of how
  likely you are to recall a card *right now*.
- **Better fit for our weak-spot goal.** Because FSRS exposes stability/difficulty/retrievability
  per card, "what am I about to forget" and "what do I keep failing" are first-class signals we can
  rank on — exactly what the brief asks for.
- **Maintained and TS-native.** `ts-fsrs` is small, typed, dependency-light, and the de-facto modern
  standard (it's what Anki itself adopted). We didn't want to hand-roll and own scheduling math.
- **Swappable anyway.** Everything lives behind `src/lib/srs`, so if FSRS ever disappoints, the
  scheduler can be replaced without touching feature code.

Trade-off: FSRS is more of a black box than SM-2's three lines of arithmetic. We accept that for the
quality of scheduling, and keep the surface area small and documented here.

## The scheduling math (as we use it)

We configure FSRS in `src/lib/srs/fsrs.ts`:

```ts
generatorParameters({
  enable_fuzz: true,        // spread intervals so cards don't clump on one day
  request_retention: 0.9,   // aim to recall ~90% of cards when they come due
  maximum_interval: 365,    // cap a single interval at a year
})
```

Each review calls `scheduler.next(state, now, rating)`, which returns the card's next
`SrsState` (updated `due`, `stability`, `difficulty`, `reps`, `lapses`, `state`) plus a log item.
A brand-new card starts from `createEmptyCard()` and is **due immediately** (state `New`).

The four FSRS states a card moves through: `New → Learning → Review`, dropping to `Relearning`
after a lapse, then climbing back. Higher *stability* ⇒ longer next interval; a lapse cuts stability
and bumps difficulty, so failed cards come back fast and then space out again as you re-learn them.

## Grade → rating mapping

The UI keeps the design's three calm pills. They map onto FSRS's ratings:

| UI grade | FSRS rating | Feel |
| --- | --- | --- |
| **Missed it** | `Again` | a lapse — show it again very soon |
| **Got it** | `Good` | on track — normal spacing |
| **Easy** | `Easy` | space it out further |

FSRS also defines a **`Hard`** rating. It exists in our model (`GradeId` includes `"hard"`, and
`intervalPreviews()` computes it) but is intentionally **not surfaced** in the Pass 1 pill UI — three
choices keeps grading low-friction and unalarming, which is the whole point of the design. The
slider/keyboard variants are the natural place to expose `Hard` later.

The pills show the **real next interval** for *this* card, not a hard-coded guess: `intervalPreviews()`
actually runs the scheduler for each grade and formats the gap (`10 min`, `4 days`, …).

A grade counts as a **lapse** only when it's `Missed it`. That single rule drives the `correct`
flag on every `ReviewLogEntry`, which the analytics build on.

## Weak-spot targeting

Two pieces, both pure functions in `src/lib/srs/analytics.ts`:

### 1. The due queue is biased toward weakness

`buildQueue(cards, reviewLog, filter)` selects due cards (or any tag/category/type slice) and orders
them by a **weakness score** before falling back to how overdue they are:

```
weakness = 0.6 · (card's own lapse rate)        // lapses / reps
         + 0.4 · (1 − accuracy of its topic)    // avg accuracy across its category + tags
```

So a card you personally keep missing rises to the top — and so does a card in a topic you're weak
on, even before you've failed that specific card. New/unseen context defaults to a mild 0.3 so
nothing is assumed mastered.

### 2. The dashboard insight

`generateInsight(cards, reviewLog)` looks at the most recent reviews per **tag** and per
**category**, finds the single weakest well-sampled topic (≥ 3 recent reviews, < 70% accuracy), and
phrases it gently — e.g. *"You keep slipping on the subjonctif. You've missed it on 4 of the last 6
cards."* It returns `null` (and the dashboard shows an encouraging default) when there isn't enough
history to say anything honest yet.

## Where it lives

- `src/lib/srs/fsrs.ts` — the `ts-fsrs` wrapper: `applyGrade`, `freshSrsState`, `isDue`,
  `intervalPreviews`, `formatInterval`.
- `src/lib/srs/analytics.ts` — `buildQueue`, `weaknessScore`, accuracy aggregation, `generateInsight`.
- `src/lib/srs/srs.test.ts` — unit tests for the mapping, queue filters, and insight.
