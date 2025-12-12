import { TOKENS_BY_ASSET_ID } from "@src/constants";
import nodeService from "./nodeService";
import { ITransaction } from "@src/utils/types";
import BN from "@src/utils/BN";

export type TransactionType = "swap" | "deposit" | "withdraw" | "claim" | "stake" | "unstake" | "unknown";

export interface ParsedTransaction {
  id: string;
  type: TransactionType;
  timestamp: number;
  status: "success" | "failed";
  fromAssetId?: string;
  fromAmount?: BN;
  fromSymbol?: string;
  toAssetId?: string;
  toAmount?: BN;
  toSymbol?: string;
  poolAddress?: string;
  poolName?: string;
  amount?: BN;
  assetId?: string;
  symbol?: string;
}

const SWAP_FUNCTIONS = ["swap", "puzzleSwap", "swapWithReferral", "routeSwap"];
const POOL_DEPOSIT_FUNCTIONS = ["generateIndexAndStake", "generateIndex", "generateIndexWithOneTokenAndStake", "putOneTkn", "putOneTknV2"];
const POOL_WITHDRAW_FUNCTIONS = ["unstakeAndRedeemIndex", "redeemIndex", "getOneTkn", "getOneTknV2"];
const CLAIM_FUNCTIONS = ["claimIndexRewards", "claim", "claimReward", "claimAll"];
const STAKE_FUNCTIONS = ["stake", "stakeIndex", "stakeNFT"];
const UNSTAKE_FUNCTIONS = ["unstake", "unstakeIndex", "unstakeNFT"];

const getAssetSymbol = (assetId: string | null): string => {
  if (!assetId || assetId === "WAVES") return "WAVES";
  return TOKENS_BY_ASSET_ID[assetId]?.symbol ?? assetId.slice(0, 6) + "...";
};

const getAssetDecimals = (assetId: string | null): number => {
  if (!assetId || assetId === "WAVES") return 8;
  return TOKENS_BY_ASSET_ID[assetId]?.decimals ?? 8;
};

const parseSwapTransaction = (tx: ITransaction): ParsedTransaction | null => {
  try {
    const payment = tx.payment?.[0];
    if (!payment) return null;

    const fromAssetId = payment.assetId ?? "WAVES";
    const fromAmount = new BN(payment.amount);

    const transfers = tx.stateChanges?.transfers ?? [];
    const receivedTransfer = transfers.find((t) => t.address === tx.sender);

    if (!receivedTransfer) return null;

    const toAssetId = receivedTransfer.asset ?? "WAVES";
    const toAmount = new BN(receivedTransfer.amount);

    return {
      id: tx.id,
      type: "swap",
      timestamp: tx.timestamp,
      status: tx.applicationStatus === "succeeded" ? "success" : "failed",
      fromAssetId,
      fromAmount: BN.formatUnits(fromAmount, getAssetDecimals(fromAssetId)),
      fromSymbol: getAssetSymbol(fromAssetId),
      toAssetId,
      toAmount: BN.formatUnits(toAmount, getAssetDecimals(toAssetId)),
      toSymbol: getAssetSymbol(toAssetId)
    };
  } catch {
    return null;
  }
};

const parsePoolDepositTransaction = (tx: ITransaction): ParsedTransaction | null => {
  try {
    const payment = tx.payment?.[0];
    if (!payment) return null;

    const assetId = payment.assetId ?? "WAVES";
    const amount = new BN(payment.amount);

    return {
      id: tx.id,
      type: "deposit",
      timestamp: tx.timestamp,
      status: tx.applicationStatus === "succeeded" ? "success" : "failed",
      poolAddress: tx.dApp,
      amount: BN.formatUnits(amount, getAssetDecimals(assetId)),
      assetId,
      symbol: getAssetSymbol(assetId)
    };
  } catch {
    return null;
  }
};

const parsePoolWithdrawTransaction = (tx: ITransaction): ParsedTransaction | null => {
  try {
    const transfers = tx.stateChanges?.transfers ?? [];
    const receivedTransfer = transfers.find((t) => t.address === tx.sender);

    if (!receivedTransfer) return null;

    const assetId = receivedTransfer.asset ?? "WAVES";
    const amount = new BN(receivedTransfer.amount);

    return {
      id: tx.id,
      type: "withdraw",
      timestamp: tx.timestamp,
      status: tx.applicationStatus === "succeeded" ? "success" : "failed",
      poolAddress: tx.dApp,
      amount: BN.formatUnits(amount, getAssetDecimals(assetId)),
      assetId,
      symbol: getAssetSymbol(assetId)
    };
  } catch {
    return null;
  }
};

