# How to create a range

Creating your own Range pool is a simple and flexible process where you define the token composition, price ranges, and liquidity parameters.&#x20;

{% embed url="<https://youtu.be/l3qXiAyxxXY>" %}

## Step 1: select tokens and weights

* Click Create Range.
* Choose a Base Token — all token prices in the range will be calculated relative to it (e.g., USDT).
* Add up to 10 tokens to the pool via the Range Composition section.
* Set a leverage each token's defines how much virtual balance a token has compared to its real balance in the pool.

{% hint style="warning" %}
💡 Each token must have a minimum weight of 2% of the total range.
{% endhint %}

## Step 2: set up a title and fee

* Enter a Range Title — up to 13 Latin characters (letters, numbers, “\_” or “-”).
* Select swap fees from 0.1% to 5%

{% hint style="warning" %}
💡 Fee affects how much traders will pay when interacting with your Range. A higher fee can earn you more from volatile markets, but may reduce trading volume.
{% endhint %}

Click Deploy Smart Contract to proceed to final review and pool creation.

## Step 3: add liquidity and launch pool

After setting tokens and ranges, you'll move on to the final stage.

In the **Your Range Information** block, you'll see:

* Range name
* Selected Swap Fee
* List of all tokens and their shares in the pool

In the **Add Liquidity** section:

* Choose what portion of your available balance to deposit (via slider or manual input)

Below, the **Deposit Composition** shows:

* Token share
* Available balance for each token
* Final amount to be locked in the pool

{% hint style="warning" %}
💡 The Summary on the right shows how your liquidity will be allocated across tokens and the maximum value being provided to the pool.
{% endhint %}

Once everything looks good, click **Initiate Range**, sign the transaction — and your pool will go live.

🥳 Congratulations — you're now an LP and start earning from swaps within your defined range!

<br>


---

# Agent Instructions: Querying This Documentation

If you need additional information that is not directly available in this page, you can query the documentation dynamically by asking a question.

Perform an HTTP GET request on the current page URL with the `ask` query parameter:

```
GET https://app.puzzleswap.org/docs/for-creators/how-to-create-a-range.md?ask=<question>
```

The question should be specific, self-contained, and written in natural language.
The response will contain a direct answer to the question and relevant excerpts and sources from the documentation.

Use this mechanism when the answer is not explicitly present in the current page, you need clarification or additional context, or you want to retrieve related documentation sections.
