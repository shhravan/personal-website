---
name: pm
description: >
  Product-management thinking for features, products and roadmaps: frame the
  real problem and the user's job to be done, size the opportunity, write a
  one-page PRD, prioritise, pick success metrics, and run a pre-mortem.
  USE WHEN: /pm, "should we build this", "write a PRD", "prioritise these
  features", "what should the MVP be", "what metric should we track", "is
  this a real problem", planning a new product or slice. NOT FOR: making a
  plan bigger (be-ambitious) or questioning one hard constraint
  (first-principles), though this skill calls on both.
---

# PM

Pick the mode from the request, or run them in order for a new product.
Plain English throughout. Ask the user questions instead of inventing facts
about their users or market.

## 1. Frame the problem

- **Who** has the problem? Be specific (not "users", but "solo founders
  doing their own bookkeeping").
- **Job to be done:** "When ___, I want to ___, so I can ___."
- **Evidence:** what shows it's real? Quotes, support tickets, usage data,
  people paying for workarounds. Mark each claim as *seen* or *assumed*.
- **Today's workaround** and what it costs them (time, money, mistakes).
- If a "we must" constraint shapes the solution, run `/first-principles` on
  it.

## 2. Size and decide

- How many people have it, how often, how painful (rough numbers with the
  maths shown).
- Why now? Why us?
- **Decision:** build, test first, or drop. Testing first is the default
  when the evidence is mostly *assumed*. Name the cheapest test (5 user
  interviews, a landing page, a fake-door button, a concierge version done
  by hand).

## 3. One-page PRD

Use the user's format (`docs/PRD.md`, max about one page):

- Problem and who it's for
- Goal and success metric
- Must-haves (only what's needed to solve the job)
- Non-goals (what we're deliberately not doing)
- Open questions and risks

## 4. Prioritise

Score each candidate with **RICE**: Reach (people per month) × Impact
(0.25–3) × Confidence (%) ÷ Effort (person-weeks). Show the table, then
sanity-check it: does the order make sense? Is anything a must-do regardless
(security, legal, a blocker)? Cut the list into thin, shippable slices for
`todo.md`.

## 5. Metrics

- **One north-star metric** that means users got value (not sign-ups).
- 2–3 **leading indicators** you can see within days.
- **Guardrail** metrics that must not get worse (speed, errors, churn).
- How you'll measure each, and what result would mean "it didn't work".

## 6. Pre-mortem

"It's six months later and this failed. Why?" List the top 5 reasons, the
early warning sign for each, and what we'd do now to prevent it. Optionally
hand the plan to `/grilling` to stress-test it, or `/be-ambitious` to raise
the bar.

## Output

Only the sections the request needs, short, ending with the single next
step (usually the cheapest test or the first slice).
