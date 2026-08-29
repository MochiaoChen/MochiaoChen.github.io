---
title: "How Do We Actually Know a Model Is Getting Better?"
description: "A short survey of LLM evaluation: from MMLU to agent benchmarks, and how eval stopped being a post-training QA step and became the thing that shapes the model."
date: 2026-08-29 10:00:00 +0800
date_label: "2026.08.29"
categories: [Artificial Intelligence]
tags: [evaluation, benchmarks, RLHF, reward models, agents, test-time compute]
lang: en
permalink: /en/writing/2026/08/how-we-know-a-model-is-better/
translation_url: /writing/2026/08/how-we-know-a-model-is-better/
math: true
toc: true
---

Compress the last few years of frontier model competition into a sequence of questions and you get something like this. First everyone asked *How big is the model?* Then it became *How much compute did you use?* Then *What is your MMLU score?* And now that models are genuinely entering coding, research, finance, customer support—and driving computers and browsers directly—a more awkward question has surfaced:

> **How do we actually know whether the model is getting better?**

This is evaluation, or, as most people say, eval.

On the surface eval is easy to describe: give the model a set of questions and compute a score. But anyone who has actually worked on model development discovers quickly that evaluation may be the most underrated part of the whole LLM pipeline, and also the part closest to the centre of it. It is not merely a QA system you run after training to sign the model off. <mark>How you define “good” ends up determining what data the team collects, how post-training is done, what the reward model learns, what RL optimises, and even what the system should search over at inference time.</mark>

Put differently:

> **The model you get is downstream of the eval you build.**

In that sense the real starting point of model development is not training. It is measurement.

## 01｜Eval is not a benchmark: first work out what you are measuring

Most people first meet evaluation as a jumble of words—benchmark, test set, leaderboard, eval. In fact a benchmark is only one component. A complete evaluation system can be written, at minimum, as a six-tuple:

$$
\text{Eval} \;=\; \big\langle\, C,\; T,\; G,\; J,\; M,\; P \,\big\rangle
$$

Here $$C$$ is the construct you want to measure (the capability itself), $$T$$ is the task distribution meant to represent it, $$G$$ is the ground truth or rubric, $$J$$ is the judge, $$M$$ is the metric that turns judgements into numbers, and $$P$$ is the protocol under which the model is tested—prompt template, number of few-shot examples, temperature, tool access, context length.

In other words, you owe six answers: which capability? which tasks stand in for it? what counts as a good response? who decides? how does a decision become a number? and under what conditions is the model tested?

Take MMLU, the canonical case. It puts the model into a highly standardised examination setting: 57 tasks spanning elementary mathematics, US history, computer science, law and more, scored by multiple-choice accuracy across broad knowledge and problem solving. When it was proposed in 2020, models were still far from expert-level performance on these tasks, which is exactly what made it good at separating them.

And here the single most important concept in evaluation appears: **construct validity**.

What does a high MMLU score actually tell you? At minimum, that the model does well on this particular set of multi-subject multiple-choice questions. Does it mean the model is “smarter”? That it makes a better research assistant? That it codes better? That it plans better in the real world? None of that follows.

Which gives the first principle of all evaluation:

> **Never confuse the metric with the construct.**

A metric is a proxy designed to measure some abstract capability. It is not the capability. Written out: what we care about is $$C$$, but all we can observe is $$M$$, and there is always a layer in between:

$$
M \;=\; f(C) + \varepsilon
$$

where $$\varepsilon$$ absorbs task-sampling bias, grader noise, sensitivity to prompt formatting, and data contamination. Most of the work in eval engineering is really about shrinking $$\varepsilon$$—and being honest that it never reaches zero.

People say they want to measure reasoning. But reasoning decomposes into at least deductive reasoning, mathematical reasoning, causal reasoning, multi-hop reasoning, planning, counterfactual reasoning, long-horizon reasoning. If you have not defined which one you mean, then no amount of dataset size, grader sophistication, or statistical elegance downstream will save you.

