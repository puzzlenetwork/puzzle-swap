# Liquidity deposit and withdrawal

Puzzle Ranges supports **two ways to add liquidity:** with a single token or multiple tokens. Both methods give LPs flexibility depending on available assets and preferences for speed or efficiency.

Liquidity is always withdrawn in multiple tokens, according to their weights in the pool and current prices.

## Single-token deposit

Allows you to provide liquidity using **just one** of the tokens in the range. The other tokens are **automatically purchased** within the pool using part of your deposit.

* Tokens are bought in proportion to their weights, based on current prices
* Fast and easy — no need to swap manually beforehand
* May be less price-efficient due to internal swaps

### How it works:

* Select the "Single token" method
* Choose the asset and amount
* The system splits the deposit: one part stays as is, the other is swapped into the missing tokens based on pool weights and current prices

<figure><img src="/docs/assets/common/liquidity-1.png" alt=""><figcaption></figcaption></figure>

{% hint style="info" %}
💡 If the actual balance of a token is depleted, it cannot be withdrawn.
{% endhint %}

## Multi-token deposit

Lets you deposit all tokens from the range at once, according to their weights.\
This is the most efficient method since no internal swaps are needed.

### How it works:

* Select the "Multiple tokens" method
* Choose the percentage of your portfolio to deposit
* All assets are deposited directly — no swaps occur inside the pool

<figure><img src="/docs/assets/common/liquidity-2.png" alt=""><figcaption></figcaption></figure>

**Withdrawals work the same way:** the user receives all tokens back, in the current pool proportions.

### Here're 3 important things you need to know:

* Once liquidity is added — regardless of the method — the pool immediately starts collecting fees.&#x20;
* LPs begin earning rewards from every swap involving tokens within their active price ranges.
* If a token’s price moves outside the defined range, its liquidity becomes inactive and stops generating fees.

## No lockups

Liquidity can be added or withdrawn at any time. No lockups, no waiting periods, no penalties — full control and flexibility.

<br>


---

# Agent Instructions: Querying This Documentation

If you need additional information that is not directly available in this page, you can query the documentation dynamically by asking a question.

Perform an HTTP GET request on the current page URL with the `ask` query parameter:

```
GET https://app.puzzleswap.org/docs/liquidity-deposit-and-withdrawal.md?ask=<question>
```

The question should be specific, self-contained, and written in natural language.
The response will contain a direct answer to the question and relevant excerpts and sources from the documentation.

Use this mechanism when the answer is not explicitly present in the current page, you need clarification or additional context, or you want to retrieve related documentation sections.
