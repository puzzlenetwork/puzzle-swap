import { TOKENS_BY_ASSET_ID } from "@src/constants";
import nodeService from "./nodeService";
import { ITransaction } from "@src/utils/types";
import BN from "@src/utils/BN";

interface SwapCache {
  address: string;
  lastTxId: string | null;
  lastTimestamp: number;
  transactions: ParsedTransaction[];
}

const CACHE_KEY = "puzzle_swap_history_cache";

const loadCache = (): SwapCache | null => {
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (!cached) return null;
    const parsed = JSON.parse(cached);
    parsed.transactions = parsed.transactions.map((tx: any) => ({
      ...tx,
      fromAmount: tx.fromAmount ? new BN(tx.fromAmount) : undefined,
      toAmount: tx.toAmount ? new BN(tx.toAmount) : undefined,
      amount: tx.amount ? new BN(tx.amount) : undefined
    }));
    return parsed;
  } catch {
    return null;
  }
};

const saveCache = (cache: SwapCache) => {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
  } catch {}
};

let swapCache: SwapCache | null = loadCache();

export type TransactionType = "swap" | "deposit" | "withdraw" | "claim" | "stake" | "unstake" | "unknown";

export interface TokenAmount {
  assetId: string;
  amount: BN;
  symbol: string;
}

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
  tokens?: TokenAmount[];
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
    const payments = tx.payment ?? [];
    if (payments.length === 0) return null;

    const tokens: TokenAmount[] = payments.map((payment) => {
      const assetId = payment.assetId ?? "WAVES";
      const amount = new BN(payment.amount);
      return {
        assetId,
        amount: BN.formatUnits(amount, getAssetDecimals(assetId)),
        symbol: getAssetSymbol(assetId)
      };
    });

    const firstToken = tokens[0];

    return {
      id: tx.id,
      type: "deposit",
      timestamp: tx.timestamp,
      status: tx.applicationStatus === "succeeded" ? "success" : "failed",
      poolAddress: tx.dApp,
      amount: firstToken.amount,
      assetId: firstToken.assetId,
      symbol: firstToken.symbol,
      tokens
    };
  } catch {
    return null;
  }
};

