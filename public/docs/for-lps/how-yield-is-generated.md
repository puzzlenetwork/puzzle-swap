# How yield is generated

Liquidity providers (LPs) in Puzzle Ranges earn from swap fees. This model allows LPs to benefit from trading activity.

## 1. Swap fees

Every time a user makes a swap inside your pool — for example, exchanging one token for another — the protocol charges a fee (see Range Parameters > Swap Fee).&#x20;

**Half of the fee:**

* Is collected in the token being sold
* Is distributed among all LPs proportionally to their active fact liquidity

{% hint style="info" %}
💡 The more accurate your range and the larger your active liquidity — the more fees you earn.
{% endhint %}

## 2. External Rewards

Any user or external team can manually inject **extra rewards** into specific pools — increasing LP returns and boosting liquidity.

These rewards are distributed in addition to swap fees and staking income.

{% hint style="info" %}
💡 This is especially useful for token teams whose assets **are already listed in Ranges** — they can incentivize volume without deploying a separate pool.
{% endhint %}

<br>


---

# Agent Instructions: Querying This Documentation

If you need additional information that is not directly available in this page, you can query the documentation dynamically by asking a question.

Perform an HTTP GET request on the current page URL with the `ask` query parameter:

```
GET https://app.puzzleswap.org/docs/for-lps/how-yield-is-generated.md?ask=<question>
```

The question should be specific, self-contained, and written in natural language.
The response will contain a direct answer to the question and relevant excerpts and sources from the documentation.

Use this mechanism when the answer is not explicitly present in the current page, you need clarification or additional context, or you want to retrieve related documentation sections.
