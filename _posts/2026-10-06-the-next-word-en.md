---
title: "The Next Word"
description: "From Markov to ChatGPT: a history of language models told through the task of predicting the next word."
date: 2026-10-06 00:00:00 +0800
date_label: "2026.10.06"
categories: [Artificial Intelligence]
tags: [language models, history of technology, GPT]
lang: en
permalink: /en/writing/2026/10/the-next-word/
translation_url: /writing/2026/10/the-next-word/
toc: true
math: true
---

## I

The problem:

Given a sequence of symbols $u_1, u_2, \ldots, u_{i-1}$, find $u_i$.

More precisely, find parameters $\Theta$ that maximise:

$$L(\mathcal{U}) = \sum_i \log P\left(u_i \mid u_{i-k}, \ldots, u_{i-1}; \Theta\right)$$

Reader, if formulas are not for you, skip it. But remember its shape. It appears on page three of a twelve-page paper from June 2018, numbered (1). Four authors, a title almost dull in its modesty: *Improving Language Understanding by Generative Pre-Training*. It was nowhere near as famous then as it is now.

A child just learning to read could understand what the formula says:

See the preceding words. Guess the next one.

Just guessing words.

Humanity took a hundred and ten years to get here.

## II

23 January 1913. St Petersburg, the Imperial Russian Academy of Sciences.

Andrey Markov, fifty-six, brings a report. He wants to refute the view that the law of large numbers applies only to independent events. Even events that depend on their predecessors, he argues, obey statistical order.

He needs real, interdependent data. He finds Pushkin.

*Eugene Onegin*. Starting at the beginning, he removes punctuation and spaces and takes twenty thousand letters, dividing them into vowels and consonants. No computer, no assistant: paper, pencil, eyes. He calculates the frequency of vowels, 0.432, and the probabilities of a vowel following a vowel or a consonant following a vowel.

Russia's most beautiful poetry becomes a sequence of binary symbols.

He is not thinking of language, much less machines. He is thinking of a technical dispute in probability. History often works this way: when a door opens, the person opening it is looking elsewhere.

## III

1948. Bell Labs. Claude Shannon publishes *A Mathematical Theory of Communication*.

In the paper that lays the foundation for the information age, he does something seemingly childish: generates English.

A zero-order approximation, choosing letters uniformly, produces `XFOML RXKHRJFFJUJ`: rubble. A first-order approximation uses actual letter frequencies, and English begins to breathe through the ruins. Second order considers the preceding letter; third order, the preceding two. A second-order approximation using words produces sentences that already sound grammatical, if meaningless.

Shannon is doing what we now call language modelling. His tools are manually compiled statistical tables.

In 1951 he writes *Prediction and Entropy of Printed English*. He asks a subject to guess the next letter of a text, reveals mistakes, and records how many guesses it takes to get it right. The subject is said to have been his wife, Betty.

His result: each English letter carries between 0.6 and 1.3 bits of information.

A judgement follows, one whose implications will unfold over seventy years: prediction and compression are two faces of the same thing. The more accurately you predict the next letter, the shorter the code in which you can write the book. The shorter the code, the deeper your understanding of it.

The *Commentary on the Appended Judgements* says that writing cannot exhaust speech, nor speech exhaust meaning.

Shannon answers with a number.

## IV

Then come the mountains.

In 1957 Noam Chomsky publishes *Syntactic Structures*, with its famous sentence: “Colorless green ideas sleep furiously.” It is grammatical and meaningless; a frequency-based model, he argues, would give it and its reverse the same probability: zero. Statistics cannot account for language.

It is one of twentieth-century linguistics' most elegant blows. It drives a generation of brilliant minds away from that road. For the next thirty years the dominant approach is to write rules: how noun phrases form, how verbs inflect, the grammar of human language, handed to machines to execute.

