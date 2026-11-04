---
name: be-ambitious
description: >
  Make a task or prompt more ambitious using Felix Rieseberg's three lenses:
  Altitude (aim at the outcome behind the task), Depth (work the way a top
  expert would: raw material, real tools, an outside check, a hard target) and
  Range (bring in methods from other fields). Then rewrite the prompt so the
  user can copy it. USE WHEN: /be-ambitious, "be ambitious", "make this prompt
  deeper", "what would an expert do here", "raise the bar on this task",
  "what's the goal behind this", "rewrite my prompt like a pro would ask it".
  NOT FOR: polishing a prompt's tone or length, or just doing the task faster.
---

# Be ambitious

Based on Felix Rieseberg's "How to be more ambitious: a tutorial for humans
with models" (felixrieseberg.com). He names four kinds of ambition: speed,
altitude, depth and range. Speed needs no help, so this skill covers the other
three.

## Input

The task is whatever follows `/be-ambitious`. If nothing follows, use the
user's most recent request in this conversation. If there is none, ask for the
task in one line and stop.

If the input starts with `altitude`, `depth` or `range`, use only that lens.
Otherwise use all three, but skip a lens that adds nothing for this task and say
why in one line (e.g. altitude rarely helps purely creative work).

Name the field first (e.g. "investigative journalism", "SRE incident
response"). Be concrete throughout: name the actual source, tool or person, not
the category. If you don't know a field well enough, say so rather than
inventing a source or tool.

## 1. Altitude: the goal beyond the goal

Ask what the user wants to happen after this task is done, and what would make
the task unnecessary next time. For example, "fix this crash" becomes "keep
the app crash-free"; "make the quarterly deck" becomes "help us decide what to
do next quarter".

- Give one higher-altitude version of the task, with the outcome it serves.
- Say what would have to change for Claude to do it repeatedly without the
  user in the loop: data it can fetch itself, a way to reproduce and verify,
  access to the right machines or accounts.
- Altitude changes the scope. Label it clearly as a bigger version and never
  swap it in silently.
- Keep it concrete. A vague goal ("go make money") is not altitude.

## 2. Depth: work like the best in the field

Same goal, higher standard. Answer these for the field:

1. **What a top professional would do that wasn't asked for.** The two or
   three moves that separate expert work from competent work, such as stating
   the decision the work serves, checking base rates, reproducing before
   fixing, or writing the counter-argument.
2. **The rawest material.** Primary sources instead of summaries: the
   dataset, not the chart; the logs and code, not the bug report; the filing,
   not the article. Say where it lives if you know.
3. **Industry-grade methods and tools.** Named techniques, libraries,
   databases, statistical models or commands an expert would use, not a
   markdown table where a real instrument fits, and why each fits.
4. **An assumption to test.** The belief the task quietly rests on, and how to
   check it against the raw material.
5. **A hard target, stated as reasonable.** A specific goal well beyond "good
   enough" (200ms when 5 seconds would pass), treated as solvable.
6. **New knowledge.** Something the result could find that even an expert
   doesn't know yet, and how to confirm it on data it wasn't built from.
7. **An outside judge.** What, other than the user or the model, shows the
   result is right: a test suite, a benchmark, a reproduction, held-out data,
   a measurement, a real user's behavior, a domain expert. Prefer a check Claude
   can run itself. Say what counts as a pass and what counts as a failure.

## 3. Range: methods from other fields

1. **Nouns into verbs.** Restate what the task's output is *for* as an action.
   A quarterly review is not "a deck" but "getting busy people to believe a
   story about cause and effect, and deciding under uncertainty".
2. **Assemble the crew.** Pick two to four specialists from different fields
   whose methods fit that verb (e.g. an analyst, a journalist and an editor; a
   short seller and a forensic accountant for adversarial review). For each,
   say what they would *do* on this task: their method, not their voice. Never
   ask the model to write like or pretend to be them.

## 4. Access check

List what Claude needs to actually do the ambitious version: data, accounts,
software it can install, connectors, a machine to run things on. Mark what is
already available in this session and what the user would have to provide.

## Rewrite

Write up to two prompts, each in its own fenced block the user can copy, in
the user's voice:

- **Deeper:** the same goal, using Depth and Range. Start from the raw
  material, use the named methods and crew, aim at the hard target, and end
  with the outside judge and its pass criterion.
- **Higher:** only if Altitude found something worth it. The outcome-level
  version, including the workflow changes it needs.

Keep each as long as it needs to be and no longer. Stop after the rewrite.
Offer in one line to run whichever the user picks; don't start the task unless
they say so.