A mature eval therefore never begins with “which benchmark should we run.” It begins with a sentence:

> **What capability or behaviour are we trying to measure?**

## 02｜From MMLU to HumanEval: why a “correct answer” is not enough

MMLU represents a classical family of benchmarks: static questions, determinate answers, and a very simple scoring function—exact match or accuracy.

This kind of eval has an enormous engineering advantage: it is clean. Hold the protocol fixed, and comparing model A at 80% with model B at 85% is relatively easy.

But once a model moves from answering questions to producing something that can be executed, string matching starts to fail.

In 2021 OpenAI introduced HumanEval in the Codex paper. The key change was not that the questions became programming problems; it was that the scoring philosophy changed. The model generates a Python function from a docstring, and what is evaluated is **functional correctness**—whether the code actually works, not whether the text resembles some reference answer. In the original paper Codex solved 28.8% of HumanEval problems, and, in a result that turned out to matter a great deal, allowing 100 samples per problem raised the share for which at least one working solution was found to 70.2%.

That single result anticipated two lines of work that have only grown more important.

**First: for executable tasks, the environment is the best evaluator you have.**

If you ask “is this code any good,” another LLM can certainly give an opinion. But if the real question is “does this code satisfy the requirement,” the most trustworthy method is usually still: *run the tests.*

This is deterministic eval—exact match, unit tests, compiler and runtime, SQL execution, schema validation, numerical tolerance, state checking.

<mark>Where a task has objective, executable ground truth, a deterministic evaluator is usually more reliable than an LLM judge.</mark>

**Second, and more interesting: HumanEval showed that model capability is not a single deterministic output but a probability distribution.**

For a given problem $$x$$, what we actually face is

$$
y \;\sim\; p_\theta(\,\cdot \mid x\,)
$$

so the probability of being right on the first attempt is

$$
\text{pass@}1 \;=\; \mathbb{E}_{x}\Big[\ \mathbb{E}_{y \sim p_\theta(\cdot\mid x)}\big[\ \mathbf{1}\{\text{correct}(y)\}\ \big]\Big]
$$

and “can the model find a correct answer given $$k$$ attempts” is a different quantity entirely. Sampling $$n$$ candidates per problem of which $$c$$ are correct, the Codex paper's unbiased estimator is

$$
\text{pass@}k \;=\; \mathbb{E}_{x}\left[\, 1 - \frac{\dbinom{n-c}{k}}{\dbinom{n}{k}} \,\right]
$$

This line runs all the way to Best-of-N, self-consistency, search, verifiers, and test-time compute.

So from HumanEval onwards we stopped only asking:

> **Can the model answer this question?**

and started asking:

> **Can the system search its output space until it finds a correct answer?**

## 03｜From HumanEval to SWE-bench: writing code is not doing software engineering

HumanEval settled something important: do not compare code to a reference for resemblance, test it for functional correctness. But it retains an obvious limitation—it mostly tests relatively self-contained function generation.

Real software engineering does not look like that. What a programmer actually receives is closer to: “there's a GitHub issue on this repository, a user says pagination breaks under some condition, go fix it.”

The model must understand the issue, read a repository that may run to tens of thousands of lines, locate the relevant files, understand the existing architecture, modify one or more files, run the tests, and avoid introducing a regression.

That is what SWE-bench set out to measure. The original benchmark collected 2,294 real GitHub issues and their corresponding pull requests from 12 real Python repositories. The model is handed the codebase and the issue description, and the task is not to write a function but to modify the repository so the issue is genuinely resolved—often requiring coordinated edits across functions, classes, and files. When the paper first appeared, even the best systems solved only a small fraction.

This is a large migration in benchmark design philosophy:

> HumanEval measures **code generation**. SWE-bench measures **software engineering task completion**.