A few remain below the mountains. They work on speech recognition at IBM, turning dictation into text. They speak of probabilities rather than grammar. Their leader, Frederick Jelinek, is credited with the quip that firing a linguist improved recognition accuracy. He later disputed the wording. It survives because it catches the direction of the next forty years.

In 1997 Hochreiter and Schmidhuber introduce long short-term memory, allowing recurrent networks to remember a more distant past. In 2003 Bengio and colleagues describe a neural probabilistic language model, mapping each word to a dense vector. In 2013 Mikolov's word2vec offers the startling relation: king minus man plus woman is approximately queen. Words have coordinates; meaning has geometry. In 2014 Sutskever, Vinyals, and Le introduce sequence-to-sequence learning. That same year Bahdanau and colleagues introduce attention, allowing each translated output word to look back at the most relevant input words.

The mountains go on. How many people spend a lifetime crossing one ridge, only to find another beyond it?

## V

April 2017. A short paper appears on a preprint server: *Learning to Generate Reviews and Discovering Sentiment*. Three authors: Alec Radford, Rafał Józefowicz, Ilya Sutskever.

Their task seems suspiciously plain. Take 82 million Amazon reviews. Train a multiplicative LSTM with 4,096 units. Ask it to guess what comes next, character by character. Four GPUs, one month.

After training, they examine what each of those 4,096 units does while reading.

At unit 2388 they find something.

Its activation rises with praise and falls with abuse. Through an entire review, it behaves like a thermometer of approval and disapproval. It has grown a representation of sentiment.

No one taught it sentiment. No label in the language-modelling training told it “positive review.” It was asked only to predict the next character. Along that path it learnt human likes and dislikes and set aside a unit to hold them.

A linear classifier trained on representations from these units achieves 91.8% accuracy on the Stanford Sentiment Treebank, exceeding the previous best. One unit carries almost all the sentiment signal.

One neuron.

Reader, pause here.

The seed contains the story that follows. Meaning need not be poured in; it can be pressed out. Force a finite-capacity system to predict an inexhaustible world of text and it must build something of the world behind the text, because that is cheaper. Economy is a deep motive of the universe. Stars and light follow economical paths; corner a machine and it, too, may choose understanding because understanding costs less than memorisation.

In his *Essay on Literature*, Lu Ji describes the writer's pain: intention fails to match things, words fail to reach intention. What is in the mind cannot contain what is before the eyes; what is on the page cannot catch what is in the mind. For two thousand years, every writer has known this pain.

As a machine guesses characters, meaning is squeezed from language.

## VI

12 June 2017. Eight authors. A title like a manifesto, or a challenge: *Attention Is All You Need*.

They discard recurrence, discard convolution, discard structures treated as indispensable for twenty years. They keep attention:

$$\mathrm{Attention}(Q,K,V)=\operatorname{softmax}\left(\frac{QK^{\top}}{\sqrt{d_k}}\right)V$$

Each word looks directly at the other words, calculates whom to attend to and how strongly, and combines what it sees.

Distance is cancelled. Between the first and the hundredth word there are no longer ninety-nine transmission steps. More importantly, words can be computed simultaneously. A recurrent network must walk step by step, and a faster machine cannot remove that order. Attention can spread its work across thousands of chips.

Eight GPUs, twelve hours, a new machine-translation record.

They wanted only to translate English into German.

Almost all eight later leave the company and found businesses. That comes later. What they hand over that day is the foundation of what follows.

## VII

11 June 2018.

Four people: Alec Radford, Karthik Narasimhan, Tim Salimans, Ilya Sutskever. Twelve layers, 117 million parameters. BooksCorpus: over seven thousand unpublished books, romance, fantasy, mystery, unknown authors writing for unknown readers. Eight P600 GPUs, thirty days.

Two steps. First read those books from beginning to end, doing one thing: predict the next word. Then adjust a little for individual tasks. Twelve tasks; new records on nine.

They call it GPT: Generative Pre-trained Transformer.

The world barely reacts.

