---
title: "我们究竟如何知道一个模型「更强」了？"
description: "大模型评估浅论：从 MMLU 到 Agent Benchmark，Eval 如何从「训练完之后的验收」变成塑造模型本身的基础设施。"
date: 2026-08-29 10:00:00 +0800
date_label: "2026.08.29"
categories: [人工智能]
tags: [Eval, Benchmark, RLHF, Reward Model, Agent, Test-time Compute]
translation_url: /en/writing/2026/08/how-we-know-a-model-is-better/
math: true
toc: true
---

如果把过去几年的大模型竞赛压缩成几个问题，大概会经历这样的变化：最早大家问的是 *How big is the model?*，后来变成 *How much compute did you use?*，再后来是 *What is your MMLU score?*。而当模型真的开始进入 coding、research、finance、customer support，甚至直接操作电脑和浏览器之后，一个更麻烦的问题逐渐浮现出来：

> **How do we actually know whether the model is getting better?**

这就是 Evaluation，或者大家更习惯说的 Eval。

Eval 表面上很好理解：拿一套题给模型做，然后算分。但如果真正参与过模型研发，你很快就会发现，Evaluation 可能是整个 LLM pipeline 里最容易被低估、同时又最接近「核心」的一环。因为它不只是训练完成以后拿来验收模型的 QA system。<mark>你怎么定义「好」，最终就决定了团队收什么数据、怎样做 post-training、reward model 学什么、RL 优化什么，甚至 inference time 应该搜索什么。</mark>

换句话说：

> **The model you get is downstream of the eval you build.**

从这个意义上说，大模型研发真正的起点，并不一定是 training，而是 measurement。

## 01｜Eval 不是 Benchmark：先搞清楚我们到底在测什么

很多人第一次接触 Evaluation，会把 benchmark、test set、leaderboard、eval 几个词混在一起。实际上 benchmark 只是 eval 的一个组成部分。一个完整的 Evaluation System，至少可以写成一个六元组：

$$
\text{Eval} \;=\; \big\langle\, C,\; T,\; G,\; J,\; M,\; P \,\big\rangle
$$

其中 $$C$$ 是想测量的 construct（能力本身），$$T$$ 是代表这个能力的 task distribution，$$G$$ 是 ground truth 或 rubric，$$J$$ 是做判断的 judge，$$M$$ 是把判断聚合成数字的 metric，$$P$$ 则是模型接受测试时的 protocol（prompt 模板、few-shot 数量、temperature、工具权限、上下文长度）。

也就是说，你至少需要回答六个问题：想测什么能力？用哪些任务代表这个能力？什么样的回答叫好？谁来判断？怎么把判断变成数字？模型在什么条件下接受测试？

以最经典的 MMLU 为例，它把模型放进一个高度标准化的考试场景：57 个 task，覆盖 elementary mathematics、US history、computer science、law 等不同学科，用 multiple-choice accuracy 测试模型在广泛知识和问题求解上的表现。MMLU 在 2020 年提出时，大模型在这些任务上距离 expert-level performance 还有非常大的差距，因此它可以很好地区分不同模型。

但这里马上出现了 Evaluation 中最重要的一个概念：**construct validity**，构念效度。

MMLU 分数高，究竟说明了什么？它至少说明模型在这一组多学科选择题上表现不错。但它是不是意味着模型「更聪明」？是不是意味着它更适合当 research assistant？是不是更会 coding？是不是更擅长真实世界的 planning？这些结论都不能直接推出。

这也是所有 Evaluation 的第一原则：

> **Never confuse the metric with the construct.**

指标只是我们为了测量某个抽象能力而设计的 proxy，而不是能力本身。用符号写出来，我们真正关心的是 $$C$$，但能观测到的只有 $$M$$，而两者之间永远隔着一层：

$$
M \;=\; f(C) + \varepsilon
$$

其中 $$\varepsilon$$ 包含了 task sampling 的偏差、grader 的噪声、prompt 格式的敏感度、以及数据污染。Eval engineering 的大部分工作，本质上就是在压缩这个 $$\varepsilon$$，并且诚实地承认它没有被压到零。

比如大家经常说要测 reasoning。但 reasoning 本身至少可以继续拆成 deductive reasoning、mathematical reasoning、causal reasoning、multi-hop reasoning、planning、counterfactual reasoning、long-horizon reasoning。你如果连自己到底想测哪一种 reasoning 都没有定义清楚，那么后面的 dataset 再大、grader 再高级、统计方法再漂亮，其实都没有太大意义。