const parseClaimTransaction = (tx: ITransaction): ParsedTransaction | null => {
  try {
    const transfers = tx.stateChanges?.transfers ?? [];
    const receivedTransfer = transfers.find((t) => t.address === tx.sender);

    const assetId = receivedTransfer?.asset ?? "WAVES";
    const amount = receivedTransfer ? new BN(receivedTransfer.amount) : BN.ZERO;

    return {
      id: tx.id,
      type: "claim",
      timestamp: tx.timestamp,
      status: tx.applicationStatus === "succeeded" ? "success" : "failed",
      poolAddress: tx.dApp,
      amount: BN.formatUnits(amount, getAssetDecimals(assetId)),
      assetId,
      symbol: getAssetSymbol(assetId)
    };
  } catch {
    return null;
  }
};

const parseTransaction = (tx: ITransaction): ParsedTransaction | null => {
  if (tx.type !== 16) return null;

  const functionName = tx.call?.function;
  if (!functionName) return null;

  if (SWAP_FUNCTIONS.includes(functionName)) {
    return parseSwapTransaction(tx);
  }

  if (POOL_DEPOSIT_FUNCTIONS.includes(functionName)) {
    return parsePoolDepositTransaction(tx);
  }

  if (POOL_WITHDRAW_FUNCTIONS.includes(functionName)) {
    return parsePoolWithdrawTransaction(tx);
  }

  if (CLAIM_FUNCTIONS.includes(functionName)) {
    return parseClaimTransaction(tx);
  }

  if (STAKE_FUNCTIONS.includes(functionName)) {
    return {
      id: tx.id,
      type: "stake",
      timestamp: tx.timestamp,
      status: tx.applicationStatus === "succeeded" ? "success" : "failed",
      poolAddress: tx.dApp
    };
  }

  if (UNSTAKE_FUNCTIONS.includes(functionName)) {
    return {
      id: tx.id,
      type: "unstake",
      timestamp: tx.timestamp,
      status: tx.applicationStatus === "succeeded" ? "success" : "failed",
      poolAddress: tx.dApp
    };
  }

  return null;
};

const fetchTransactionsWithDetails = async (address: string, limit: number): Promise<ITransaction[]> => {
  const transactions = await nodeService.transactions(address, limit);
  if (!transactions) return [];

  const invokeTransactions = transactions.filter((tx) => tx.type === 16);
  if (invokeTransactions.length === 0) return transactions;

  const detailedTransactions = await Promise.all(
    invokeTransactions.map((tx) => nodeService.transactionInfo(tx.id))
  );

  const detailedMap = new Map<string, ITransaction>();
  detailedTransactions.forEach((tx) => {
    if (tx) detailedMap.set(tx.id, tx);
  });

  return transactions.map((tx) => detailedMap.get(tx.id) ?? tx);
};

const transactionHistoryService = {
  getSwapHistory: async (address: string, targetCount = 30): Promise<ParsedTransaction[]> => {
    const limit = Math.min(targetCount * 10, 300);
    const transactions = await fetchTransactionsWithDetails(address, limit);

    return transactions
      .filter((tx) => tx.sender === address)
      .map(parseTransaction)
      .filter((tx): tx is ParsedTransaction => tx !== null && tx.type === "swap")
      .slice(0, targetCount);
  },

  getPoolHistory: async (address: string, targetCount = 30): Promise<ParsedTransaction[]> => {
    const limit = Math.min(targetCount * 5, 200);
    const transactions = await fetchTransactionsWithDetails(address, limit);

    return transactions
      .filter((tx) => tx.sender === address)
      .map(parseTransaction)
      .filter(
        (tx): tx is ParsedTransaction =>
          tx !== null && ["deposit", "withdraw", "claim", "stake", "unstake"].includes(tx.type)
      )
      .slice(0, targetCount);
  },

  getAllHistory: async (address: string, targetCount = 50): Promise<ParsedTransaction[]> => {
    const limit = Math.min(targetCount * 3, 200);
    const transactions = await fetchTransactionsWithDetails(address, limit);

    return transactions
      .filter((tx) => tx.sender === address)
      .map(parseTransaction)
      .filter((tx): tx is ParsedTransaction => tx !== null)
      .slice(0, targetCount);
  }
};

export default transactionHistoryService;
