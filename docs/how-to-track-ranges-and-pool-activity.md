# How to track ranges and pool activity

Puzzle Ranges provides a clear interface for monitoring pool status, evaluating structure and efficiency, and checking the status of each token within its range. Here’s how it works.

<figure><img src="/docs/assets/common/track-ranges-1.png" alt=""><figcaption></figcaption></figure>

## Range composition

Each pool displays all tokens included in the range. They are shown in a row, and for each token you can see:

* **The minimum and maximum prices** set during creation
* **The current price** used for swaps (relative to the base token)

The base token is always listed first — it has no price range. All other prices are calculated relative to it.

## If a token’s current price moves outside its defined range (e.g. ETH in the image above):

* The range is highlighted in red
* Swaps with that token are disabled
* Liquidity becomes inactive
* LPs stop receiving fees for that token

{% hint style="info" %}
💡 The token stays in the pool but won’t participate in trading until its price returns to the set range.
{% endhint %}

## Liquidity diagram (spider chart)

Each range is visualized using **a radial (spider) chart**, where:

* Each axis represents **the liquidity concentration** of a token in the pool
* The closer the polygon is to the center, the more concentrated the liquidity (i.e., lower fact/virtual ratio)

This helps quickly assess:

* Where capital is concentrated
* How balanced the pool is

## Yield statistics

Above each pool, key indicators are shown:

* **Fact / virtual liquidity** — the ratio of actual to virtual liquidity (e.g. $1,000 / $1,000,000)
* **Earned by LP** — total rewards earned by LPs over a specific period

Filters available:

* **Only active ranges** — shows only pools with currently active liquidity
* **Stats all time** — lets you view yield over different timeframes, e.g. during peak trading periods

## Facts about ranges

* Users can define any price range. If the range is set from 0 to ∞, the liquidity behaves like in a classic AMM — less concentrated and with lower fee income.
* A range can include between 2 and 10 tokens. Adjusting the price range of one token automatically updates the others based on a shared base logic.
* If the range is above the current price, the liquidity will only be used when the price rises — to sell the token.
* If the range is below the current price, the liquidity will activate when the price drops — to buy the token.


---

# Agent Instructions: Querying This Documentation

If you need additional information that is not directly available in this page, you can query the documentation dynamically by asking a question.

Perform an HTTP GET request on the current page URL with the `ask` query parameter:

```
GET https://app.puzzleswap.org/docs/how-to-track-ranges-and-pool-activity.md?ask=<question>
```

The question should be specific, self-contained, and written in natural language.
The response will contain a direct answer to the question and relevant excerpts and sources from the documentation.

Use this mechanism when the answer is not explicitly present in the current page, you need clarification or additional context, or you want to retrieve related documentation sections.