Four months later Google releases BERT: 340 million parameters, reading in both directions, records across eleven tasks. Attention turns to it. For more than a year BERT dominates conferences and industrial systems. GPT looks like a second-best choice, a transition, a sibling that chose the wrong direction.

For a long time those who persist are a minority. They cannot prove they are right. They have an intuition: reading the whole book is more fundamental than answering the questions correctly.

Before an intuition is confirmed, it looks no different from an obsession. Only the outcome distinguishes them.

## VIII

14 February 2019. Valentine's Day.

GPT-2. 1.5 billion parameters, thirteen times its predecessor.

The corpus changes. WebText: external Reddit links with at least three upvotes, eight million pages, forty gigabytes of text. Casual human approval becomes a machine's reading list. Without intending it, people compile an anthology.

It begins to write articles.

Someone gives it an absurd opening: scientists discover English-speaking unicorns in an unexplored Andean valley. It continues with a plausible scientific report: researchers and universities, quotations, cautious peers, evolutionary speculation. All false. All convincing.

OpenAI announces that it will withhold the full model for fear of large-scale fabrication.

Uproar. Some call it responsible restraint; others call it carefully staged publicity. The unresolved dispute rehearses those to come: capability and risk, openness and control, whether a warning is also an advertisement.

The full model arrives that November. The world does not collapse.

## IX

23 January 2020. Jared Kaplan and colleagues: *Scaling Laws for Neural Language Models*.

Their discovery fits on a line:

$$
L(N)\approx\left(\frac{N_c}{N}\right)^{\alpha_N},\qquad\alpha_N\approx0.076
$$

Loss falls smoothly according to power laws as parameters, data, and compute increase. Across the seven orders of magnitude they can measure, the line remains straight: no bend, no saturation, nothing saying “stop here.”

This is the industry's real conjecture.

Goldbach writes Euler that every even integer greater than two can be expressed as the sum of two primes. It has been checked to enormous numbers, neither proved nor disproved. Scaling laws occupy a similar position: they hold at measured scales, but no one knows precisely why, where they fail, or what failure will look like.

One fundamental difference remains. To advance Goldbach's conjecture, mathematicians need ideas. To push a scaling law further, they need money.

So someone spends it.

(Two years later, Hoffmann and colleagues use Chinchilla to revise the balance: earlier models have too many parameters and too little data; the same compute should process more text. The curve is redrawn. The direction stays.)

## X

28 May 2020. Thirty-one authors. *Language Models are Few-Shot Learners*.

175 billion parameters. Ninety-six layers. Three hundred billion tokens. The training compute would occupy a machine running at a quadrillion operations per second for more than thirty-six hundred days.

The paper's crucial point is something few expected: no fine-tuning is required.

The earlier recipe was a general pretrained model, adjusted for each task with thousands of labelled examples. Now a prompt with one or two examples—or even a sentence explaining the task—can suffice. Translation, arithmetic, coding, inventing rhyming words, imitating an author: everything happens within the same input, with no change to parameters.

Learning moves from changing weights to reading context.

Stranger still, some abilities seem absent in small models, accuracy near zero, then appear beyond a parameter threshold, like a phase transition. The name is emergence. The argument continues: is it a genuine transition, or a continuous improvement made abrupt by the measuring instrument?

Xunzi writes that piled earth becomes a mountain and wind and rain arise. Earth is dead; the mountain is dead; wind and rain are alive. He means accumulation. Twenty-three centuries later, the sentence describes something he could not have imagined: pile quantity high enough and something else begins.

## XI

GPT-3 can speak. It does not obey.

It is a continuation engine. Ask a question and it may continue with five similar questions, because questions often follow questions in its reading. Request an apology and it may produce a blog about writing apologies. It has command of language, yet does not know what you want.

A 2017 paper by Christiano and colleagues offers a route: ask people to choose between two outputs, train a scoring model on those choices, and use that model to guide the original. Human preferences enter the objective directly.