所以真正成熟的 eval 从来不是从「找哪个 benchmark 跑一下」开始，而是从一句话开始：

> **What capability or behavior are we trying to measure?**

## 02｜从 MMLU 到 HumanEval：为什么「正确答案」还不够？

MMLU 代表了非常经典的一类 benchmark：题目是静态的，答案是确定的，评分函数也很简单——Exact Match / Accuracy。

这类 eval 有一个巨大的工程优势：它非常干净。只要协议一致，A 模型 80%，B 模型 85%，比较相对容易。

但当模型从「回答问题」走向「创造一个可以执行的东西」以后，字符串匹配就开始失效了。

2021 年 OpenAI 在 Codex 论文中提出 HumanEval。核心变化不是「把题目换成了编程题」，而是评分哲学变了：模型根据 docstring 生成 Python function，评估的重点是 **functional correctness**——代码是不是真的能工作，而不是生成的文本像不像某个 reference answer。原论文中 Codex 在 HumanEval 上解决了 28.8% 的问题，而一个很有意思的结果是：如果允许同一个问题反复 sampling 100 次，至少找到一个可行解的比例可以提升到 70.2%。

这件事非常重要，因为它实际上同时预示了两条后来越来越关键的路线。

**第一条是：对于可以执行的任务，environment 本身就是最好的 evaluator。**

你问「这段代码好不好」，让另一个 LLM 看一眼当然可以；但如果真正的问题是「这段代码能不能完成需求」，最可信的方法通常仍然是：*Run the tests.*

这就是 deterministic eval，包括 exact match、unit tests、compiler / runtime、SQL execution、schema validation、numerical tolerance、state checking。

<mark>如果任务存在客观、可执行的 ground truth，优先使用 deterministic evaluator，往往比 LLM-as-a-Judge 更可靠。</mark>

**第二条则更加有意思：HumanEval 已经说明，模型能力不是一个单次 deterministic output，而是一个 probability distribution。**

对于同一个问题 $$x$$，我们实际上面对的是

$$
y \;\sim\; p_\theta(\,\cdot \mid x\,)
$$

于是「第一次回答就正确的概率」可以写成

$$
\text{pass@}1 \;=\; \mathbb{E}_{x}\Big[\ \mathbb{E}_{y \sim p_\theta(\cdot\mid x)}\big[\ \mathbf{1}\{\text{correct}(y)\}\ \big]\Big]
$$

而「给模型 $$k$$ 次机会能不能找到正确答案」是另一回事。若对每题采样 $$n$$ 个候选、其中 $$c$$ 个正确，Codex 论文给出的无偏估计是

$$
\text{pass@}k \;=\; \mathbb{E}_{x}\left[\, 1 - \frac{\dbinom{n-c}{k}}{\dbinom{n}{k}} \,\right]
$$

这条线最终会一路发展到 Best-of-N、self-consistency、search、verifier、test-time compute。

换句话说，从 HumanEval 开始，我们已经不再只评估：

> **Can the model answer this question?**

而开始评估：

> **Can the system search its output space until it finds a correct answer?**

## 03｜从 HumanEval 到 SWE-bench：会写代码，不等于会做 Software Engineering

HumanEval 解决了一个重要问题：不要比较代码长得像不像 reference，应该直接测试 functional correctness。但它仍然有一个明显限制：它主要测试的是相对独立的函数生成任务。

真实软件工程不是这样的。现实中的 programmer 接到的可能是：「这个 repository 有个 GitHub issue，用户说 pagination 在某种情况下出 bug，你去修一下。」

于是模型需要先理解 issue，再阅读一个可能有几万行代码的 repo，定位 relevant files，理解现有 architecture，修改一个或多个文件，运行 tests，然后确保没有引入 regression。

这就是 SWE-bench 想测的东西。原始 SWE-bench 从 12 个真实 Python repositories 中收集了 2,294 个真实 GitHub issues 及对应 pull requests。模型拿到的是 codebase 和 issue description，任务不是「写一个函数」，而是直接修改 repository，让 issue 被真正解决。这个过程经常要求跨 function、class 甚至多个 files 协同修改。论文最初发表时，即使当时最好的系统也只能解决很少一部分问题。

这其实代表了整个 benchmark 设计思想的一次巨大迁移：

> HumanEval 测的是 **code generation**；SWE-bench 测的是 **software engineering task completion**。

而今天 SWE-bench Verified 又进一步加入了 human validation：从原始数据中筛出 500 个经过人工检查的实例，确保 issue description 清晰、test patch 合理，而且任务确实可以在所给信息下解决。

