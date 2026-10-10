---
title: "The Jevons Paradox"
description: "Why greater efficiency can increase resource consumption: demand elasticity, rebound mechanisms, and the limits of efficiency policy."
date: 2026-10-06 00:30:00 +0800
date_label: "2026.10.06"
categories: [Economics]
tags: [Jevons paradox, energy, rebound effect]
lang: en
permalink: /en/writing/2026/10/jevons-paradox/
translation_url: /writing/2026/10/jevons-paradox/
toc: true
math: true
---

## I. The problem

The Jevons paradox describes a phenomenon in which **increased efficiency in using a resource leads to increased total consumption of that resource**.

The proposition comes from William Stanley Jevons's *The Coal Question* (1865). Britain feared that exhausting its coal reserves would end its industrial advantage. The prevailing view was that more efficient steam engines would prolong the reserves' useful life. Jevons argued that this reversed the causal story. From Newcomen's engine to Watt's separate condenser, coal consumption per unit of power fell substantially, yet Britain's total consumption rose, and accelerated.

His explanation: improved efficiency reduced the effective cost of steam power, making it profitable in previously uneconomic settings—draining deep mines, railways, ocean shipping, and industrial processes formerly powered by water or animals. The technology's scope expanded, new uses emerged, and demand grew faster than fuel was saved per unit of service.

Jevons was discussing **the total**, not efficiency per unit. Unit coal consumption did fall. The dispute concerns the direction of the total.

## II. A formal statement

Modern literature treats this within the framework of the rebound effect. The Jevons paradox is an extreme case.

Let $S$ denote energy-service output—useful lumen-hours of lighting, tonne-kilometres of transport, or hours maintaining a room at 20°C. Let $E$ be energy input. Efficiency is:

$$
\varepsilon=\frac{S}{E}
$$

Thus $E=S/\varepsilon$. Taking logarithms and differentiating with respect to $\ln\varepsilon$:

$$
\frac{d\ln E}{d\ln\varepsilon}=\frac{d\ln S}{d\ln\varepsilon}-1
$$

Engineering intuition implicitly assumes $d\ln S/d\ln\varepsilon=0$: service demand is fixed, so a 1% efficiency gain saves 1% of energy. That assumption is the problem.

The effective service price is $p_S=p_E/\varepsilon$. With an exogenously given energy price $p_E$, greater efficiency is equivalent to an equal proportional fall in service price. Write the own-price elasticity of service demand as:

$$
\eta=\frac{d\ln S}{d\ln p_S}<0
$$

Substitution gives:

$$
\frac{d\ln E}{d\ln\varepsilon}=-\eta-1
$$

Define rebound $R$ as the fraction of expected savings taken back by demand expansion. Locally:

$$
R=1+\frac{d\ln E}{d\ln\varepsilon}=-\eta=|\eta|
$$

The classification is complete:

| Demand elasticity $\eta$ | Rebound $R$ | Outcome |
| --- | --- | --- |
| $\eta=0$ | $0$ | No rebound; all expected savings realised |
| $-1<\eta<0$ | $0<R<1$ | Partial rebound; savings remain, but below expectation |
| $\eta=-1$ | $R=1$ | Full offset; total consumption unchanged |
| $\eta<-1$ | $R>1$ | **Backfire: the Jevons paradox** |

Under these partial-equilibrium assumptions—exogenous energy prices and unchanged other costs—the paradox is equivalent to one condition: **the absolute own-price elasticity of energy-service demand exceeds one**.

A technical qualification matters. Sorrell and Dimitropoulos (2008, *Ecological Economics*) distinguish efficiency elasticity from price elasticity. They need not coincide. Greater efficiency often entails higher equipment capital costs, and consumers may react differently to an efficiency label than to cheaper electricity. Price elasticity as a proxy tends to overestimate rebound.

## III. Transmission mechanisms

The derivation compresses mechanisms that need to be separated.

**Direct rebound** occurs within the same energy service and contains two neoclassical effects:

- Substitution: the service becomes cheaper relative to other goods. A more efficient air conditioner runs longer or at a lower temperature.
- Income: lower bills release purchasing power, some of which returns to the same service.

**Indirect rebound** occurs when savings fund other goods and services whose production and consumption also require energy. Electricity savings spent on a flight carry emissions. Embodied energy also matters: manufacturing more efficient equipment may itself consume more energy.

**Economy-wide rebound** is the level Jevons emphasised, and the hardest to quantify. It has several channels:

1. **General-equilibrium energy-price feedback.** Efficiency lowers energy demand. If supply is not perfectly elastic, the market-clearing price falls, stimulating energy use throughout the economy. For globally traded fossil fuels this is especially important and related to the “green paradox.”
2. **Output and factor substitution.** For firms, greater energy efficiency is a cost reduction and a positive technological shock. They expand output and may substitute energy for capital or labour.
3. **Growth.** Sustained energy-efficiency gains contribute to total factor productivity, raise returns to capital, accelerate accumulation, and expand the economy. Saunders (1992, *The Energy Journal*) demonstrated backfire in a neoclassical growth model with Cobb–Douglas production and perfectly elastic energy supply. In more general CES settings, the outcome depends on substitution elasticities and energy's factor share (Saunders, 2008).

Khazzoom (1980) approached the issue through appliances' direct rebound; Brookes (1990) through macroeconomic growth. Saunders joined their arguments as the **Khazzoom–Brookes hypothesis**: at the economy-wide level, improved energy efficiency increases rather than reduces total energy use.

## IV. Empirical evidence

This is where disagreement is greatest. Broadly, evidence for direct rebound is comparatively firm and its magnitude moderate; economy-wide evidence is less secure and estimates vary widely.