const parsePoolWithdrawTransaction = (tx: ITransaction): ParsedTransaction | null => {
  try {
    const transfers = tx.stateChanges?.transfers ?? [];
    const receivedTransfers = transfers.filter((t) => t.address === tx.sender);

    if (receivedTransfers.length === 0) return null;

    const tokens: TokenAmount[] = receivedTransfers.map((transfer) => {
      const assetId = transfer.asset ?? "WAVES";
      const amount = new BN(transfer.amount);
      return {
        assetId,
        amount: BN.formatUnits(amount, getAssetDecimals(assetId)),
        symbol: getAssetSymbol(assetId)
      };
    });

    const firstToken = tokens[0];

    return {
      id: tx.id,
      type: "withdraw",
      timestamp: tx.timestamp,
      status: tx.applicationStatus === "succeeded" ? "success" : "failed",
      poolAddress: tx.dApp,
      amount: firstToken.amount,
      assetId: firstToken.assetId,
      symbol: firstToken.symbol,
      tokens
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

interface FetchOptions {
  maxTransactions?: number;
  targetCount?: number;
  filterFn?: (tx: ITransaction) => boolean;
}

const fetchTransactionsWithDetails = async (
  address: string,
  options: FetchOptions = {}
): Promise<ITransaction[]> => {
  const { maxTransactions = 300, targetCount, filterFn } = options;
  const batchSize = 100;

  let allTransactions: ITransaction[] = [];
  let after: string | undefined;

  while (allTransactions.length < maxTransactions) {
    const remaining = maxTransactions - allTransactions.length;
    const batch = await nodeService.transactions(address, Math.min(batchSize, remaining), after);
    if (!batch || batch.length === 0) break;

    allTransactions = [...allTransactions, ...batch];
    after = batch[batch.length - 1].id;

    if (targetCount && filterFn) {
      const matchCount = allTransactions.filter(filterFn).length;
      if (matchCount >= targetCount) break;
    }
  }

  const invokeTransactions = allTransactions.filter((tx) => tx.type === 16);
  if (invokeTransactions.length === 0) return allTransactions;

  const detailedTransactions = await Promise.all(
    invokeTransactions.map((tx) => nodeService.transactionInfo(tx.id))
  );

  const detailedMap = new Map<string, ITransaction>();
  detailedTransactions.forEach((tx) => {
    if (tx) detailedMap.set(tx.id, tx);
  });

  return allTransactions.map((tx) => detailedMap.get(tx.id) ?? tx);
};

const isSwapTransaction = (tx: ITransaction): boolean =>
  tx.type === 16 && SWAP_FUNCTIONS.includes(tx.call?.function ?? "");

const isPoolTransaction = (tx: ITransaction): boolean =>
  tx.type === 16 &&
  [...POOL_DEPOSIT_FUNCTIONS, ...POOL_WITHDRAW_FUNCTIONS, ...CLAIM_FUNCTIONS, ...STAKE_FUNCTIONS, ...UNSTAKE_FUNCTIONS].includes(
    tx.call?.function ?? ""
  );

const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

const isWithinLast30Days = (timestamp: number): boolean => {
  const now = Date.now();
  return now - timestamp <= THIRTY_DAYS_MS;
};

const transactionHistoryService = {
  getSwapHistory: async (address: string, targetCount = 30): Promise<ParsedTransaction[]> => {
    const batchSize = 1000;
    const thirtyDaysAgo = Date.now() - THIRTY_DAYS_MS;
    const hasValidCache = swapCache && swapCache.address === address && swapCache.lastTxId;

    let newSwapTransactions: ITransaction[] = [];
    let after: string | undefined;
    let reachedCachedTx = false;

    while (true) {
      const batch = await nodeService.transactions(address, batchSize, after);
      if (!batch || batch.length === 0) break;

      for (const tx of batch) {
        if (hasValidCache && tx.id === swapCache!.lastTxId) {
          reachedCachedTx = true;
          break;
        }

        if (tx.sender === address && isSwapTransaction(tx)) {
          newSwapTransactions.push(tx);
        }
      }

      if (reachedCachedTx) break;

      const oldestTx = batch[batch.length - 1];
      if (oldestTx.timestamp < thirtyDaysAgo) break;

      after = oldestTx.id;
    }

    const detailedNew = await Promise.all(
      newSwapTransactions.map((tx) => nodeService.transactionInfo(tx.id))
    );

    const parsedNew = detailedNew
      .filter((tx): tx is ITransaction => tx !== null)
      .map(parseTransaction)
      .filter((tx): tx is ParsedTransaction => tx !== null && tx.type === "swap");

    let allTransactions: ParsedTransaction[];
    if (hasValidCache && reachedCachedTx) {
      const cachedFiltered = swapCache!.transactions.filter((tx) => isWithinLast30Days(tx.timestamp));
      allTransactions = [...parsedNew, ...cachedFiltered];
    } else {
      allTransactions = parsedNew;
    }

    allTransactions = allTransactions
      .filter((tx) => isWithinLast30Days(tx.timestamp))
      .sort((a, b) => b.timestamp - a.timestamp);

    const firstTx = await nodeService.transactions(address, 1);
    swapCache = {
      address,
      lastTxId: firstTx?.[0]?.id ?? null,
      lastTimestamp: Date.now(),
      transactions: allTransactions
    };
    saveCache(swapCache);

    return allTransactions.slice(0, targetCount);
  },

  clearSwapCache: () => {
    swapCache = null;
    localStorage.removeItem(CACHE_KEY);
  },

  getPoolHistory: async (address: string, targetCount = 30): Promise<ParsedTransaction[]> => {
    const transactions = await fetchTransactionsWithDetails(address, {
      maxTransactions: 300,
      targetCount,
      filterFn: (tx) => tx.sender === address && isPoolTransaction(tx)
    });

    return transactions
      .filter((tx) => tx.sender === address && isWithinLast30Days(tx.timestamp))
      .map(parseTransaction)
      .filter(
        (tx): tx is ParsedTransaction =>
          tx !== null && ["deposit", "withdraw", "claim", "stake", "unstake"].includes(tx.type)
      )
      .slice(0, targetCount);
  },

  getAllHistory: async (address: string, targetCount = 50): Promise<ParsedTransaction[]> => {
    const transactions = await fetchTransactionsWithDetails(address, {
      maxTransactions: 200,
      targetCount
    });

    return transactions
      .filter((tx) => tx.sender === address && isWithinLast30Days(tx.timestamp))
      .map(parseTransaction)
      .filter((tx): tx is ParsedTransaction => tx !== null)
      .slice(0, targetCount);
  }
};

export default transactionHistoryService;