这里出现了 Eval Engineering 中一个经常被忽略的问题：**benchmark 本身也会有 bug**。

如果一道题其实无法完成、reference answer 有问题、grader 写错了，那么你最后测到的就不是模型能力，而是 dataset noise。因此高质量 eval 并不是简单地「收更多题」，而是要不断做 dataset validation、error analysis、human audit、versioning。

这也是为什么真正业务里的 Golden Set 往往比随便找一个 public benchmark 更有价值。我更愿意把 Golden Set 定义成：

> 一组规模未必很大，但经过严格筛选、能代表真实 workload，并且拥有可信 grading criteria 的任务集合。

如果你做金融 Research Agent，那么 golden set 不应该是一堆「什么是 EBITDA」这样的金融知识题，而应该来自 analyst 真的会做的事情：从 earnings release 提取 guidance、重建 segment revenue、识别 GAAP/non-GAAP differences、从 10-K 中分析 debt maturity、根据 management commentary 判断 margin driver、检查 valuation model 中的数据引用。

Public benchmark 回答的是 *How good is my model compared with everyone else?*；Golden Set 回答的则是 *How good is my system at doing my job?*

这两个问题根本不是一回事。

## 04｜Benchmark 最大的问题：你最后会把考试本身学会

一个 benchmark 一旦被公开，就开始了一场不可避免的 race。研究者研究它，model developers 跑它，training data 可能包含它，post-training data 可能围绕它构造，prompt engineering 也会针对它优化。最终一个 benchmark 可能出现 saturation，甚至 contamination。

这背后其实就是 Goodhart's Law：

> **When a measure becomes a target, it ceases to be a good measure.**

回到前面那个式子：我们优化的是可观测的 $$M$$，希望顺带提升不可观测的 $$C$$。但一旦优化压力足够大，模型完全可以只在 $$\varepsilon$$ 上做文章——分数上去了，能力没动。

如果所有团队都优化 MMLU，最终你很难判断模型到底变得更有 general intelligence，还是更擅长 MMLU-shaped tasks。

更麻烦的是 contamination。公开题目长期存在于互联网后，就可能出现在 pretraining 或 post-training corpus 中。近年来甚至专门出现了 MMLU-CF 这样的工作，通过 closed test set 和 decontamination 规则试图减少 benchmark leakage；其出发点正是公开 MCQ benchmark 容易受到 data contamination 的影响。

所以今天一个真正靠谱的 Evaluation System，通常不会押注在单一 static benchmark 上，而会同时使用 public benchmark、private benchmark、held-out golden set、dynamic task generation 和 production failure cases。

<mark>Benchmark 不应该是一张毕业证，而应该是一支不断需要重新校准的温度计。</mark>

## 05｜开放式回答怎么办？答案开始从「对不对」变成「哪个好」

当 LLM 真正进入聊天、writing、analysis 之后，一个更加根本的问题出现了。

假设用户说：「帮我写一封拒绝 offer 的邮件，但不要太冷漠。」模型 A 写得非常礼貌但啰嗦，模型 B 很简洁但稍微生硬。哪个「正确」？

这里根本不存在 exact match。于是 Evaluation 从 answer correctness 进入 **preference judgment**。

Chatbot Arena 就是这个变化最典型的案例之一。它不规定一个所谓 golden answer，而是把两个匿名模型的输出放在一起，让真实用户做 pairwise comparison：A better、B better、tie。Chatbot Arena 的原始论文就是通过 crowdsourced pairwise human preferences 构建模型比较体系，并报告了用户投票与 expert raters 之间较好的 agreement。

这个设计非常聪明，因为人其实不太擅长回答「这篇回答到底是 7.8 分还是 8.2 分」，但非常擅长回答「这两个里面哪个更好」。

而 pairwise 之所以能变回一个可排序的分数，靠的是 Bradley–Terry 模型：给每个模型一个隐含实力 $$s_i$$，则

$$
\Pr\big[\,i \succ j\,\big] \;=\; \frac{e^{s_i}}{e^{s_i} + e^{s_j}} \;=\; \sigma\big(s_i - s_j\big)
$$

Elo 式的排行榜，本质上就是在用大量 pairwise 比较去反解这组 $$s_i$$。

这也是为什么 pairwise preference 会同时出现在 Evaluation 和 Post-training 两个世界里。而这正是理解 RLHF 的入口。

## 06｜RLHF：Evaluation 第一次直接变成 Training Signal

