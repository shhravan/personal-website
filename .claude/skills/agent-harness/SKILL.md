---
name: agent-harness
description: >
  Design or evaluate an AI agent setup (the "harness": the loop, tools,
  context management and planning around a model), or judge whether a new
  agent platform is worth adopting. Based on the 2026 empirical study of
  harness design for coding agents and Spotify's agent routing lessons. USE
  WHEN: /agent-harness, "build my own agent", "design an agent loop", "should
  I use [agent platform]", "my agent runs out of context", "how should my
  agent manage memory / tools", choosing between Claude Code and another
  agent tool. NOT FOR: cleaning up a single prompt (use /claude-api prompt-audit).
---

# Agent harness

Sources: Fan et al., "An Empirical Study of Harness Design for Coding Agents"
(arXiv 2609.20804, Sep 2026; 176 settings on SWE-Bench Verified and
Terminal-Bench, open models from 30B to 550B parameters, not Claude), and
Spotify's write-up on routing work in their internal Portal agent.

## Findings to design from

1. **Context management matters most when the context window is small.**
   +35.7 points at 32k tokens, only +2.7 at 128k. Best value: drop old tool
   outputs first, summarise only when that's not enough. Tools to "recall"
   old context were mostly unused (56% of runs never called one).
2. **Planning helps weak models score higher** (+11.6 for the 30B model) and
   makes strong models cheaper (about 30% lower cost), not much more
   accurate.
3. **Fewer, more general tools can win for strong models.** Bash only gave
   the 550B model +3.6 points at 53% lower cost than a large custom toolset.
4. **Make important routing a rule the system enforces** (Spotify): if a
   kind of request must go to a particular tool or agent, enforce it with a
   hook or code path, not a sentence in the prompt.

## When designing a harness

Decide and write down, one line of reasoning each:

- Model and context size, and therefore how much context management it
  needs (finding 1).
- Tool set: start with a shell plus file read/edit; add a custom tool only
  when you can show the shell version fails or costs too much (finding 3).
- Planning step: yes for small models; for strong ones, only if cost
  matters (finding 2).
- Guardrails as hooks or code: secrets, destructive commands, required
  routing (finding 4).
- An evaluation: 20–50 real tasks with a pass/fail check, split into tasks
  you tune on and tasks you only test on.

## When judging an agent platform

Before adopting one (e.g. a self-hosted harness like mainplane):

- What does it do that Claude Code (plus skills, hooks, subagents) can't?
- How is it installed? Avoid `curl | sh` from unknown sources; read the
  script first.
- Who holds your code, keys and data? What does it send where?
- License and who maintains it; is it active?
- Can you leave easily?

Recommend "stay with Claude Code" unless there's a concrete gap.