SWE-bench Verified went a step further and added human validation: 500 instances screened by people to ensure the issue description is clear, the test patch is reasonable, and the task is genuinely solvable from the information given.

Which surfaces a problem in eval engineering that is routinely ignored: **benchmarks have bugs too**.

If a task is impossible, or the reference answer is wrong, or the grader is miswritten, then what you measure is not model capability but dataset noise. High-quality eval is therefore not a matter of collecting more questions; it requires continuous dataset validation, error analysis, human audit, and versioning.

This is also why, inside a real business, a golden set is usually worth more than any public benchmark you might pick up. I would define a golden set as:

> a set of tasks, not necessarily large, that has been rigorously screened, represents the real workload, and comes with trustworthy grading criteria.

If you are building a financial research agent, your golden set should not be a pile of “what is EBITDA” knowledge questions. It should come from what analysts actually do: extract guidance from an earnings release, rebuild segment revenue, identify GAAP versus non-GAAP differences, analyse debt maturity from a 10-K, infer margin drivers from management commentary, check the data references inside a valuation model.

A public benchmark answers *How good is my model compared with everyone else?* A golden set answers *How good is my system at doing my job?*

These are not the same question.

## 04｜The deepest problem with benchmarks: eventually you learn the exam

The moment a benchmark is published, an unavoidable race begins. Researchers study it, model developers run it, training data may contain it, post-training data may be constructed around it, prompt engineering is tuned against it. Eventually the benchmark saturates, or becomes contaminated.

Underneath this is Goodhart's Law:

> **When a measure becomes a target, it ceases to be a good measure.**

Return to the earlier expression. We optimise the observable $$M$$ in the hope of raising the unobservable $$C$$. But once optimisation pressure is high enough, a model can simply work on $$\varepsilon$$ instead—the score rises and the capability does not move.

If every team optimises MMLU, it becomes very hard to tell whether models are acquiring more general intelligence or merely getting better at MMLU-shaped tasks.

Contamination is worse. Once public questions have lived on the internet for long enough, they may appear in a pretraining or post-training corpus. Work such as MMLU-CF has appeared specifically to reduce benchmark leakage through closed test sets and decontamination rules, precisely because public multiple-choice benchmarks are so exposed to it.

A serious evaluation system today therefore does not bet on a single static benchmark. It uses public benchmarks, private benchmarks, held-out golden sets, dynamic task generation, and production failure cases together.

<mark>A benchmark should not be a diploma. It should be a thermometer that needs recalibrating.</mark>

## 05｜What about open-ended answers? From “is it right” to “which is better”

Once LLMs entered chat, writing, and analysis, a more fundamental problem appeared.

Suppose the user says: “write me an email declining an offer, but don't make it cold.” Model A is very polite but long-winded. Model B is concise but slightly blunt. Which is *correct*?

There is no exact match here. So evaluation moves from answer correctness to **preference judgement**.

Chatbot Arena is the clearest example of the shift. It prescribes no golden answer; it places the outputs of two anonymous models side by side and asks real users for a pairwise comparison: A better, B better, tie. The original paper builds a model-comparison system out of crowdsourced pairwise human preferences and reports reasonable agreement between crowd votes and expert raters.

The design is clever because people are not good at answering “is this response a 7.8 or an 8.2,” but are very good at answering “which of these two is better.”

The bridge back from pairwise comparisons to an orderable score is the Bradley–Terry model: give each model a latent strength $$s_i$$, and

$$
\Pr\big[\,i \succ j\,\big] \;=\; \frac{e^{s_i}}{e^{s_i} + e^{s_j}} \;=\; \sigma\big(s_i - s_j\big)
$$

An Elo-style leaderboard is, in essence, solving for these $$s_i$$ from a large number of pairwise comparisons.

This is also why pairwise preference shows up in evaluation and in post-training at the same time—and it is the entry point to understanding RLHF.

## 06｜RLHF: the first time evaluation becomes a training signal directly

