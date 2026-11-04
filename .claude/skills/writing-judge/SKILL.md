---
name: writing-judge
description: >
  Draft, judge and revise a piece of writing in the user's own voice using a
  writer/judge loop: draft from source notes, score it against the user's
  real writing, fix the top 3 problems, repeat at most 3 times, and predict
  the user's edits. Learns from the user's final edits. Based on Nat
  Eliason's AI writing pipeline. Run with /writing-judge.
---

# Writing judge

A smaller version of Nat Eliason's system, whose edit rate fell to 3%. The
writer drafts, a separate judge scores, and the user's real edits are the
quality score.

## Setup (first run in a project)

Create a `writing/` folder with:

- `corpus/`: the user's real published writing, cleaned of footers,
  subscribe lines and plugs (otherwise the writer copies them). Ask for 10+
  pieces.
- `holdout/`: 2–3 more real pieces the writer never sees, for testing.
- `inputs/`: notes, transcripts or voice memos for each new piece.
- `drafts/`: each draft, the judge's report and the user's final version.
- `VOICE.md`: the voice guide (below).

Only use the user's current voice. Older pieces can be labelled
"structure only".

## Build the voice guide from data

Read the corpus (not the holdout) and write `VOICE.md`:

- The user's core moves (how they open, what they use as evidence,
  paragraph rhythm, connectors, humour, how they end), each with a real
  example.
- Measured stats: median paragraph and sentence length, bold per 1,000
  words, contraction rate.
- A **ban list of only words the user never uses**. Check each candidate "AI
  word" against the corpus first; some of them the user actually uses.
- A short format guide per content type (post, how-to, essay).

## The loop

1. **Draft** from `inputs/` using `VOICE.md`, the format guide and 2–3 full
   example pieces. Use the Idiolect `write` tool if it's connected. Hard
   rule: every fact comes from the source; never borrow stories from the
   examples. Where the source doesn't say what the user thinks, leave
   `[YOUR TAKE]` instead of guessing.
2. **Judge** (a separate pass, ideally a subagent so it isn't marking its
   own work):
   - mechanical checks: stats vs targets, banned words, em dashes, phrases
     copied from the examples;
   - a fidelity check of every factual claim against the source;
   - voice scored 1–5 on each core move, with quoted evidence;
   - the worst lines;
   - a sealed list of edits the user will probably make (saved, not shown);
   - an overall score out of 10.
3. **Revise** using only the **top 3 fixes**. Long lists make the writer fix
   only the easy ones.
4. Stop after **at most 3 rounds**. More rounds sand the voice flat.

## Learn from the user's edits

The user edits the draft directly (no notes needed) and saves it as
`final.md`. Then:

- Measure the edit rate: the % of words changed.
- Compare against the sealed predictions: what % of edits were predicted.
- Sort every edit into voice, structure, fidelity (made-up facts) or banned
  phrase.
- Update `VOICE.md`. A pattern seen in only one or two edits is a
  *hypothesis*; mention it, but only enforce it once it holds across several
  pieces.

Report the edit rate trend so the user can see when the system is good
enough to trust.