传统 supervised learning 的思路是：给模型一个 input，再给它一个 ideal output，让模型学习 imitation。但对于开放式 assistant，很多任务根本没有唯一的 ideal response。我们可能只知道：**A 比 B 好**。

RLHF——Reinforcement Learning from Human Feedback——做的核心事情，就是把这种 preference 转换成可以优化的 signal。

InstructGPT 是最经典的例子之一。其 pipeline 大致可以理解成三步：先收集人类写出的 high-quality demonstrations 做 supervised fine-tuning；然后针对同一个 prompt 生成多个 candidate responses，让 human labelers 对回答进行 ranking；接着用这些 preference data 训练一个 reward model，再让语言模型通过 reinforcement learning 去最大化这个 reward。

注意第二步用的正是上一节那个 Bradley–Terry 形式。reward model $$r_\phi$$ 的训练目标是

$$
\mathcal{L}(\phi) \;=\; -\,\mathbb{E}_{(x,\,y_w,\,y_l)\,\sim\,\mathcal{D}}\Big[\ \log \sigma\big(\, r_\phi(x, y_w) - r_\phi(x, y_l) \,\big)\ \Big]
$$

其中 $$y_w$$ 是人类偏好的回答，$$y_l$$ 是被拒绝的那个。然后 policy 的优化目标变成

$$
\max_{\pi_\theta}\;\; \mathbb{E}_{x \sim \mathcal{D},\; y \sim \pi_\theta(\cdot \mid x)}\big[\, r_\phi(x, y) \,\big] \;-\; \beta \, \mathbb{D}_{\mathrm{KL}}\Big[\, \pi_\theta(y \mid x) \,\big\|\, \pi_{\text{ref}}(y \mid x) \,\Big]
$$

第二项那个 KL penalty 值得多看一眼。它的存在本身就是一句关于 evaluation 的坦白：**我们并不完全相信这个 evaluator**。$$\beta$$ 越小，policy 越敢于把 reward model 推到分布之外；而一旦推得太远，得到的往往不是更好的回答，而是 reward model 的漏洞。

这里发生了一件非常关键的事情：

> **Evaluator 不再只是测量模型，它开始塑造模型。**

Reward model 本质上就是一个 learned evaluator。于是一个非常自然的问题出现了：

> **Who evaluates the evaluator?**

如果 reward model 有 bias，policy 就会学习 exploit 这个 bias。如果 reward model 偏爱特别长的答案，模型就会越来越啰嗦；如果 RM 把 confident tone 错当成 correctness，模型就可能学会「更加自信地犯错」。

所以 reward model 本身也需要 eval。这也是后来 RewardBench 这类 benchmark 出现的原因：reward model 已经成为 alignment pipeline 中的关键基础设施，因此必须单独测它判断 chosen / rejected response 的能力。

Evaluation 从此开始递归：我们评模型；然后训练一个模型来评模型；然后还要再设计 benchmark 去评这个「评模型的模型」。

## 07｜RLAIF：如果 Human Feedback 太贵，让 AI 自己当监督者呢？

RLHF 有一个非常现实的问题：human feedback 很贵，而且随着模型能力提升，人类会越来越难监督。如果模型正在证明一个复杂 theorem、分析几十万行代码、检查专业金融模型，一个普通 annotator 根本不知道答案到底好不好。

于是自然出现了一个方向：**Can AI supervise AI?**

Anthropic 的 Constitutional AI 是这条路线的标志性工作之一。在其 RL 阶段，模型会生成 candidate responses，再由另一个模型根据预先定义的 constitutional principles 判断哪个回答更好，由这些 AI preferences 训练 preference model，再作为 reinforcement learning 的 reward signal；这就是 RLAIF——Reinforcement Learning from AI Feedback。

这件事对 Evaluation 的意义远比「省人力」更大。因为一旦 evaluator 可以由 model scale，你就可以产生数量级更大的 feedback。但与此同时，新的风险也来了：如果 teacher model 和 student model 共享同样的 blind spot，整个 feedback loop 可能变成一种 self-reinforcing error。

<mark>Human feedback 有 human bias，AI feedback 有 model bias。Evaluation 从来没有免费的午餐。</mark>

## 08｜LLM-as-a-Judge：Judge Model 为什么好用，又为什么危险？

即使不做 RL，在日常产品开发里，团队也越来越频繁地使用 LLM-as-a-Judge。一个标准 judge prompt 通常包含 user question、reference context、candidate response 和 evaluation rubric，然后要求一个强模型输出 correctness、relevance、completeness、style 等 score。