Supervised learning says: give the model an input, give it an ideal output, and have it imitate. But for an open-ended assistant many tasks have no unique ideal response. Often all we know is: **A is better than B**.

RLHF—reinforcement learning from human feedback—is the machinery that turns that preference into something optimisable.

InstructGPT is the canonical example. The pipeline is roughly three steps: collect high-quality human demonstrations for supervised fine-tuning; generate multiple candidate responses for the same prompt and have human labellers rank them; train a reward model on that preference data, and then use reinforcement learning to have the language model maximise that reward.

Note that the second step uses exactly the Bradley–Terry form from the previous section. The training objective for the reward model $$r_\phi$$ is

$$
\mathcal{L}(\phi) \;=\; -\,\mathbb{E}_{(x,\,y_w,\,y_l)\,\sim\,\mathcal{D}}\Big[\ \log \sigma\big(\, r_\phi(x, y_w) - r_\phi(x, y_l) \,\big)\ \Big]
$$

where $$y_w$$ is the preferred response and $$y_l$$ the rejected one. The policy objective then becomes

$$
\max_{\pi_\theta}\;\; \mathbb{E}_{x \sim \mathcal{D},\; y \sim \pi_\theta(\cdot \mid x)}\big[\, r_\phi(x, y) \,\big] \;-\; \beta \, \mathbb{D}_{\mathrm{KL}}\Big[\, \pi_\theta(y \mid x) \,\big\|\, \pi_{\text{ref}}(y \mid x) \,\Big]
$$

That KL penalty deserves a second look. Its very presence is a confession about evaluation: **we do not fully trust this evaluator**. The smaller $$\beta$$ is, the further the policy dares to push the reward model out of distribution—and past a certain point what you get is not better responses but the reward model's blind spots.

Something important has happened here:

> **The evaluator no longer merely measures the model. It has begun to shape it.**

A reward model is, at bottom, a learned evaluator. Which raises the obvious question:

> **Who evaluates the evaluator?**

If the reward model has a bias, the policy will learn to exploit it. If the reward model prefers long answers, the model becomes more verbose. If it mistakes a confident tone for correctness, the model learns to be wrong more confidently.

So reward models need eval of their own. This is why benchmarks such as RewardBench appeared: the reward model has become critical infrastructure in the alignment pipeline, and its ability to separate chosen from rejected responses has to be measured separately.

Evaluation has become recursive. We evaluate models; then we train a model to evaluate models; then we design a benchmark to evaluate the model that evaluates models.

## 07｜RLAIF: if human feedback is expensive, can AI supervise itself?

RLHF has a practical problem: human feedback is expensive, and as models improve, humans get worse at supervising them. If a model is proving a difficult theorem, analysing hundreds of thousands of lines of code, or checking a professional financial model, an ordinary annotator simply cannot tell whether the answer is good.

Hence the natural question: **can AI supervise AI?**

Anthropic's Constitutional AI is a landmark on this path. In its RL stage, the model generates candidate responses and another model judges which is better against a set of pre-defined constitutional principles; those AI preferences train a preference model that becomes the reward signal for reinforcement learning. This is RLAIF—reinforcement learning from AI feedback.

The significance for evaluation goes well beyond saving labour. Once the evaluator itself can be scaled by a model, you can produce orders of magnitude more feedback. But a new risk arrives with it: if the teacher model and the student model share the same blind spot, the entire feedback loop can become a self-reinforcing error.

<mark>Human feedback carries human bias; AI feedback carries model bias. There is no free lunch in evaluation.</mark>

## 08｜LLM-as-a-judge: why judge models are so useful, and so dangerous

Even without RL, teams increasingly reach for LLM-as-a-judge in everyday product work. A standard judge prompt contains a user question, reference context, a candidate response, and an evaluation rubric, and asks a strong model to output scores for correctness, relevance, completeness, style.

