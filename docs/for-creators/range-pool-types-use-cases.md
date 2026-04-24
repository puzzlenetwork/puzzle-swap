# Range pool types: use cases

Puzzle Ranges supports different liquidity placement models. Below are three examples of pool types tailored for specific strategies.

## Use case #1 — Single range

<figure><img src="https://1061290567-files.gitbook.io/~/files/v0/b/gitbook-x-prod.appspot.com/o/spaces%2FCuzV77ftSwjxobxizYi0%2Fuploads%2FQOhS7Ww0HMr7jvyQ4WRD%2F1.gif?alt=media&#x26;token=22f2ebe8-c561-4eee-b30c-f602ec5e89f5" alt=""><figcaption></figcaption></figure>

<figure><img src="https://github.com/user-attachments/assets/c1bde694-691e-4166-9323-23f6f8cf5f26" alt=""><figcaption></figcaption></figure>

#### **Tokens:**

WAVES/USDTu: 0.5 – 5\
VV-XTN/XTN: 0.1 – 1

**Scenario:**

One asset within a range. This is used for one-sided liquidity — for example, if you only want to sell or buy a token once it reaches a specific price.&#x20;

{% hint style="success" %}
Capital allocation is highly concentrated.
{% endhint %}

## Use case #2 — Multiple ranges

<figure><img src="https://github.com/user-attachments/assets/3baf6894-01f7-487d-94c3-6bd9246d78ff" alt=""><figcaption></figcaption></figure>

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

<figure><img src="https://github.com/user-attachments/assets/270b9b8e-11a7-4627-b539-eb1924d376f3" alt=""><figcaption></figcaption></figure>

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