March 2022: InstructGPT. In annotators' judgements, an aligned 1.3-billion-parameter model beats an unaligned model of 175 billion. Roughly one hundred and thirtieth the size.

This is the section most worth remembering, and among the least discussed.

The annotators are people.

A January 2023 *Time* investigation reports that a contractor employed Kenyan workers to read and classify extremely disturbing text so models could recognise and reject toxic content. Pay ranged from $1.32 to $2 an hour. Some workers reported lasting psychological trauma.

At one end of the production line, screens in a Nairobi office. At the other, the gentle greeting seen by people opening a dialogue box worldwide.

A literary account that passes over this part is not honest.

## XII

30 November 2022.

OpenAI launches a webpage called ChatGPT. Internally it is a modest research preview: existing models with a conversational interface, without even a complete launch plan.

Five days: a million users.

Two months: a hundred million.

By contemporary estimates, the fastest adoption of a consumer software application in history.

Schools panic: some prohibit it overnight, others start teaching it overnight. Newsrooms panic. Programmers watch a day's work appear in ten seconds, laugh, then stop laughing. Late at night a teacher reads a coherent, carefully worded essay and stops at the third paragraph, unsure whom to grade.

14 March 2023: GPT-4. That month a Microsoft research team chooses a troublesome title: *Sparks of Artificial General Intelligence*.

In May Geoffrey Hinton leaves Google to speak freely about risk. He is among those who brought backpropagation into the world. In November OpenAI's board removes and restores its CEO within five days, a drama without a script. In May 2024 Ilya Sutskever leaves the organisation he helped create.

Calmer people will write about these events later. They will have material we cannot yet see.

## XIII

Return to the formula:

$$
L(\mathcal{U})=\sum_i\log P\left(u_i\mid u_{i-k},\ldots,u_{i-1};\Theta\right)
$$

The proposition remains unproved.

We know the task: predict the next word. We do not know whether predicting the next word is understanding.

One side says prediction is compression, compression is understanding. A system that perfectly predicts the world must contain a model of it; otherwise it could not do so. The other says it is a stochastic parrot, rearranging immense corpora by statistical rules, without intention or reference. When it says “pain,” no suffering person stands behind the words.

In 2021 Bender and colleagues give us “stochastic parrots.” It is cited, rebutted, cited again.

Zhuangzi says words exist to convey meaning; once meaning is grasped, words may be forgotten.

Something has now learnt language to its limits. We do not know whether it has grasped meaning.

Nor are we entirely sure how we grasp it ourselves.

The traditional ending of literary reportage is spring. Xu Chi finishes writing about Chen Jingrun with the spring of 1978, applause in an auditorium, a climber looking back over a sea of clouds. I have no applause to describe. The story is unfinished. Writer and reader are both inside it; neither stands on shore. Some call this dawn, others dusk. The two lights resemble each other. We must go further to tell them apart.

A hundred and ten years ago, a fifty-six-year-old mathematician counted vowels in Pushkin's poetry in St Petersburg. Twenty thousand. He probably thought he was counting letters.

A hundred and ten years later we still do the same thing, on a larger scale and faster. Almost everything humanity has written is read and compressed into hundreds of billions of numbers. The numbers begin answering us.

The problem is simple as ever: given everything before, find what comes next.

This essay has one word left.

What is it? Predict it.

---

**Selected primary sources**

- [Improving Language Understanding by Generative Pre-Training](https://cdn.openai.com/research-covers/language-unsupervised/language_understanding_paper.pdf), 2018.
- [Unsupervised sentiment neuron](https://openai.com/index/unsupervised-sentiment-neuron/), 2017.
- [Attention Is All You Need](https://arxiv.org/abs/1706.03762), 2017.
- [Scaling Laws for Neural Language Models](https://arxiv.org/abs/2001.08361), 2020.
- [Language Models are Few-Shot Learners](https://arxiv.org/abs/2005.14165), 2020.