It is extremely scalable, and it suits tasks that cannot be graded deterministically. But an LLM judge is not an oracle.

The MT-Bench / LLM-as-a-judge work found that strong models as judges can reach high agreement with human preference, while also exhibiting systematic position bias, verbosity bias, and self-enhancement bias.

Position bias is simple: put A on the left and put A on the right, and the judge may decide differently. Testing for it takes a single number—the fraction of pairs on which the judge reaches the same conclusion after the order is swapped:

$$
\text{consistency} \;=\; \Pr\Big[\, J(x,\,y_a,\,y_b) \;=\; \overline{J(x,\,y_b,\,y_a)} \,\Big]
$$

If that number is meaningfully below 1, some of the gap on your leaderboard is just position. Verbosity bias means a long answer of ordinary information density can beat a short, accurate one because it *looks* more complete.

So using an LLM judge properly is not “ask the strongest model for a score.” At minimum you have to consider: whether the rubric is specific enough; absolute scoring or pairwise; whether A/B positions need swapping; whether the judge can see a reference; whether the judge must cite evidence; whether it has a domain blind spot; and what its agreement with human experts actually is.

The right posture is not to treat the judge as ground truth but:

> **Treat the judge as another noisy measurement instrument.**

Calibrate first, then scale.

## 09｜Outcome reward vs process reward: is the final answer enough?

Push evaluation deeper into reasoning and another problem appears.

Suppose the answer to a maths problem is 42. The model writes ten steps of reasoning; step 4 is actually wrong; step 7 happens to cancel the error; the final result comes out at exactly 42. To an outcome-based evaluator: *perfect*. To the kind of reasoning we actually want: clearly not.

This is the distinction between an **outcome reward model (ORM)** and a **process reward model (PRM)**. Written out, the ORM looks only at the endpoint:

$$
r_{\text{outcome}}\big(x,\, y_{1:T}\big) \;=\; \mathbf{1}\big\{\, \text{answer}(y_{1:T}) = y^{\star} \,\big\}
$$

A PRM assigns a step-level score $$s_\phi(x, y_{1:t})$$ to each step and aggregates, for instance as

$$
r_{\text{process}}\big(x,\, y_{1:T}\big) \;=\; \min_{1 \le t \le T} s_\phi\big(x,\, y_{1:t}\big)
\qquad\text{or}\qquad
\prod_{t=1}^{T} s_\phi\big(x,\, y_{1:t}\big)
$$

The choice of a minimum or a product rather than a mean is deliberate: a chain of reasoning should be only as trustworthy as its weakest step, not have that step averaged away by nine sound ones.

OpenAI's *Let's Verify Step by Step* studied this systematically. In its MATH experiments, process supervision substantially outperformed supervision based on the final result alone, and the work released PRM800K, roughly 800,000 step-level human feedback labels.

Why does this matter? Because the hard part of complex reasoning is not whether an answer eventually appears, but that errors accumulate along the trajectory.

Process supervision has its own difficulty, though: a problem may admit many different but equally valid reasoning paths. If your process rubric is too rigid, the model may sacrifice the exploration of alternative strategies in order to please the grader.

Hence a principle that matters more and more in the agent era:

> **Outcome first, process for diagnosis.**

Whether the job actually got done should be the headline metric; trajectory evaluation is mostly for locating failures, not for forcing an agent down one canonical path.

## 10｜Best-of-N: the evaluator can raise capability at inference time

Reward models have a third use that is easy to overlook: it does not require updating any weights.

Suppose the model produces $$N$$ answers to a question in one go, and a reward model or verifier picks the best:

$$
y^{(1)}, \dots, y^{(N)} \;\overset{\text{i.i.d.}}{\sim}\; \pi_\theta(\,\cdot \mid x\,),
\qquad
\hat{y} \;=\; \arg\max_{1 \le i \le N}\; r_\phi\big(x,\, y^{(i)}\big)
$$

