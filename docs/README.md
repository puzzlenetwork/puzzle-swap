# Ranges: concentrated liquidity in Puzzle Network

**Ranges** are a concentrated liquidity model in Puzzle.Network, designed to maximize capital efficiency.

Unlike traditional AMM models, where liquidity is distributed evenly across the entire price curve, Ranges allow liquidity providers **to specify a custom price range** where their liquidity will remain active.

**This approach:**

* Increases liquidity density in the active trading zone
* Reduces slippage
* Allows earning more with less capital

Unlike Uniswap v3, each pool supports **up to 10 tokens simultaneously**, and all possible pairs between them are available for swapping. This turns every pool into a multi-asset liquidity hub, where LPs earn fees from every trade direction within the selected range.

Puzzle Ranges combine fine-tuned liquidity control with a flexible pool architecture, giving professional DeFi participants a tool for managing market depth, risk, and yield.


---

# Agent Instructions: Querying This Documentation

If you need additional information that is not directly available in this page, you can query the documentation dynamically by asking a question.

Perform an HTTP GET request on the current page URL with the `ask` query parameter:

```
GET https://puzzle-ranges.gitbook.io/puzzle-ranges-docs/ranges-concentrated-liquidity-in-puzzle-network.md?ask=<question>
```

The question should be specific, self-contained, and written in natural language.
The response will contain a direct answer to the question and relevant excerpts and sources from the documentation.

Use this mechanism when the answer is not explicitly present in the current page, you need clarification or additional context, or you want to retrieve related documentation sections.
