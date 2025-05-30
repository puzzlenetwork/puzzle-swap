import React, { useMemo } from "react";
import { useVM } from "@src/hooks/useVM";
import { makeAutoObservable, reaction } from "mobx";
import { RootStore, useStores } from "@stores";
import BN from "@src/utils/BN";
import aggregatorService, { TCalcRoute } from "@src/services/aggregatorService";
import {
  CONTRACT_ADDRESSES,
  EXPLORER_URL,
  IToken,
  ROUTES,
  TOKENS_BY_ASSET_ID,
  TOKENS_BY_SYMBOL,
} from "@src/constants";

interface IProps {
  children: React.ReactNode;
}

const ctx = React.createContext<SwapVM | null>(null);

export const SwapVMProvider: React.FC<IProps> = ({ children }) => {
  const rootStore = useStores();
  const store = useMemo(() => new SwapVM(rootStore), [rootStore]);
  return <ctx.Provider value={store}>{children}</ctx.Provider>;
};

export const useSwapVM = () => useVM(ctx);

export class SwapVM {
  constructor(private rootStore: RootStore) {
    makeAutoObservable(this);
    this.setActiveAction(window.location.pathname === ROUTES.TRADE ? 0 : 1);
    const params = new URLSearchParams(window.location.search);
    const asset0 = params.get("asset0")?.toString();
    const asset1 = params.get("asset1")?.toString();
    this.assetId0 = asset0 ?? TOKENS_BY_SYMBOL.WAVES.assetId;
    this.assetId1 = asset1 ?? TOKENS_BY_SYMBOL.PUZZLE.assetId;
    this._syncAmount1();
    reaction(
      () => [this.assetId0, this.assetId1, this.amount0],
      () => this._syncAmount1()
    );
    setInterval(() => this._syncAmount1(true), 15 * 1000);
  }

  public activeAction: number = 0;
  setActiveAction = (v: number) => (this.activeAction = v);

  openedChart = false;
  setOpenedChart = (v: boolean) => (this.openedChart = v);

  openedSettings = false;
  setOpenedSettings = (v: boolean) => (this.openedSettings = v);

  slippage = new BN(50);
  setSlippage = (v: BN) => (this.slippage = v);

  price: BN = BN.ZERO;
  private _setPrice = (price: BN) => (this.price = price);

  private _calculatePrice(
    amount0: BN = this.amount0,
    amount1: BN = this.amount1
  ) {
    const price = BN.formatUnits(amount1, this.token1.decimals)
      .div(BN.formatUnits(amount0, this.token0.decimals))
      .times(0.9971);
    this._setPrice(!price.isNaN() ? price : BN.ZERO);
  }

  parameters: string | null = null;
  private _setParameters = (parameters: string | null) =>
    (this.parameters = parameters);

  synchronizing: boolean = false;
  private _setSynchronizing = (synchronizing: boolean) =>
    (this.synchronizing = synchronizing);

  loading: boolean = false;
  private _setLoading = (l: boolean) => (this.loading = l);

  priceImpact: BN = BN.ZERO;
  private _setPriceImpact = (priceImpact: BN) =>
    (this.priceImpact = priceImpact);

  route: Array<TCalcRoute> = [];
  private _setRoute = (route: Array<TCalcRoute>) => (this.route = route);

  aggregatedProfit: BN = BN.ZERO;
  private _setAggregatedProfit = (value: BN) => (this.aggregatedProfit = value);

  assetId0: string;
  setAssetId0 = (assetId: string) => (this.assetId0 = assetId);

  assetId1: string;
  setAssetId1 = (assetId: string) => (this.assetId1 = assetId);

  amount0: BN = BN.ZERO;
  setAmount0 = (amount: BN) => (this.amount0 = amount);

  get amount0MaxClickFunc(): (() => void) | undefined {
    const { token0, balance0 } = this;
    return token0 != null && balance0 != null
      ? () => this.setAmount0(balance0)
      : undefined;
  }

  get usdnEquivalent0() {
    const rate = this.rootStore.poolsStore.usdtRate(this.token0.assetId);
    const value = BN.formatUnits(this.amount0, this.token0.decimals).times(
      rate ?? BN.ZERO
    );
    const format = value.eq(0) ? 0 : value?.gt(0.0001) ? 2 : 4;
    return "$ " + value.toFormat(format);
  }

  get usdnEquivalent1() {
    const rate = this.rootStore.poolsStore.usdtRate(this.token1.assetId);
    const value = BN.formatUnits(this.amount1, this.token1.decimals).times(
      rate ?? BN.ZERO
    );
    const format = value.eq(0) ? 0 : value?.gt(0.0001) ? 2 : 4;
    return "$ " + value.toFormat(format);
  }

  amount1: BN = BN.ZERO;
  private _setAmount1 = (amount: BN) => (this.amount1 = amount);

  routingModalOpened: boolean = false;
  setRoutingModalState = (state: boolean) => (this.routingModalOpened = state);

  rejectAggregatorPromise?: () => void;
  setRejectAggregatorPromise = (v: any) => (this.rejectAggregatorPromise = v);

