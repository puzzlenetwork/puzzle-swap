# Core parameters of Puzzle Ranges

## Fact liquidity

Fact liquidity refers to the actual amount of tokens that liquidity providers (LPs) deposit into the pool. These tokens are used for swaps as long as the price remains within the specified range.

## Virtual liquidity

Virtual liquidity is a simulated value that represents a higher token amount than is physically deposited. It is defined during range creation and allows to:

* Reduce price impact
* Increase pool depth
* Attract aggregators and boost swap frequency.

As long as the asset price stays within the selected range, the pool behaves as if it contains more tokens than it actually does.

> **📌 Example:** if the actual liquidity of WAVES is 3,000 and the virtual liquidity is 100,000, all swaps in that range are calculated as if the pool holds 100,000 WAVES.

## Virtual liquidity formula

Virtual liquidity for each token is calculated using the following identity pair:

{% hint style="danger" %}
p\_min = ((B1 — F1) / (B2 \* (B1 / (B1 — F1))<sup>w1/w2</sup>)) \* (w2/w1)

p\_max = (B1 \* (B2 / (B2 — F2))<sup>w2/w1</sup> / (B2 — F2)) \* (w2/w1)
{% endhint %}

### Where:

* B1, B2 — virtual liquidity for tokens 1 and 2 (token 1 is the base, token 2 is the one being ranged)
* F1, F2 — actual liquidity of tokens 1 and 2
* w1, w2 — weight of tokens 1 and 2
* p\_min, p\_max — minimum and maximum price bounds of the range

These formulas are **at the core of Puzzle Ranges** — they bind virtual liquidity, price range, and market depth into a unified mathematical model.

## Token share (weight)

Token share defines the relative weight of each token in the pool.

It functions similarly to megapools: set by the pool creator and determines how liquidity is distributed across tokens.

## Fact/Virt ratio (leverage)

The ratio between actual and virtual liquidity is called the leverage.

> **📌 Example:** With 100,000 ROME virtual liquidity and 3,000 ROME actual liquidity, the ratio is 3%, which equals x33 leverage.

Higher leverage increases capital efficiency but also raises the risk of liquidity depletion during volatile market moves.

## Min/Max price + current price (price range)

Each token’s price range is defined by the LP and determines when liquidity is active:

**↕️ Inside the range** — the token can be both bought and sold\
\&#xNAN;**⬇️ Below min price** — the token cannot be bought, but can be sold for other tokens in the pool\
\&#xNAN;**⬆️ Above max price** — the token cannot be sold, but can be bought.

The range is calculated relative to the **base token** (e.g., USDT). If the pool includes more than two tokens, min/max prices are dynamically recalculated across all pairs, taking current volatility into account.

## Swap fee

Every time a user makes a swap inside your pool — for example, exchanging one token for another — the protocol charges a fee (see Range Parameters > Swap Fee).

The entire fee is charged in the **token being sold**, and then split:

* **50%** goes to PUZZLE stakers (the protocol)
* **50%** is distributed among all LPs with active fact liquidity — in the same token

{% hint style="warning" %}
💡 The more accurate your range and the larger your active liquidity — the more fees you earn.
{% endhint %}

## Max sell-off

The pool creator can set a max sell-off limit for each token — the maximum allowed percentage by which the token’s balance can increase over a fixed period (100 blocks ≈ 100 minutes).

This helps protect the pool from **aggressive buyouts and imbalance**.

> **📌 Example:** if WAVES price drops sharply and Max Sell-Off is set to 30%, other tokens in the pool can be used to buy WAVES — but only up to a 30% increase in WAVES balance over 100 minutes.

A higher threshold means more “trust” in the token’s stability.

## Shut-down token

In emergency cases — like a hack, rapid liquidity drain, or suspicious activity — the Puzzle team can trigger a partial or full shutdown for a specific token.

**There are two types of shutdown:**

* Shutdown for buys — the token cannot be bought, but can be sold
* Shutdown for sells — the token cannot be sold, but can be bought

This feature allows flexible, real-time risk mitigation for LPs.


---

# Agent Instructions: Querying This Documentation

If you need additional information that is not directly available in this page, you can query the documentation dynamically by asking a question.

Perform an HTTP GET request on the current page URL with the `ask` query parameter:

```
GET https://puzzle-ranges.gitbook.io/puzzle-ranges-docs/overview/core-parameters-of-puzzle-ranges.md?ask=<question>
```

The question should be specific, self-contained, and written in natural language.
The response will contain a direct answer to the question and relevant excerpts and sources from the documentation.

Use this mechanism when the answer is not explicitly present in the current page, you need clarification or additional context, or you want to retrieve related documentation sections.