这非常 scalable，特别适合那些无法 deterministic grading 的任务。但 LLM judge 并不是 oracle。

经典的 MT-Bench / LLM-as-a-Judge 研究发现，强模型作为 judge 可以与 human preference 达到较高 agreement，但同时也系统性存在 position bias、verbosity bias、self-enhancement bias 等问题。

Position bias 很简单：把 A 放左边和把 A 放右边，judge 可能给出不同结果。检验它其实只要一个数：把顺序交换以后仍然给出同一结论的比例，

$$
\text{consistency} \;=\; \Pr\Big[\, J(x,\,y_a,\,y_b) \;=\; \overline{J(x,\,y_b,\,y_a)} \,\Big]
$$

如果这个数明显低于 1，那么你 leaderboard 上的差距里有一部分只是位置。Verbosity bias 则意味着一个很长、信息密度一般的回答，可能因为「看起来更完整」而赢过短而准确的答案。

所以真正使用 LLM-as-a-Judge 时，不能只是「拿最强模型帮我打个分」。你至少要考虑：rubric 是否足够明确；用 absolute scoring 还是 pairwise；A/B 是否需要 swap position；judge 是否能看到 reference；是否要求 judge 给出 evidence；是否存在 domain blind spot；以及和 human expert 的 agreement 到底是多少。

正确的思路不是把 LLM Judge 当成 ground truth，而是：

> **Treat the judge as another noisy measurement instrument.**

先 calibration，再 scale。

## 09｜Outcome Reward vs Process Reward：只看最终答案够不够？

Evaluation 继续向 reasoning 深处走，就会碰到另一个问题。

假设一道数学题最终答案是 42。模型写了十步推理，第 4 步其实错了，第 7 步又阴差阳错地把错误抵消，最后结果刚好等于 42。按照 outcome-based evaluator：*Perfect.* 按照我们真正希望模型具有的 reasoning：显然不应该 perfect。

这就是 **Outcome Reward Model（ORM）** 和 **Process Reward Model（PRM）** 的区别。写出来，ORM 只看终点：

$$
r_{\text{outcome}}\big(x,\, y_{1:T}\big) \;=\; \mathbf{1}\big\{\, \text{answer}(y_{1:T}) = y^{\star} \,\big\}
$$

PRM 则对每一步 $$y_t$$ 都给一个 step-level score $$s_\phi(x, y_{1:t})$$，再聚合，例如

$$
r_{\text{process}}\big(x,\, y_{1:T}\big) \;=\; \min_{1 \le t \le T} s_\phi\big(x,\, y_{1:t}\big)
\qquad\text{或}\qquad
\prod_{t=1}^{T} s_\phi\big(x,\, y_{1:t}\big)
$$

注意这里用 $$\min$$ 或连乘而不是求平均，是有意为之：一条推理链的可信度应该由它最弱的一步决定，而不是被九个正确步骤平均掉。

OpenAI 的 *Let's Verify Step by Step* 对这一问题做了系统实验。在其 MATH 实验中，process supervision 显著优于只根据最终结果进行监督的方法，并发布了包含约 80 万 step-level human feedback labels 的 PRM800K。

为什么 PRM 这么重要？因为复杂 reasoning 里最大的问题并不是「最终有没有得到答案」，而是 error 可以在 trajectory 中不断累积。

但 process supervision 也有自己的难题：一个问题可能存在很多条完全不同但同样合理的 reasoning path。如果你的 process rubric 过于 rigid，模型反而可能为了迎合 grader，失去探索 alternative reasoning strategy 的能力。

因此到了 Agent 时代，一个越来越重要的原则会出现：

> **Outcome first, process for diagnosis.**

最终有没有把事情办成，应该是主指标；trajectory evaluation 更多用于定位 failure，而不是强迫 agent 必须按照某一条「标准路径」行动。

## 10｜Best-of-N：Evaluator 还能在 inference time 直接提高模型能力

Reward model 还有第三种用途，而且特别容易被忽略：它甚至不需要更新 model weights。

假设模型面对一个问题一次性生成 $$N$$ 个答案，再用 reward model 或 verifier 挑一个最好的：

$$
y^{(1)}, \dots, y^{(N)} \;\overset{\text{i.i.d.}}{\sim}\; \pi_\theta(\,\cdot \mid x\,),
\qquad
\hat{y} \;=\; \arg\max_{1 \le i \le N}\; r_\phi\big(x,\, y^{(i)}\big)
$$

这就是最简单的 **Best-of-N（BoN）**。

