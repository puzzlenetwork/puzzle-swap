# FAQ

### 1️⃣ What’s the difference between Puzzle Ranges and regular mega pools?

Mega pools distribute liquidity evenly across the entire price range. Puzzle Ranges let you concentrate liquidity within a specific range — reducing slippage and increasing returns with less capital.

They also feature auto-staking of assets, efficient architecture, and protective parameters like Max Sell-Off and Shut Down.

### 2️⃣ What happens if a token goes out of range?

If a token’s price moves beyond its defined range (min or max), its liquidity becomes inactive.

* If the price goes above max, the token can’t be sold, but can still be bought using other assets in the pool (if available).
* If the price drops below min, the token can’t be bought, but can be sold into other assets (if liquidity remains).

In both cases, the token becomes one-sided, and LPs stop receiving fees from it until the price returns to the range.

### 3️⃣ Where do LP rewards come from?

LPs earn from:

* Swap fees within the active price range
* Staking yield from certain tokens in the pool (e.g. WAVES, PUZZLE, ROME, LP tokens)
* Optionally, external rewards from token teams with assets in the range

Everything is distributed automatically, based on your share of fact liquidity.

### 4️⃣ When do I earn fees?

You earn fees only if your liquidity is active — meaning the price is within the range.\
If the range is inactive, no trades happen and no fees are generated.

### 5️⃣ How does Puzzle Ranges benefit the PUZZLE token?

Each swap fee is split:

* 50% goes to LPs
* 50% goes to PUZZLE stakers

The more volume flows through Puzzle Ranges, the higher the rewards for PUZZLE stakers.

### 6️⃣ What if one of the tokens turns out to be a scam?

Puzzle Ranges has two layers of protection:

* Max Sell-Off limits how quickly a token’s balance can increase in the pool
* Shut Down allows the Puzzle team to freeze a problematic token

Still, risks remain. Every token in the range affects both performance and safety — so choose assets wisely when creating your Range.

### 7️⃣ Can I change range parameters after creation?

No. Once created, a range is fixed.\
If you want to change it, just create a new Range — it’s free.

### 8️⃣ **What is the cost of creating a range?**

Creating a range itself is free, but you need to pay for smart contract deployment and transaction commissions. In total, range creation requires about 0.115 WAVES.

### 9️⃣ **Will Puzzle Megapools be converted to ranges?**

No, both pools and ranges will continue to coexist.

### 🔟 **I found a token starting with “PR” What is it?**

It’s an LP token of your range, similar to PZ tokens in Megapools.

### 1️⃣1️⃣ **What are the costs involved in deploying a range contract?**

Deployment requires two stages:\
\- Deployment transaction – needs \~0.11 WAVES.\
\- Initialization (first liquidity) – requires tokens + \~0.005 WAVES.\
In total: \~0.115 WAVES.

<br>


---

# Agent Instructions: Querying This Documentation

If you need additional information that is not directly available in this page, you can query the documentation dynamically by asking a question.

Perform an HTTP GET request on the current page URL with the `ask` query parameter:

```
GET https://app.puzzleswap.org/docs/for-everyone/faq.md?ask=<question>
```

The question should be specific, self-contained, and written in natural language.
The response will contain a direct answer to the question and relevant excerpts and sources from the documentation.

Use this mechanism when the answer is not explicitly present in the current page, you need clarification or additional context, or you want to retrieve related documentation sections.