  //todo cun out kludge with invalidAmount
  private _syncAmount1 = (quiet = false) => {
    const { amount0, assetId0, assetId1 } = this;
    const invalidAmount = amount0 == null || amount0.isNaN() || amount0.lte(0);
    if (amount0 != null && amount0.eq(0)) {
      this._setAmount1(BN.ZERO);
    }
    !quiet && this._setSynchronizing(true);
    const defaultAmount0 = BN.parseUnits(1, this.token0.decimals);
    if (this.rejectAggregatorPromise != null) this.rejectAggregatorPromise();
    const promise = new Promise((resolve, reject) => {
      this.rejectAggregatorPromise = reject;
      resolve(
        aggregatorService.calc(
          assetId0,
          assetId1,
          invalidAmount ? defaultAmount0 : amount0
        )
      );
    });
    promise
      .then((v: any) => {
        !invalidAmount && this._setAmount1(new BN(v.estimatedOut * 0.9971));
        this._calculatePrice(
          invalidAmount ? defaultAmount0 : amount0,
          new BN(v.estimatedOut)
        );
        this._setSynchronizing(false);
        !invalidAmount &&
          this._setPriceImpact(
            (new BN(v.priceImpact).gt(0)
              ? new BN(v.priceImpact)
              : BN.ZERO
            ).times(100)
          );
        this._setParameters(!invalidAmount ? v.parameters : null);
        this._setRoute(v.routes);
        this._setAggregatedProfit(new BN(v.aggregatedProfit));
      })
      .catch(() => {
        this._setAmount1(BN.ZERO);
        this._setPriceImpact(BN.ZERO);
        this._setRoute([]);
        this._setPrice(BN.ZERO);
        this._setParameters(null);
      })
      .finally(() => {
        this.setRejectAggregatorPromise(undefined);
        this._setSynchronizing(false);
      });
  };

  get token0() {
    return this.rootStore.accountStore.balances.find(
      ({ assetId }) => assetId === this.assetId0
    )!;
  }

  get balance0() {
    return this.token0?.balance;
  }

  get token1() {
    return this.rootStore.accountStore.balances.find(
      ({ assetId }) => assetId === this.assetId1
    )!;
  }

  get simpleRoute() {
    if (
      this.route == null ||
      this.route.length <= 0 ||
      this.route[0].exchanges.length <= 0
    ) {
      return null;
    }

    const simpleRoute = this.route[0].exchanges.reduce<Array<string>>(
      (acc, e, i) => [
        ...acc,
        ...(i === 0 ? [e.from, e.to] : [e.to]).map((v) => {
          const asset = this.getBalanceByAssetId(v);
          return asset != null ? asset.symbol : "UNKNOWN";
        }),
      ],
      []
    );

    return simpleRoute.length < 4
      ? simpleRoute
      : [simpleRoute[0], "...", simpleRoute[simpleRoute.length - 1]];
  }

  getBalanceByAssetId = (assetId: string) =>
    this.rootStore.accountStore.balances.find((b) => assetId === b.assetId);

  get minimumToReceive(): BN {
    const slippage =
      JSON.parse(
        localStorage.getItem("puzzle-user-settings") || '{"slippage": 1}'
      )?.slippage || 1;
    return this.amount1.times(new BN(100 - slippage).div(100));
  }

  switchTokens = () => {
    const assetId0 = this.assetId0;
    this.setAssetId0(this.assetId1);
    this.setAssetId1(assetId0);
  };

  swap = async () => {
    const { accountStore, notificationStore } = this.rootStore;
    const { token0, amount0, minimumToReceive, parameters } = this;
    if (this.synchronizing || parameters == null) return;
    if (token0 == null || amount0.eq(0)) return;
    if (minimumToReceive == null) return;
    await this._syncAmount1();
    this._setLoading(true);
    await accountStore
      .invoke({
        dApp: CONTRACT_ADDRESSES.aggregator,
        payment: [
          {
            assetId: token0.assetId === "WAVES" ? null : token0.assetId,
            amount: amount0.toString(),
          },
        ],
        call: {
          function: "swap",
          args: [
            { type: "string", value: parameters },
            {
              type: "integer",
              value: minimumToReceive.toFixed(0).toString(),
            },
          ],
        },
      })
      .then((txId) => {
        txId &&
          notificationStore.notify(
            "You can view the details of it in Waves Explorer",
            {
              type: "success",
              title: "Transaction is completed",
              link: `${EXPLORER_URL}/transactions/${txId}`,
              linkTitle: "View on Explorer",
            }
          );
      })
      .catch((e) => {
        notificationStore.notify(e.message ?? JSON.stringify(e), {
          type: "error",
          title: "Transaction is not completed",
        });
      })
      .then(() => this._setLoading(false))
      .then(() => accountStore.updateAccountAssets(true));
  };

  get totalLiquidity() {
    if (this.rootStore.poolsStore == null) return "";
    const liq = this.rootStore.poolsStore.pools.reduce(
      (acc, pool) => acc.plus(pool.globalLiquidity),
      BN.ZERO
    );
    return liq.toFormat(2);
  }

  get schemaValues() {
    if (
      this.route == null ||
      this.route.length <= 0 ||
      this.route[0].exchanges.length <= 0
    ) {
      return null;
    }
    return this.route.reduce<Array<ISchemaRoute>>((acc, v) => {
      const exchanges = v.exchanges.reduce<Array<ISchemaExchange>>((ac, v) => {
        const token0 = TOKENS_BY_ASSET_ID[v.from];
        const token1 = TOKENS_BY_ASSET_ID[v.to];
        const top = BN.formatUnits(v.amountOut, token1?.decimals);
        const bottom = BN.formatUnits(v.amountIn, token0?.decimals);
        const rate = top.div(bottom);

        const type = v.type;
        return [...ac, { rate, token0, token1, type }];
      }, []);
      const percent = this.amount0.eq(0)
        ? new BN(100)
        : new BN(v.in).times(new BN(100)).div(this.amount0);
      return [...acc, { percent: percent, exchanges }];
    }, []);
  }
}

export interface ISchemaRoute {
  percent: BN;
  exchanges: ISchemaExchange[];
}

export interface ISchemaExchange {
  rate: BN;
  token0?: IToken;
  token1?: IToken;
  type: string;
}