这里 evaluator 的角色又发生了变化：它既不是 benchmark，也不是 RL training signal，而是直接成为 inference-time search algorithm 的一部分。

其实 HumanEval 当年 repeated sampling 能显著提高「至少找到一个正确程序」的比例，就已经展示了这种潜力。后来的 Best-of-N 方法则更加明确地使用 reward model 从多个 samples 中挑选最优候选。

不过这里有一个必须写清楚的前提。设 $$q(y)$$ 是我们真正关心的质量，$$r_\phi$$ 只是它的 proxy。当 $$N$$ 增大时，$$\mathbb{E}\big[q(\hat{y})\big]$$ 是否随之上升，完全取决于 $$r_\phi$$ 与 $$q$$ 在**分布尾部**是否仍然一致。搜索越激进，越容易挑中那些 $$r_\phi$$ 很高、$$q$$ 却并不高的样本——这就是 reward hacking 在 inference time 的版本。BoN 与 RLHF 里的 KL penalty，其实是在处理同一个问题的两种形式。

这实际上揭示了今天所谓 test-time scaling 背后的一个核心规律：

> **Generator 决定你能产生哪些 candidate；Evaluator 决定你能不能从里面找到好的那个。**

模型越强，generator 当然重要；但当 sample 数量和 search depth 上升以后，verifier / reward model quality 会越来越接近整个系统的瓶颈。这就是为什么 Evaluation 和 Reasoning 的边界正在迅速消失。

## 11｜Agent 出现以后，Benchmark 从「题目」变成了「环境」

当 LLM 只是 chatbot 时，Evaluation 的基本结构非常简单：给一个输入 $$x$$，拿到一个输出 $$y$$，然后打分

$$
\text{score} \;=\; g\big(y,\; y^{\star}\big)
$$

但 Agent 完全不是这个结构。一个 Agent 的 trajectory 更像

$$
\tau \;=\; \big(\, s_0,\; a_1,\; o_1,\; s_1,\; a_2,\; o_2,\; \dots,\; a_T,\; o_T,\; s_T \,\big)
$$

其中 $$a_t$$ 是 action（调用工具、点击页面、写文件），$$o_t$$ 是 observation，$$s_t$$ 是 environment state。而评分变成了对**终态**的判断：

$$
\text{success}(\tau) \;=\; \mathbf{1}\big\{\, \Phi(s_T) \,\big\}
$$

也就是说，你检查的不再是模型写了什么，而是世界最后变成了什么样子。「最后回答写得好不好」甚至可能已经不是重点。

比如一个 travel agent 的目标是「帮我找到符合条件的航班」。它可能要浏览网页、读取日期、过滤价格、比较行程、处理页面错误。你真正想评估的是：*Did the agent complete the task?*

这就是 Agent Benchmark 出现的背景。AgentBench 直接把模型放进 8 个不同的 interactive environments，评估 reasoning 和 decision-making，而不仅仅是静态 QA。GAIA 则进一步把目标定义成 general AI assistant：其 466 个问题会要求 reasoning、multimodal understanding、web browsing 和 tool use，而且特意设计成「人觉得并不特别难，但 AI 系统很容易失败」的任务。原始论文中 human respondents 达到 92%，而当时配备 plugins 的 GPT-4 只有 15%，说明「考试题很强」与「真实 assistant 很稳健」完全是两个维度。

WebArena 更进一步：它直接构造可以交互的真实感网站环境，包括 e-commerce、forum、software development、content management 等场景，然后检查 agent 是否真的完成了 web task。原论文的 best GPT-4-based agent end-to-end success rate 只有 14.41%，而 human performance 为 78.24%。

注意这里发生的范式变化：

> 传统 benchmark 给模型一张试卷；Agent benchmark 给模型一个世界。

而 evaluator 不再只是检查文本答案，还需要检查 environment state、tool invocation、task completion、side effects、constraint violations、trajectory、cost 和 latency。

这也意味着未来最重要的 Evaluation infrastructure，很可能不是「题库」，而是 **reproducible environment**。

## 12｜Agent Eval 真正难的地方：Failure Attribution

假设一个金融 Agent 最终把一家公司的 2026E EBITDA 算错了。一句「Answer incorrect」其实没有多大价值。真正有价值的是知道**为什么**错。

也许它搜索到了错误年份的 earnings report，这叫 retrieval failure；也许文档找对了但把 adjusted EBITDA 当成 GAAP operating income，这是 extraction / semantic failure；也许数字都正确但公式算错了，这是 calculation failure；也许分析完全正确，但 citation 引用了另一份文件，这是 citation failure；也许 external tool timeout 之后 agent 没有 retry，这是 recovery failure。