This is Best-of-N in its simplest form.

The evaluator's role has changed again. It is neither a benchmark nor an RL training signal; it has become part of an inference-time search algorithm.

HumanEval's repeated sampling result already hinted at the potential. Later Best-of-N methods made it explicit by using a reward model to select among many samples.

There is a precondition worth stating plainly. Let $$q(y)$$ be the quality we actually care about and $$r_\phi$$ a proxy for it. Whether $$\mathbb{E}\big[q(\hat{y})\big]$$ rises with $$N$$ depends entirely on whether $$r_\phi$$ and $$q$$ still agree **in the tail**. The more aggressive the search, the easier it is to select samples where $$r_\phi$$ is high and $$q$$ is not—reward hacking, in its inference-time form. Best-of-N and the KL penalty in RLHF are two treatments of the same disease.

Which reveals the rule underneath what is now called test-time scaling:

> **The generator determines which candidates can exist. The evaluator determines whether you can find the good one among them.**

The stronger the model, the more the generator matters—but as sample counts and search depth rise, verifier and reward model quality move steadily closer to being the bottleneck of the whole system. This is why the boundary between evaluation and reasoning is disappearing.

## 11｜With agents, the benchmark stops being an exam and becomes an environment

When an LLM is just a chatbot, the structure of evaluation is simple: take an input $$x$$, get an output $$y$$, and score it

$$
\text{score} \;=\; g\big(y,\; y^{\star}\big)
$$

An agent is nothing like this. Its trajectory looks more like

$$
\tau \;=\; \big(\, s_0,\; a_1,\; o_1,\; s_1,\; a_2,\; o_2,\; \dots,\; a_T,\; o_T,\; s_T \,\big)
$$

where $$a_t$$ is an action (a tool call, a click, a file write), $$o_t$$ an observation, and $$s_t$$ the environment state. Scoring becomes a judgement about the **final state**:

$$
\text{success}(\tau) \;=\; \mathbf{1}\big\{\, \Phi(s_T) \,\big\}
$$

You are no longer checking what the model wrote. You are checking what the world looks like afterwards. How well the closing message is phrased may not even be the point.

A travel agent's goal is “find me a flight that meets these conditions.” It may need to browse pages, read dates, filter prices, compare itineraries, handle page errors. What you want to evaluate is: *did the agent complete the task?*

This is the setting in which agent benchmarks appeared. AgentBench places models into 8 distinct interactive environments to evaluate reasoning and decision-making rather than static QA. GAIA goes further and defines the target as a general AI assistant: its 466 questions require reasoning, multimodal understanding, web browsing, and tool use, and are deliberately designed to be tasks humans do not find especially hard but AI systems fail easily. In the original paper human respondents reached 92% while GPT-4 with plugins reached 15%—evidence that “strong on exams” and “robust as an assistant” are entirely different dimensions.

WebArena goes further still, constructing interactive, realistic websites—e-commerce, forum, software development, content management—and checking whether the agent truly completed a web task. In the original paper the best GPT-4-based agent achieved an end-to-end success rate of 14.41% against human performance of 78.24%.

Note the paradigm shift:

> A traditional benchmark hands the model an exam paper. An agent benchmark hands it a world.

And the evaluator no longer checks a text answer alone. It has to check environment state, tool invocation, task completion, side effects, constraint violations, trajectory, cost, and latency.

Which suggests that the most important evaluation infrastructure of the next few years is not a question bank but a **reproducible environment**.

## 12｜The genuinely hard part of agent eval: failure attribution

Suppose a financial agent gets a company's 2026E EBITDA wrong. “Answer incorrect” is worth very little. What is worth something is knowing **why**.

Perhaps it retrieved the earnings report for the wrong year—a retrieval failure. Perhaps it found the right document but treated adjusted EBITDA as GAAP operating income—an extraction or semantic failure. Perhaps every figure was right and the formula was wrong—a calculation failure. Perhaps the analysis was correct but the citation pointed at a different filing—a citation failure. Perhaps an external tool timed out and the agent never retried—a recovery failure.

