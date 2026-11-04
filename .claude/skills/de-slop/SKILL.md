---
name: de-slop
description: >
  Check code or a UI for the tell-tale signs of AI-generated "slop" and fix
  them: the codebase slop list (implicit coupling, god files, duplication,
  pass-through wrappers, illegal states, validation in the wrong place) and the
  design slop list (eyebrow tags, styled accent words, dividers, bordered
  boxes, too many shades, decorative diagrams, section numbers). Also covers
  the design process that avoids slop in the first place. USE WHEN: /de-slop,
  "this looks AI-made", "clean this up", "does this code smell", "review for
  slop", before opening a PR on AI-written code, or before shipping a page.
  NOT FOR: hunting correctness bugs (use code-review) or full art direction of
  a landing page (use taste-skill).
---

# De-slop

Two checklists and one process. Run the checklist that matches the input
(code, UI, or both). Report what you found as a short list: the problem, where
it is (`file:line` or the screen and element), and the fix. Then offer to
apply the fixes; don't change anything unless the user says so, unless they
ran this while asking you to build something, in which case fix as you go.

## A. Code slop

Check for each of these. Each line says what it is, how to spot it, and the
usual fix.

1. **Implicit coupling.** Two parts depend on each other through a shared
   assumption nobody wrote down (a magic string, an order of calls, a global).
   Spot: changing one breaks the other with no import between them. Fix: make
   the link explicit (shared constant, type, or a function that owns it).
2. **Layer-first folders.** `controllers/`, `services/`, `models/`, `utils/`
   at the top, so one feature is spread across five folders. Fix: group by
   feature (`billing/`, `auth/`), with layers inside if needed.
3. **Duplication.** The same logic pasted in two or more places. Fix: one
   function, called from both. Leave it if the copies are likely to diverge.
4. **Illegal states are possible.** Data can hold combinations that should
   never happen (`isLoading: true` and `error: "..."` at once). Fix: one
   status field or a tagged union so only valid states can be written.
5. **God files.** One file or class doing many unrelated jobs, often 500+
   lines. Fix: split by responsibility.
6. **Shotgun surgery.** One small change needs edits in many files. Fix:
   bring the thing that changes together into one place.
7. **Layering violations.** Low-level code reaches up (a database helper
   that knows about HTTP requests) or the UI talks straight to the database.
   Fix: keep dependencies pointing one way.
8. **Pass-through wrappers.** A function or class that only calls another
   with the same arguments. Fix: delete it and call the real thing, unless it
   is a deliberate boundary (for example wrapping a third-party library).
9. **Errors and validation in the wrong place.** Input checked deep inside
   the code, or checked again at every layer, or errors swallowed and
   re-thrown with less information. Fix: validate once at the edge where data
   enters (the API handler, the form, the file reader), then trust it inside.

For deeper design vocabulary (deep modules, seams), use the
`mattpocock-skills:codebase-design` skill.

## B. Design slop

`taste-skill` already bans most design tells. This list is the full set to
avoid (from a designer's "design this, but NO..." list), so it also works on
app screens and small components:

1. Eyebrow tags and pill badges above headings.
2. One italic or serif "accent" word inside a heading.
3. Fashion serif headings (e.g. Instrument Serif) with tight negative
   letter-spacing.
4. Over-detailed UI: fake stats, tiny decorations, things that aren't needed.
5. Divider lines between every section or list item.
6. **Many shades and opacities of the same colour.** Pick a small set of
   real colours (a background, a text colour, one muted text colour, one
   accent) instead of `text-gray-400/60`, `bg-white/5` and so on.
7. Every block wrapped in a 1px bordered box or identical card.
8. **Decorative diagrams.** Boxes-and-arrows or "how it works" graphics that
   don't explain anything a sentence couldn't. Use one only when it shows a
   real mechanism.
9. Code-style breadcrumbs or fake monospace labels (`// features`,
   `~/about`).
10. Section numbering (`01 — About`, `02 — Work`).

Fix by removing first. Most slop is something added, so the best fix is
usually deleting it, not restyling it.

## C. The process that avoids slop

From reactiverobot's two "designing with agents" posts. Use this when
building UI:

1. **Constraints first.** Before designing, write down who it's for, what
   they must be able to do, and what it must not do. Constraints make the
   design; options without constraints become slop.
2. **Remove stuff.** After each pass, ask what can be deleted. Agents add;
   your job is to subtract.
3. **Try 3–4 variants** of key screens before picking one (the `variant`
   skill does this).
4. **Build components and a showcase page** (`/showcase`) that renders each
   component in every state, so you can see them all at once.
5. **Screenshot every state**: empty, loading, error, one item, many items,
   long text, mobile. Look at each one, not just the happy path.
6. **Zoom in on the crux.** Spend most of the time on the one or two
   surfaces people use most.
7. **Steal good references.** Collect real sites you like and say what you
   like about each one.
8. **Get outside feedback** with before/after screenshots, then ship and
   expect surprises.

## D. Where AI helps on UI

Point the user to the right installed skill:

| Want to | Use |
|---|---|
| Try to break it (edge cases, bad input, weird sizes) | `break` |
| Map every scenario as a state machine | `state-machine` |
| Before/after review of a change | `interface-review` |
| Explore options | `variant` |
| A quality loop over the whole screen | `better-interface` |
| Clone an animation you like | `reanimate` |
| Understand how an effect works | `explain-interface` |
| Ask lots of questions first | `mattpocock-skills:grilling` |