因此成熟的 Agent Eval 最重要的东西之一不是总分，而是 **Failure Taxonomy**：

| Failure Type | Share |
| --- | --- |
| Retrieval | 27% |
| Tool Use | 19% |
| Reasoning | 18% |
| Data Extraction | 14% |
| Calculation | 9% |
| Citation | 8% |
| Other | 5% |

这张表的价值往往比「Overall score = 73.4」大得多，因为它直接回答了研发团队下一步应该改哪里。

如果 40% 的 failure 都来自 retrieval，你继续做 reasoning RL 很可能没有太大意义；如果 agent 大多数时候都找到了正确资料，但计算环节不稳定，那么也许需要的是一个 deterministic calculator，而不是更大的模型。

<mark>Eval 真正的作用并不是告诉你模型有多差，而是告诉你系统为什么差。</mark>

## 13｜为什么一个 Overall Score 几乎永远不够？

假设一个新 checkpoint 的 overall score 从 82.1 升到 84.0。听起来很好。但如果拆开：

| Slice | Old | New |
| --- | --- | --- |
| Math | 81 | 89 |
| Coding | 80 | 87 |
| Writing | 84 | 85 |
| Finance | 86 | **77** |
| Safety | 88 | **82** |

如果你做的是 Financial Copilot，这不是升级，是事故。

所以真正的 Evaluation 必须做 **slice analysis**。常见维度包括 task type、domain、difficulty、language、context length、tool type、risk level、user segment、failure class。

与此同时还要看 statistical uncertainty。一个模型在 100 道题上 83%，另一个 84%，并不能自动推出后者更好——因为 eval 本身也是 sampling。二项比例的标准误是

$$
\mathrm{SE} \;=\; \sqrt{\frac{\hat{p}\,(1 - \hat{p})}{n}}, \qquad
\text{95\% CI} \;=\; \hat{p} \;\pm\; 1.96\,\mathrm{SE}
$$

代入 $$\hat p = 0.83$$、$$n = 100$$，$$\mathrm{SE} \approx 3.8\%$$，置信区间大约是 $$\pm 7.4$$ 个百分点。也就是说，83% 和 84% 之间的差距，几乎完全淹没在噪声里。

更好的做法是 paired comparison：在同一批题目上比较两个模型，只统计一个对、另一个错的那些题（McNemar 检验），这样可以消掉题目难度带来的方差，用同样的样本量得到高得多的分辨率。

这就是为什么 leaderboard 上一个漂亮的 scalar score，在真实 model development 里往往只是入口。真正重要的是：

> **Where did we improve, where did we regress, and why?**

## 14｜Offline Eval、Online Eval，以及现实世界最后的一票

再好的 golden set 都有一个天然问题：它只是现实世界的 proxy。最终产品成功与否，不是由 MMLU、SWE-bench 或某个 internal judge score 决定，而是由真实用户决定。

于是 Eval 最后还要分成两个世界。

**Offline Eval** 用于开发阶段。它便宜、快速、可重复、可以 regression test，也能在上线前抓住明显问题。

**Online Eval** 则看 production 里的真实 outcome：task completion、user preference、regeneration rate、escalation rate、retention、conversion、latency、token cost、cost per successful task。

最后一个指标值得单独写出来，因为它常常比单纯的 accuracy 更能反映系统的真实经济性：

$$
\text{cost per successful task} \;=\; \frac{\mathbb{E}\big[\text{cost per attempt}\big]}{\Pr\big[\text{success}\big]}
$$

一个把 success rate 从 60% 提到 75% 的改动，即使单次调用更贵，也可能整体更便宜。

但这里又有一个坑：**user preference 不等于 truth**。一个非常自信、语言漂亮、永远顺着用户说的模型，可能 immediate preference 很高，但 factuality 和 calibration 很差。因此真正的 product objective 往往是 multi-objective，写成带约束的形式会更诚实：

$$
\max_{\text{system}} \;\; \mathbb{E}\big[\text{task success}\big]
\quad \text{s.t.} \quad
\text{factuality} \ge \tau_f,\;\;
\text{harm rate} \le \tau_s,\;\;
\mathbb{E}[\text{cost}] \le c,\;\;
p_{95}(\text{latency}) \le \ell
$$

把 safety 和 factuality 放进约束而不是放进加权和，是有意义的：它们不应该被 success rate 的提升「买断」。

