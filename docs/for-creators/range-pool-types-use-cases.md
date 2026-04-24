# Range pool types: use cases

Puzzle Ranges supports different liquidity placement models. Below are three examples of pool types tailored for specific strategies.

## Use case #1 — Single range

<figure><img src="/docs/assets/for-creators/IMG_3892.gif" alt=""><figcaption></figcaption></figure>

#### **Tokens:**

WAVES/USDTu: 0.5 – 5\
VV-XTN/XTN: 0.1 – 1

**Scenario:**

One asset within a range. This is used for one-sided liquidity — for example, if you only want to sell or buy a token once it reaches a specific price.&#x20;

{% hint style="success" %}
Capital allocation is highly concentrated.
{% endhint %}

## Use case #2 — Multiple ranges

<figure><img src="/docs/assets/for-creators/IMG_3891.gif" alt=""><figcaption></figcaption></figure>

Multiple range liquidity placement allows for more flexible management by distributing liquidity across several price ranges. This approach is beneficial in scenarios where market conditions fluctuate within a broader spectrum.

#### Advantages:

* **Flexibility:** Adapts easily to volatile market conditions.
* **Risk Management:** Mitigates risk by spreading investment across multiple ranges.

#### Tokens:

* ETH/BTC: 0.01 – 0.1
* LINK/DAI: 0.5 – 5

{% hint style="success" %}
Ideal for users seeking conservative strategies.
{% endhint %}

## Use Case #3 — Mega Range

<figure><img src="/docs/assets/for-creators/IMG_3890.gif" alt=""><figcaption></figcaption></figure>

**Tokens:** WAVES, BTC, ETH, USDTu

**Ranges:** WAVES 0.5–5, BTC 30k–350k, ETH 900–7000

**Scenario:**

Up to 10 tokens in one pool. Multi-asset liquidity with exposure to various price zones and trading pairs.

{% hint style="success" %}
Perfect for long-term liquidity placement with income from cross-token swaps within the pool.
{% endhint %}

<br>


---

# Agent Instructions: Querying This Documentation

If you need additional information that is not directly available in this page, you can query the documentation dynamically by asking a question.

Perform an HTTP GET request on the current page URL with the `ask` query parameter:

```
GET https://app.puzzleswap.org/docs/for-creators/range-pool-types-use-cases.md?ask=<question>
```

The question should be specific, self-contained, and written in natural language.
The response will contain a direct answer to the question and relevant excerpts and sources from the documentation.

Use this mechanism when the answer is not explicitly present in the current page, you need clarification or additional context, or you want to retrieve related documentation sections.