So one of the most valuable artefacts in a mature agent eval is not the total score but a **failure taxonomy**:

| Failure type | Share |
| --- | --- |
| Retrieval | 27% |
| Tool use | 19% |
| Reasoning | 18% |
| Data extraction | 14% |
| Calculation | 9% |
| Citation | 8% |
| Other | 5% |

This table is usually worth far more than “overall score = 73.4,” because it answers directly what the team should fix next.

If 40% of failures come from retrieval, more reasoning RL is unlikely to help. If the agent usually finds the right material but the arithmetic is unstable, what you need may be a deterministic calculator rather than a bigger model.

<mark>The real job of eval is not to tell you how bad the model is. It is to tell you why the system is bad.</mark>

## 13｜Why a single overall score is almost never enough

Suppose a new checkpoint moves the overall score from 82.1 to 84.0. That sounds good. Now break it apart:

| Slice | Old | New |
| --- | --- | --- |
| Math | 81 | 89 |
| Coding | 80 | 87 |
| Writing | 84 | 85 |
| Finance | 86 | **77** |
| Safety | 88 | **82** |

If you are building a financial copilot, this is not an upgrade. It is an incident.

Serious evaluation therefore requires **slice analysis**, along dimensions such as task type, domain, difficulty, language, context length, tool type, risk level, user segment, and failure class.

It also requires attention to statistical uncertainty. One model scoring 83% on 100 questions and another scoring 84% does not establish that the second is better, because eval is itself a sampling process. The standard error of a binomial proportion is

$$
\mathrm{SE} \;=\; \sqrt{\frac{\hat{p}\,(1 - \hat{p})}{n}}, \qquad
\text{95\% CI} \;=\; \hat{p} \;\pm\; 1.96\,\mathrm{SE}
$$

With $$\hat p = 0.83$$ and $$n = 100$$, $$\mathrm{SE} \approx 3.8\%$$ and the interval is roughly $$\pm 7.4$$ percentage points. The difference between 83% and 84% is almost entirely inside the noise.

