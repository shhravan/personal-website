---
name: first-principles
description: >
  Break a problem, plan or constraint down to what is actually true, separate
  that from what was just inherited or assumed, and rebuild a better answer
  from there. Works for code and architecture, product and PM decisions,
  pricing, strategy and ops. USE WHEN: /first-principles, "first principles",
  "why do we do it this way", "is this constraint real", "challenge my
  assumptions", "this costs too much / takes too long and everyone says it has
  to", "rethink this from scratch". NOT FOR: quick factual questions, or
  making an existing plan bigger (use be-ambitious for that).
---

# First principles

Sources: Farnam Street's "First Principles: The Building Blocks of True
Knowledge" (fs.blog/first-principles) and Paul Nurijanian's application of it
to product work. A first principle is a basic fact that can't be deduced from
anything else. Thinking from first principles means rebuilding a conclusion
from those facts instead of copying what others do (reasoning by analogy).

You don't have to dig to physics every time. Going one or two levels deeper
than everyone else is usually enough.

## Input

The problem is whatever follows `/first-principles`. If nothing follows, use
the user's most recent request. If there is none, ask for it in one line and
stop. Name the domain first (code, product, strategy, ops, personal).

## 1. State the problem and the current answer

Write the problem in one sentence, then the way it is solved today (or the
answer the user is leaning toward) and the reason usually given for it. That
reason is what we're about to test.

## 2. List the constraints and split them

List every constraint, cost and "we have to" around the problem. For each one,
break it into the mechanisms underneath it (what actually causes it), then
sort each mechanism into one of three buckets:

| Bucket | Meaning | Example |
|---|---|---|
| **Fixed** | Physics, math, law, or hard economics. Won't move. | Light takes time to cross the world; data must be stored somewhere. |
| **Inherited** | A habit, convention, old decision or tool default. Could move. | "We release monthly because we always have." |
| **Unknown** | Not sure yet. Needs a check. | "Customers won't pay more" with no data behind it. |

Be honest: most things that feel fixed are inherited. Mark a mechanism Fixed
only when you can say *why* it can't change.

## 3. Question the inherited and unknown ones

Run the Socratic questions on each one that matters:

1. **Clarify:** what exactly do we mean, and why do we think this?
2. **Challenge the assumption:** how do we know it's true? What if the
   opposite were true?
3. **Evidence:** what supports it? What's the source? What data would
   change our mind?
4. **Other views:** what would someone outside this field or company say?
5. **Consequences:** if we're wrong, what happens? If we drop it, what
   breaks?
6. **Question the question:** was this the right thing to ask? What does it
   tell us that we believed it?

For a constraint that keeps coming back, use **Five Whys**: ask "why?" up to
five times until the answer is a fact or "because we decided to". Stop as soon
as you hit either one; don't invent whys.

## 4. Price the components

Where cost, time or effort is the issue, add up what the parts would cost if
you bought or built them directly, and compare that to the current price.
Elon Musk did this for rockets (raw materials were around 2% of the
price) and batteries (materials around $80/kWh when packs cost about
$600/kWh). The gap between "sum of parts" and "what we pay" is where the
inherited costs live.

In software and product, the "parts" are things like compute, engineer-hours,
steps in a user's flow, approvals in a process, or lines in a contract.

## 5. Rebuild

Using only the Fixed facts plus whatever survived step 3, design the answer
again from scratch. Give one or two rebuilt options, each with:

- what it keeps, and what it drops or replaces;
- which inherited constraint it breaks, and the risk of breaking it;
- the cheapest way to test it before committing (a prototype, a query, a
  conversation with one customer, a one-week trial).

Examples to calibrate against:

- **BuzzFeed:** Jonah Peretti didn't copy how magazines picked stories. He
  started from why people share things and built the site around that.
- **CD Baby:** Derek Sivers needed a way to pay small musicians weekly and
  sell their CDs online. He built only what that required, not what a music
  label would have.
- **Code:** "We need a microservice for this" → what has to be separate
  (different scaling, different team, different failure)? Often nothing, so
  a module is enough.
- **PM:** "Users want feature X" → what job are they trying to finish, and
  what's the smallest change that finishes it?

## 6. Check yourself (pitfalls)

Before finishing, check for these:

- **Fake fundamentals:** a "fact" that's really a belief or a habit.
- **Rebuilding everything:** first principles is slow and tiring. Use it on
  the one or two constraints that matter most, and use analogy for the rest.
- **Ignoring why the rule exists:** before removing a fence, find out why it
  was put up. Some inherited rules encode lessons learned the hard way.
- **Overconfidence:** facts change as knowledge grows. Mark which conclusions
  depend on Unknown items.
- **Social cost:** questioning "how things are done" can annoy people. Say
  how to pitch the change to the people who own it.

## Output

Keep it short and in plain English:

1. The problem and the current answer (two lines).
2. The constraints table (Fixed / Inherited / Unknown) with one-line reasons.
3. The two or three biggest assumptions to test, and how.
4. The rebuilt option(s) with the cheapest test for each.
5. One line: what to do first.

Offer to run the first test. Don't start it unless the user says so.