这也是为什么根本不存在一个真正意义上的 *Universal LLM Score*。<mark>模型能力不是 scalar，而是一个 vector。</mark>所谓「哪个模型最好」，本身就是一个不完整的问题。真正的问题永远是：

> **Best for what?**

## 15｜真正应该怎么搭一套 Eval System？

如果今天从零开始做一个 LLM / Agent 产品，我不会先问「业界 benchmark 用什么」，而会按下面这套逻辑设计。

1. **收集真实任务**，而不是让 PM 在会议室里凭空造 prompts。你需要知道真正的 workload distribution 是什么。
2. **把任务做 taxonomy**：Task Type × Difficulty × Domain × Risk × Tool。
3. **抽出一个 high-quality Golden Set**。数量不一定特别大，但必须 representative，而且要包含 edge cases 和历史 production failures。
4. **为每一种任务设计 rubric**。什么叫 fully correct，什么叫 partial success，什么叫 critical failure，能不能 abstain，是否要求 citation，都要写清楚。
5. **能 deterministic grading 的绝不先上 LLM judge**。代码跑 tests，数字直接算，tool task 检查 final environment state。
6. **对无法直接执行的任务**（writing、analysis、open-ended QA），再引入 criteria-based LLM judge，并用 expert human labels 做 calibration。
7. **不只输出 overall score**，而是维护 slices 和 failure taxonomy。
8. **每一次更新都跑 regression suite**——model、prompt、retrieval、tool、system prompt，任何一处改动都算。
9. **让 production 中出现的新 failure 持续回流到 eval set。**

于是整个研发流程会变成一个闭环：

> real workload → golden set → rubric → grader → slice & failure analysis → 定位瓶颈 → 改 model / prompt / retrieval / tool → regression → 上线 → production failures → 回流到 golden set

这就是 **Eval-driven Development**。

它和传统 software engineering 里的 Test-driven Development 很像，但困难也大得多，因为传统软件测试的是 deterministic system，而 LLM 是 stochastic、开放式、甚至会主动与环境交互的系统。

## 16｜Eval 最后为什么会变成 AI 研发最核心的基础设施？

现在我们可以重新看一遍整个历史。

MMLU 时代，Evaluation 主要意味着**给模型出题**。HumanEval 出现以后，我们发现**不要只看文本，应该执行模型的产物**。SWE-bench 进一步告诉我们**不要只测 isolated task，要测真实 workflow**。Chatbot Arena 告诉我们**有些质量没有唯一答案，只能从 human preference 中学习**。

RLHF 把 human preference 训练成 reward model，于是 **Evaluation 开始成为 training objective**。RLAIF 让 AI 自己产生 preference，于是 **evaluator 也开始 scale**。Process Reward 告诉我们，对于复杂 reasoning，可能不仅要评价 outcome，还要监督过程。Best-of-N 又把 evaluator 搬到了 inference time：模型生成很多可能性，verifier 决定哪个值得留下。最后 Agent benchmark 把整个问题推进到环境层面——我们不再评估「模型回答了什么」，而是在评估「系统究竟完成了什么」。

所以今天再把 Evaluation 理解成「模型训练完以后跑几个 benchmark」，其实已经完全低估了它。在越来越多现代 AI system 中，Evaluator 同时承担至少四个角色：<mark>它测量模型，也塑造模型；它决定 reward，也指导 inference-time search。</mark>它既告诉你哪个模型更强，也告诉你系统为什么失败。

而当 foundation model 本身越来越容易获得——API 可以调用，open-weight model 可以下载，fine-tuning pipeline 越来越标准化——真正难复制的东西，反而可能变成 domain data、expert feedback、production failure history，以及长期积累下来的 evaluation infrastructure。

因为 AI 开发里最危险的一件事情，从来不是「模型没有进步」，而是：

> **你以为它进步了。**

一个模型在 leaderboard 上涨了 5 分，却在你的核心用户任务上退化；一个 reward model score 一路上升，却只是越来越擅长 reward hacking；一个 Agent demo 看起来惊艳，但真正跑 1,000 个 production cases 时 success rate 一塌糊涂。

没有好的 Eval，你甚至没有语言去描述这些问题。

所以未来模型团队真正重要的问题，也许不会只是 *How do we train a smarter model?*，而会越来越变成：

> **What does "smarter" actually mean, and how do we know when we get there?**

这就是 Evaluation。它表面上是在给 AI 打分；实际上，它是在定义我们究竟想把 AI 变成什么。