**Direct rebound.** Reviews by Greening, Greene, and Difiglio (2000, *Energy Policy*) and Sorrell (2007, UKERC) report estimates roughly around 10–30% for household heating and cooling, 10–30% for private motoring, and 0–20% for appliances. Small and Van Dender (2007, *The Energy Journal*) find that transport rebound falls systematically as income rises. At full-sample average conditions their short- and long-run estimates are 4.5% and 22.2%. The intuition is sensible: once a service approaches saturation, making it cheaper does not greatly increase consumption. Lighting and room temperatures in developed countries exemplify demand close to saturation.

**Long-run historical evidence.** Lighting is the classic case. Fouquet and Pearson (2006, 2012) reconstruct British lighting-service prices and consumption from 1300 to 2000. The cost per lumen fell thousands of times while lighting consumption per person grew still more. For much of the period from industrialisation to the mid-twentieth century, absolute demand elasticity exceeded one: a Jevons-type outcome. They also find elasticity falling sharply towards zero in the late twentieth century as lighting demand saturates. Tsao and colleagues (2010, *Journal of Physics D*) discuss how LED adoption could expand lighting demand. The eventual direction of energy use depends on saturation and actual rebound; unit-efficiency improvement alone cannot determine it.

**Economy-wide evidence.** Gillingham, Rapson, and Wagner (2016, *Review of Environmental Economics and Policy*) suggest a plausible upper bound for total rebound of approximately 60%, with most studies indicating a smaller effect. Backfire is possible but insufficiently supported to serve as a baseline policy assumption. Brockway and colleagues (2021, *Renewable and Sustainable Energy Reviews*) review 33 studies and conclude that economy-wide rebound may erode more than half of expected savings. They do not rule out backfire and argue that mitigation scenarios, including those used by the IPCC, may overestimate efficiency's contribution.

These reviews are useful entry points into the disagreement. Economy-wide rebound requires a counterfactual world without the efficiency gain, constructed through computable general-equilibrium models or growth accounting. Results depend strongly on production functions, substitution elasticities, and energy-supply elasticities. This makes testing and comparison difficult and requires explicit assumptions and sensitivity analysis.

## V. When is backfire more likely?

Several conditions raise its likelihood:

- **Unsaturated markets**, with many uses suppressed by high costs. Nineteenth-century coal and electricity in developing economies fit better than household heating in affluent countries.
- **A large energy share of total activity costs.** The larger the share, the greater the relative-price shock from efficiency. Aluminium smelting, ammonia production, and data-centre compute are examples. Electricity is a minor office cost, so rebound through this channel is small.
- **General-purpose technologies.** Steam, electricity, combustion engines, and computing diffuse efficiency gains throughout the economy and create new applications, strengthening output effects. Koomey's law alongside the growth of computation offers an unfolding example.
- **A relatively flat energy-supply curve**, allowing expansion without a strong price increase to restrain it.
- **Long time horizons.** Direct rebound can occur within months; output and growth effects take decades. Short-run studies can therefore underestimate total rebound.

## VI. Common misreadings

**First: equating the Jevons paradox with rebound.** Rebound is an ordinary response to lower effective prices. The paradox is the special case $R>1$. Most empirical studies support $0<R<1$. Treating evidence of rebound as evidence of backfire is an error about magnitude.

**Second: concluding that efficiency policy is useless.** This conflates two objectives. Even with backfire, efficiency may increase welfare: people obtain more lighting, travel, and industrial output at lower cost. Consumption rises because efficiency creates value. Judging it only by energy use mistakes a means for an end.

The appropriate policy conclusion is different: **efficiency policy cannot carry the whole burden of emissions reduction, because unit-efficiency gains do not by themselves guarantee lower total energy use or emissions**. Lower effective prices sit at the centre of rebound channels. Carbon pricing or emissions trading can raise the cost of emissions as efficiency releases demand. Cap-and-trade is especially clear in principle: a binding aggregate cap allows rebound to affect allowance prices rather than total covered emissions. Efficiency standards and carbon pricing are complements, not substitutes.

**Third: using the paradox as an argument for technological optimism or growth ideology.** Opposing camps invoke it. One argues that technology will solve the problem and regulation is unnecessary; a degrowth camp argues that technology can never decouple growth from emissions, requiring direct limits on economic scale. Both claims exceed the proposition's empirical support. The paradox concerns demand elasticity and general-equilibrium feedback. It does not automatically entail either normative position.

## VII. A more general formulation

At its core, the paradox challenges the assumption that other things remain equal. An engineering calculation fixes usage, improves equipment, and computes savings. Economics reminds us that usage depends on price, precisely what has changed. An intervention that changes constraints cannot be evaluated in a framework that assumes those constraints unchanged.

The structure recurs beyond energy. Widen roads to relieve congestion and new journeys appear: Duranton and Turner (2011, *American Economic Review*) estimate an induced-demand elasticity close to one in their “fundamental law of road congestion.” Expand storage to organise files and more files accumulate. Effective antibiotics lower prescribing thresholds and contribute to resistance. The shared logic is that **efficiency lowers prices, and demand absorbs the reduction**.

How much it absorbs depends on elasticity. Elasticity depends on whether demand is already saturated.

---

## References

- Small & Van Dender (2007), [Fuel Efficiency and Motor Vehicle Travel: The Declining Rebound Effect](https://its.uci.edu/research_products/published-journal-article-fuel-efficiency-and-motor-vehicle-travel-the-declining-rebound-effect/).
- Gillingham, Rapson & Wagner (2016), [The Rebound Effect and Energy Efficiency Policy](https://gwagner.com/rebound).
- Brockway et al. (2021), [Energy efficiency and economy-wide rebound effects](https://eprints.whiterose.ac.uk/id/eprint/171952/).