A better approach is paired comparison: evaluate both models on the same items and count only those where one is right and the other wrong (McNemar's test). This removes the variance contributed by item difficulty and yields far more resolution from the same sample size.

Which is why a tidy scalar on a leaderboard is, in real model development, only the entry point. What matters is:

> **Where did we improve, where did we regress, and why?**

## 14｜Offline eval, online eval, and the real world's final vote

Even the best golden set has an intrinsic problem: it is a proxy for the real world. Whether a product succeeds is not decided by MMLU, SWE-bench, or an internal judge score. It is decided by real users.

So eval splits into two worlds.

**Offline eval** serves development. It is cheap, fast, repeatable, supports regression testing, and catches obvious problems before release.

**Online eval** looks at real production outcomes: task completion, user preference, regeneration rate, escalation rate, retention, conversion, latency, token cost, cost per successful task.

That last metric deserves to be written out, because it often reflects a system's true economics better than accuracy does:

$$
\text{cost per successful task} \;=\; \frac{\mathbb{E}\big[\text{cost per attempt}\big]}{\Pr\big[\text{success}\big]}
$$

A change that lifts success from 60% to 75% can be cheaper overall even if each call costs more.

But there is a trap here too: **user preference is not truth**. A model that is confident, well-spoken, and agrees with the user can score very well on immediate preference while being poorly calibrated and factually weak. The real product objective is usually multi-objective, and stating it with constraints is more honest:

$$
\max_{\text{system}} \;\; \mathbb{E}\big[\text{task success}\big]
\quad \text{s.t.} \quad
\text{factuality} \ge \tau_f,\;\;
\text{harm rate} \le \tau_s,\;\;
\mathbb{E}[\text{cost}] \le c,\;\;
p_{95}(\text{latency}) \le \ell
$$

Putting safety and factuality into the constraints rather than into a weighted sum is the point: they should not be purchasable with gains in success rate.

Which is why there is no such thing as a *universal LLM score*. <mark>Capability is not a scalar; it is a vector.</mark> “Which model is best” is an incomplete question. The real one is always:

> **Best for what?**

## 15｜So how should you actually build an eval system?

Starting an LLM or agent product from scratch today, I would not begin by asking which benchmarks the industry uses. I would work through the following.

1. **Collect real tasks**, rather than having a PM invent prompts in a meeting room. You need to know the actual workload distribution.
2. **Build a taxonomy**: task type × difficulty × domain × risk × tool.
3. **Extract a high-quality golden set.** It need not be large, but it must be representative, and it must include edge cases and historical production failures.
4. **Write a rubric for each task type.** What counts as fully correct, as partial success, as critical failure; whether abstention is allowed; whether citations are required.
5. **Never reach for an LLM judge where deterministic grading is possible.** Run the tests for code, compute the number directly, check the final environment state for tool tasks.
6. **For tasks that cannot be executed**—writing, analysis, open-ended QA—introduce a criteria-based LLM judge, and calibrate it against expert human labels.
7. **Report more than an overall score.** Maintain slices and a failure taxonomy.
8. **Run the regression suite on every change**—model, prompt, retrieval, tool, system prompt. All of it counts.
9. **Feed new production failures back into the eval set continuously.**

The development process then becomes a closed loop:

> real workload → golden set → rubric → grader → slice and failure analysis → locate the bottleneck → change model / prompt / retrieval / tool → regression → ship → production failures → back into the golden set

This is **eval-driven development**.

It resembles test-driven development in ordinary software engineering, but it is considerably harder, because conventional software testing targets a deterministic system while an LLM is stochastic, open-ended, and increasingly interacts with an environment of its own accord.

## 16｜Why eval ends up being the core infrastructure of AI development

We can now read the history again.

In the MMLU era, evaluation mostly meant **setting the model an exam**. HumanEval taught us **not to look at text but to execute what the model produced**. SWE-bench taught us **not to test isolated tasks but real workflows**. Chatbot Arena taught us that **some qualities have no unique answer and can only be learned from human preference**.

RLHF trained human preference into a reward model, and **evaluation became a training objective**. RLAIF let AI produce the preferences, and **the evaluator began to scale too**. Process reward showed that for complex reasoning we may need to supervise the path and not only the outcome. Best-of-N moved the evaluator to inference time: the model generates many possibilities and the verifier decides which survives. And agent benchmarks pushed the whole question up to the level of the environment—we no longer evaluate what the model said, but what the system actually accomplished.

To read evaluation today as “running a few benchmarks after training” is to underrate it entirely. In a growing number of modern AI systems the evaluator plays at least four roles at once: <mark>it measures the model and it shapes the model; it defines the reward and it guides inference-time search.</mark> It tells you which model is stronger, and it tells you why your system failed.

And as foundation models themselves become easier to obtain—APIs to call, open-weight models to download, increasingly standardised fine-tuning pipelines—what is genuinely hard to copy may turn out to be domain data, expert feedback, production failure history, and evaluation infrastructure accumulated over years.

Because the most dangerous thing in AI development has never been that the model failed to improve. It is:

> **that you believed it had.**

A model gains five points on a leaderboard and regresses on your core user task. A reward model score climbs steadily while the policy merely gets better at hacking it. An agent demo looks extraordinary and then falls apart across 1,000 production cases.

Without good eval, you do not even have the language to describe these problems.

So the question that matters most for model teams may not stay *How do we train a smarter model?* It becomes, increasingly:

> **What does “smarter” actually mean, and how do we know when we get there?**

That is evaluation. On the surface it looks like scoring an AI. In practice, it is where we decide what we want the AI to become.
