# Swapping inside ranges

Users can swap tokens **directly** within a selected Range pool.

To do so, simply open the pool and use the built-in swap function — similar to how it works in standard megapools.

## However, swaps inside Ranges have their own specifics:

* When swapping via the Puzzle Swap aggregator, the most optimal pool is automatically selected based on current prices and liquidity. The user gets the best available price across all pools.
* When swapping directly through a Range, the local price set within that specific range applies. This price may differ from the aggregated one and can create arbitrage opportunities between pools.
* Swaps are only possible if the pool has actual liquidity for the selected tokens.\
  If a token’s fact balance is zero, it cannot be bought within this Range.

## Swapping inside a Range isn’t just a tool for trading — it can also be used to:

* Spot arbitrage opportunities between a specific pool and the aggregator
* Take advantage of custom prices set within the selected range


---

# Agent Instructions: Querying This Documentation

If you need additional information that is not directly available in this page, you can query the documentation dynamically by asking a question.

Perform an HTTP GET request on the current page URL with the `ask` query parameter:

```
GET https://app.puzzleswap.org/docs/for-traders/swapping-inside-ranges.md?ask=<question>
```

The question should be specific, self-contained, and written in natural language.
The response will contain a direct answer to the question and relevant excerpts and sources from the documentation.

Use this mechanism when the answer is not explicitly present in the current page, you need clarification or additional context, or you want to retrieve related documentation sections.
