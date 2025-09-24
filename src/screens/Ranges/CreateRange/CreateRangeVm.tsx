import Button from "@components/Button";
import Spinner from "@components/Spinner";
import { IDialogNotificationProps } from "@components/Dialog/DialogNotification";
import { IToken, TOKENS_BY_ASSET_ID, TOKENS_BY_SYMBOL, TOKENS_LIST } from "@src/constants";
import { RANGE_CONTRACT_B64 } from "@src/constants/contracts";
import Balance from "@src/entities/Balance";
import { useVM } from "@src/hooks/useVM";
import rangesService, { IStakingStatistics } from "@src/services/rangesService";
import BN from "@src/utils/BN";
import { RootStore, useStores } from "@stores";
import { address as Address, randomSeed } from "@waves/ts-lib-crypto";
import { broadcast, setScript, waitForTx } from "@waves/waves-transactions";
import { makeAutoObservable, observable, reaction } from "mobx";
import { generate } from "random-words";
import React, { useMemo } from "react";
import loadCreateRangeStateFromStorage, { IInitDataToStore } from "./utils/loadCreateRangeStateFromStorage";

export const feeToDeploy = new BN(0.042e8);
export const transactionFeeToDeploy = new BN(0.001e8);
export const feeToProvideLiquidity = new BN(0.005e8);

interface IProps {
  children: React.ReactNode;
}

export interface IRangeToken {
  asset: IToken;
  minPrice?: BN;
  maxPrice?: BN;
  leverage: BN;
  initialPrice?: BN;
  currentPrice?: BN;
  maxSellOff?: BN;
  apr?: BN;
  locked: boolean;
  share: BN;
  // Select Assets step: UI loading flag for prices. False until initial/current price is resolved from tokenStore or user input
  priceLoaded?: boolean;
  inWallet?: BN;
}

const ctx = React.createContext<CreateRangeVm | null>(null);

export const CreateRangeVMProvider: React.FC<IProps> = ({ children }) => {
  const rootStore = useStores();
  const store = useMemo(() => new CreateRangeVm(rootStore), [rootStore]);
  return <ctx.Provider value={store}>{children}</ctx.Provider>;
};

export const useCreateRangeVM = () => useVM(ctx);

export interface IPaymentsArtefact {
  assetId: string;
  name?: string;
  picture?: string;
}

const NODE_URL = "https://nodes-puzzle.wavesnodes.com";

class CreateRangeVm {
  public rootStore: RootStore;

  loading: boolean = false;
  private priceCache = new Map<string, { price: BN; timestamp: number }>();
  private readonly CACHE_DURATION = 30000;
  private _setLoading = (l: boolean) => (this.loading = l);

  public notificationParams: IDialogNotificationProps | null = null;
  public setNotificationParams = (params: IDialogNotificationProps | null) => (this.notificationParams = params);

  public rangeAssets: IRangeToken[] = [];
  setDefaultRangeAssets = () => {
    this.rangeAssets = [
      observable({
        asset: TOKENS_BY_SYMBOL.ROME,
        share: new BN(500),
        initialPrice: undefined,
        currentPrice: undefined,
        leverage: new BN(1),
        locked: false,
        priceLoaded: false
      }),
      observable({
        asset: TOKENS_BY_SYMBOL.PUZZLE,
        share: new BN(500),
        initialPrice: undefined,
        currentPrice: undefined,
        leverage: new BN(1),
        locked: false,
        priceLoaded: false
      })
    ];
    this.syncCurrentPrices();
  };

  get assetsWithLeverage() {
    const mutatedAssets = this.rangeAssets.map((v) => {
      return {
        ...v,
        reversedLeverage: v.leverage ? new BN(1).div(v.leverage) : new BN(1)
      };
    });
    const maxLeverage = mutatedAssets.reduce((acc, v) => {
      return BN.max(acc, v.reversedLeverage);
    }, BN.ZERO);

    return mutatedAssets.map((v) => {
      return {
        ...v.asset,
        ...v,
        reversedLeverage: v.reversedLeverage.times(100).toNumber(),
        relativeReversedLeverage: v.reversedLeverage.div(maxLeverage).times(100).plus(10).toNumber()
      };
    });
  }

  public baseTokenPrice: BN | null = null;
  public setBaseTokenPrice = (val: BN) => {
    // priceLoaded: mark base token as loaded when base price is determined
    if (this.rangeAssets[0]) {
      this.rangeAssets[0].priceLoaded = true;
    }

    if (this.baseTokenPrice) {
      this.rangeAssets.slice(1).forEach(async (asset) => {
        // priceLoaded: set false before recalculation against a new base price
        asset.priceLoaded = false;
        const newInitialPrice = asset.initialPrice?.times(this.baseTokenPrice!.div(val));
        newInitialPrice && this.updateAssetInitialPrice(asset.asset.assetId, newInitialPrice);

        const currentPriceFromStore = await this.getTokenPrice(asset.asset.assetId);
        if (currentPriceFromStore) {
          const newCurrentPrice = BN.parseUnits(currentPriceFromStore.div(val), asset.asset.decimals);
          this.updateAssetCurrentPrice(asset.asset.assetId, newCurrentPrice);
        }
        // priceLoaded: done recalculating relative prices for this asset
        asset.priceLoaded = true;
      });
    } else {
      this.rangeAssets.slice(1).forEach(async (asset) => {
        // priceLoaded: set false before initial fetch from tokenStore
        asset.priceLoaded = false;
        const currentPriceFromStore = await this.getTokenPrice(asset.asset.assetId);
        if (currentPriceFromStore) {
          const newInitialPrice = BN.parseUnits(currentPriceFromStore.div(val), asset.asset.decimals);
          this.updateAssetInitialPrice(asset.asset.assetId, newInitialPrice);
          this.updateAssetCurrentPrice(asset.asset.assetId, newInitialPrice);
        }
        // priceLoaded: finished (fallbacks used if store value absent)
        asset.priceLoaded = true;
      });
    }
    this.baseTokenPrice = val;
  };

  public equalShares: boolean = false;
  setEqualShares = (v: boolean) => {
    this.equalShares = v;
    if (v) {
      this.syncShares();
    }
  };

  maxStep: number = 0;
  step: number = 0;
  setStep = (s: number) => {
    if (s > this.maxStep) {
      this.maxStep = s;
    }
    this.step = s;
  };

  domain: string = "";
  setDomain = (v: string) => (this.domain = v);

  rangeSettingError: boolean = false;
  setRangeSettingError = (v: boolean) => (this.rangeSettingError = v);

  swapFee: BN = new BN(10);
  setSwapFee = (v: BN) => (this.swapFee = v);

  providedPercentOfPool: BN = new BN(100);
  setProvidedPercentOfPool = (value: number | number[]) => (this.providedPercentOfPool = new BN(value.toString()));

  constructor(rootStore: RootStore) {
    this.rootStore = rootStore;
    makeAutoObservable(this);
    const initData = loadCreateRangeStateFromStorage();
    this.initialize(initData);
    this.syncStakingStats();

    this.syncInWallet();

    reaction(
      () => this.rootStore.accountStore.assetBalances && this.rootStore.accountStore.assetBalances.length,
      () => this.syncInWallet()
    )

    reaction(
      () => this.rootStore.accountStore.address,
      () => this.syncInWallet()
    )

    reaction(
      () => ({
        assets: this.rangeAssets.map((t) => ({
          assetId: t.asset?.assetId,
          locked: t.locked,
          share: t.share.div(10).toNumber(),
          leverage: t.leverage.toNumber(),
          initialPrice: t.initialPrice ? (t.initialPrice).toNumber() : undefined,
          maxSellOff: t.maxSellOff?.toNumber(),
        })),
        title: this.domain,
        step: this.step,
        maxStep: this.maxStep,
        swapFee: this.swapFee.div(10).toNumber(),
        deployedContractAddress: this.deployedContractAddress ?? undefined,
      }),
      (state) => {
        this.saveSettings(state);
      },
      { delay: 300 }
    );

    // reaction(
    //   () => this.minVirtualBalanceOfBaseToken,
    //   () => {
    //     this.syncAllMinMaxPrices();
    //   }
    // )
  }

  initialize = (initData: IInitDataToStore | null) => {
    if (initData != null && initData.assets != null && initData.assets.length > 0) {
      if (initData.assets != null) {
        this.rangeAssets = initData.assets?.map(({ assetId, share, locked, leverage, initialPrice, maxSellOff }) => {
          const asset = TOKENS_BY_ASSET_ID[assetId];
          return observable({
            share: new BN(share).times(10),
            maxSellOff: maxSellOff ? new BN(maxSellOff) : undefined,
            locked,
            initialPrice: initialPrice ? new BN(initialPrice) : undefined,
            currentPrice: undefined,
            asset: asset,
            priceLoaded: true,
            leverage: new BN(leverage),
          });
        });
        this.baseTokenPrice = new BN(initData.assets[0]?.initialPrice || 1);
      }
    } else {
      this.setDefaultRangeAssets();
    }

    this.rangeAssets.forEach((v) => {
      this.syncMinMaxPriceByAssetId(v.asset.assetId);
    });

    this.deployedContractAddress = initData?.deployedContractAddress ?? null;
    this.domain = initData?.title ?? generate({ minLength: 2, maxLength: 6, exactly: 2, join: "-" });
    this.step = initData?.step ?? 0;
    this.maxStep = initData?.maxStep ?? 0;
    this.saveSettings();
  };

  reset = () => {
    this.initialize(null);
    this.saveSettings();
    window.location.reload();
  };

  get isAllTokensShareMoreThanFive() {
    return this.rangeAssets.every((v) => v.share.gt(50) || v.share.eq(50));
  }

  get areAllTokensPricesValid() {
    return this.rangeAssets.slice(1).every((v) => {
      return v.initialPrice && v.initialPrice.gt(0);
    });
  }

  get hasTitle() {
    return this.domain.length > 0;
  }

  get titleCorrect() {
  return this.hasTitle && this.domain.length < 14 && !/[^A-Za-z0-9_-\s\/]/.test(this.domain);
  }

  get correct0() {
    return (
      this.isAllTokensShareMoreThanFive &&
      this.rangeAssets.length > 1 &&
      this.totalTokenShare.eq(1000) &&
      this.areAllTokensPricesValid
    );
  }

  get correct1() {
    return (
      this.titleCorrect &&
      this.swapFee.gte(1) &&
      this.swapFee.lte(50)
    );
  }

  get correct2() {
    return !this.providedPercentOfPool.eq(0) && !this.maxToProvide.eq(0);
  }

  get minStep() {
    if (this.rootStore.accountStore.address == null) return 0;
    const step = [this.correct0, this.correct1].indexOf(false);
    return step === -1 ? this.step : step;
  }

  get totalTokenShare(): BN {
    return this.rangeAssets.reduce((acc, v) => acc.plus(v.share), BN.ZERO);
  }

  syncShares = () => {
    const unlockedPercent = this.rangeAssets.reduce((acc, v) => (v.locked ? acc.minus(v.share) : acc), new BN(1000));
    const unlockedCount = this.rangeAssets.reduce((acc, v) => (!v.locked ? acc + 1 : acc), 0);
    const averageUnlockedPercent = unlockedPercent.div(unlockedCount).div(10);
    this.rangeAssets.forEach((v, i) => {
      if (v.locked) return;
      const percent = Math.floor(averageUnlockedPercent.toNumber() * 10) / 10;
      this.rangeAssets[i].share = new BN(percent).times(10);
    });

    // If sum != 1000, add difference to the first unlocked token, so the data is valid
    const totalShare = this.totalTokenShare;
    if (totalShare.lt(1000)) {
      const diff = new BN(1000).minus(totalShare);
      const firstUnlockedIndex = this.rangeAssets.findIndex((v) => !v.locked);
      if (firstUnlockedIndex !== -1) {
        this.rangeAssets[firstUnlockedIndex].share = this.rangeAssets[firstUnlockedIndex].share.plus(diff);
      }
    }
  };

  stakingStats: IStakingStatistics[] = [];
  setStakingStats = (stats: IStakingStatistics[]) => {
    this.stakingStats = stats;
    this.rangeAssets.forEach((v) => {
      const stat = stats.find((s) => s.asset_id === v.asset.assetId);
      if (stat) {
        v.apr = new BN(stat.apr_1y);
      }
    });
  };

  syncStakingStats = () => {
    rangesService.getStakingStatistics().then((stats) => {
      this.setStakingStats(stats);
    });
  };

  addAssetToRange = async (assetId: string) => {
    const balances = this.tokensToAdd;
    const asset = balances?.find((b) => b.assetId === assetId);
    if (asset == null) return;

    // Insert placeholder entry so UI can show loading state immediately (priceLoaded drives Skeleton in Select Assets)
    this.rangeAssets.push(
      observable({
        asset: asset,
        share: BN.ZERO,
        // leave prices temporary (will be calculated below)
        initialPrice: undefined,
        currentPrice: undefined,
        leverage: new BN(1),
        apr: this.stakingStats.find((s) => s.asset_id === assetId)?.apr_1y
          ? new BN(this.stakingStats.find((s) => s.asset_id === assetId)!.apr_1y)
          : undefined,
        locked: false,
        priceLoaded: false
      })
    );

    // Calculate prices relative to base
    try {
      const initialPrice = await this.getTokenPrice(assetId);
      if (initialPrice && this.baseTokenPrice) {
        const relativeInitialPrice = initialPrice.div(this.baseTokenPrice);
        const parsed = BN.parseUnits(relativeInitialPrice, asset.decimals);
        this.updateAssetInitialPrice(asset.assetId, parsed);
        this.updateAssetCurrentPrice(asset.assetId, parsed);
      } else {
        this.updateAssetInitialPrice(asset.assetId, undefined);
        this.updateAssetCurrentPrice(asset.assetId, undefined);
      }
    } finally {
      // priceLoaded: mark as loaded regardless of success; fallbacks will be used if needed
      const idx = this.rangeAssets.findIndex((ra) => ra.asset.assetId === asset.assetId);
      if (idx !== -1) this.rangeAssets[idx].priceLoaded = true;
    }

    this.syncShares();
    this.syncMinMaxPriceByAssetId(assetId);
    if (this.maxToProvide.eq(0)) {
      this.rootStore.notificationStore.notify(
        "Change the assets you don’t have enough in wallet, or reset the whole composition.",
        {
          title: "Your max to provide is too low for this range composition",
          type: "warning",
          onClickText: "Reset the composition",
          onClick: () => this.setDefaultRangeAssets()
        }
      );
    }
  };

  removeAssetFromRange = (assetId: string) => {
    const indexOfObject = this.rangeAssets.findIndex(({ asset }) => asset.assetId === assetId);
    this.rangeAssets.splice(indexOfObject, 1);
    this.syncShares();
  };

  changeAssetShareInRange = (assetId: string, share: BN) => {
    if (share.gt(1000)) share = new BN(1000);
    const indexOfObject = this.rangeAssets.findIndex(({ asset }) => asset.assetId === assetId);
    this.rangeAssets[indexOfObject].share = share;
    this.syncMinMaxPriceByAssetId(assetId);
  };

  replaceAssetInRange = async (oldAssetId: string, newAssetId: string) => {
    const indexOfObject = this.rangeAssets.findIndex(({ asset }) => asset.assetId === oldAssetId);
    const asset = this.tokensToAdd?.find((b) => b.assetId === newAssetId);
    if (asset == null) return;

    const currentPrice = await this.getTokenPrice(newAssetId);

    if (indexOfObject === 0 && !currentPrice) {
      this.rootStore.notificationStore.notify("Currently this token can't be a base.", { type: "danger" });
      return;
    }

    this.rangeAssets[indexOfObject].asset = asset;

    // priceLoaded: set false before recalculating prices for the replaced asset
    this.rangeAssets[indexOfObject].priceLoaded = false;

    const apr = this.stakingStats.find((s) => s.asset_id === newAssetId)?.apr_1y;
    this.rangeAssets[indexOfObject].apr = apr ? new BN(apr) : undefined;

    if (indexOfObject === 0) {
      this.setBaseTokenPrice(currentPrice!);
    } else {
      const basePrice = this.baseTokenPrice;
      if (!basePrice) return;
      this.updateAssetInitialPrice(newAssetId, currentPrice ? BN.parseUnits(
        indexOfObject === 0 ? currentPrice : currentPrice.div(basePrice),
        asset.decimals
      ) : undefined);

      this.updateAssetCurrentPrice(newAssetId, currentPrice ? BN.parseUnits(
        indexOfObject === 0 ? currentPrice : currentPrice.div(basePrice),
        asset.decimals
      ) : undefined);
    }
    this.syncMinMaxPriceByAssetId(newAssetId);
  };

  updateAssetLeverage = (assetId: string, v: BN) => {
    const val = v.gte(500) ? new BN(1e4) : v;
    const indexOfObject = this.rangeAssets.findIndex(({ asset }) => asset.assetId === assetId);
    this.rangeAssets[indexOfObject].leverage = val;

    if (indexOfObject === 0) {
      this.syncAllMinMaxPrices();
    } else {
      this.syncMinMaxPriceByAssetId(assetId);
    }
  };

  updateAssetMinPrice = (assetId: string, val: BN) => {
    const indexOfObject = this.rangeAssets.findIndex(({ asset }) => asset.assetId === assetId);
    this.rangeAssets[indexOfObject].minPrice = val;
  };

  updateAssetInitialPrice = (assetId: string, val: BN | undefined) => {
    const indexOfObject = this.rangeAssets.findIndex(({ asset }) => asset.assetId === assetId);
    this.rangeAssets[indexOfObject].initialPrice = val;
    // priceLoaded: user provided a value, consider price resolved for UI
    this.rangeAssets[indexOfObject].priceLoaded = true;
    this.syncMinMaxPriceByAssetId(assetId);
  };

  updateAssetCurrentPrice = (assetId: string, val: BN | undefined) => {
    const indexOfObject = this.rangeAssets.findIndex(({ asset }) => asset.assetId === assetId);
    this.rangeAssets[indexOfObject].currentPrice = val;
    this.syncMinMaxPriceByAssetId(assetId);
  };

  updateAssetMaxPrice = (assetId: string, val: BN) => {
    const indexOfObject = this.rangeAssets.findIndex(({ asset }) => asset.assetId === assetId);
    this.rangeAssets[indexOfObject].maxPrice = val;
  };

  updateAssetMaxSellOff = (assetId: string, val: BN | undefined) => {
    const indexOfObject = this.rangeAssets.findIndex(({ asset }) => asset.assetId === assetId);
    this.rangeAssets[indexOfObject].maxSellOff = val;
  };

  updateLockedState = (assetId: string, val: boolean) => {
    const indexOfObject = this.rangeAssets.findIndex(({ asset }) => asset.assetId === assetId);
    this.rangeAssets[indexOfObject].locked = val;
    this.equalShares = false;
  };

  public syncMinMaxPriceByAssetId = (assetId: string): [BN, BN] | undefined => {
    const asset = this.rangeAssets.find((v) => v.asset.assetId === assetId);
    if (asset == null) return undefined;
    const baseToken = this.rangeAssets[0];


    // todo fix for 0 min virtual balance of base token
    const [rawB0] = this.minVirtualBalanceOfBaseToken;
    const B0 = rawB0.lte(0) ? new BN(1) : rawB0;
    // const B0 = this.minVirtualBalanceOfBaseToken;
    const L0 = baseToken.leverage ?? new BN(1);
    const F0 = B0.div(L0);

    const P1 = asset.initialPrice ? BN.formatUnits(asset.initialPrice, asset.asset.decimals) : new BN(1);

    const w0 = baseToken.share.div(10);
    const w1 = asset.share.div(10);

    const B1 = B0.div(P1).times(w1.div(w0));
    const L1 = asset.leverage ?? new BN(1);
    const F1 = B1.div(L1);

    const rawMin = BN.parseUnits(P1.times(B0.minus(F0).div(B0).mathPow(w0.div(w1).plus(1))), asset.asset.decimals);

    const min = rawMin.isNaN() ? BN.parseUnits(P1, asset.asset.decimals) : rawMin;

    const rawMax = BN.parseUnits(P1.times(B1.div(B1.minus(F1)).mathPow(w1.div(w0).plus(1))), asset.asset.decimals);

    const max = rawMax.isNaN() || rawMax.isZero() ? BN.parseUnits(P1, asset.asset.decimals) : rawMax;

    this.updateAssetMinPrice(assetId, min);
    this.updateAssetMaxPrice(assetId, max);

    return [min, max];
  };

  syncAllMinMaxPrices = () => {
    this.rangeAssets.forEach((t) => this.syncMinMaxPriceByAssetId(t.asset.assetId));
  };

  get balances() {
    const { accountStore } = this.rootStore;
    return TOKENS_LIST.map((t) => {
      const balance = accountStore.findBalanceByAssetId(t.assetId);
      return balance ?? new Balance(t);
    }).sort((a, b) => {
      if (a.usdnEquivalent == null && b.usdnEquivalent == null) return 0;
      if (a.usdnEquivalent == null && b.usdnEquivalent != null) return 1;
      if (a.usdnEquivalent == null && b.usdnEquivalent == null) return -1;
      return a.usdnEquivalent!.lt(b.usdnEquivalent!) ? 1 : -1;
    });
  }

  get tokensToAdd() {
    const currentTokens = this.rangeAssets.reduce<string[]>((acc, v) => [...acc, v.asset.assetId], []);
    return this.balances.filter((b) => !currentTokens.includes(b.assetId));
  }

  saveSettings = (state?: IInitDataToStore) => {
    if (state) {
      localStorage.setItem("puzzle-custom-range", JSON.stringify(state));
      return;
    }
    const assets = this.rangeAssets.map((t) => ({
      assetId: t.asset?.assetId,
      locked: t.locked,
      share: t.share.div(10).toNumber(),
      leverage: t.leverage.toNumber(),
      initialPrice: t.initialPrice?.toNumber(),
      maxSellOff: t.maxSellOff?.toNumber(),
    }));
    const _state = {
      assets,
      title: this.domain,
      step: this.step,
      maxStep: this.maxStep,
      swapFee: this.swapFee.div(10).toNumber(),
      deployedContractAddress: this.deployedContractAddress,
    };
    localStorage.setItem("puzzle-custom-range", JSON.stringify(_state));
  };

  provideLiquidityToRange = async () => {
    const { address } = this.rootStore.accountStore;
    if (address === null) {
      this.rootStore.notificationStore.notify("Please connect your wallet first", { type: "warning" });
      return;
    }

    if (this.deployedContractAddress === null) {
      this.rootStore.notificationStore.notify("No deployed contract found. Please deploy the range first.", {
        type: "warning"
      });
      return;
    }

    try {
      this._setLoading(true);
      this.setNotificationParams(null);

      // Prepare init function parameters
      const assetIdsStr = this.rangeAssets.map(({ asset }) => asset.assetId).join(",");
      const assetWeightsStr = this.rangeAssets.map(({ share }) => BN.parseUnits(share, 1).toNumber()).join(",");

      // Calculate max selloff values (empty string if not provided)
      const assetMaxSelloffStr = this.rangeAssets
        .map(({ maxSellOff }) => (maxSellOff ? BN.parseUnits(maxSellOff, 2).toNumber().toString() : ""))
        .join(",");

      const baseTokenId = this.rangeAssets[0].asset.assetId;
      const fee = BN.parseUnits(this.swapFee, 1).toNumber();

      // Calculate virtual balances: amount * leverage for each token
      const virtualBalances: string[] = [];
      const payments: { assetId: string | null; amount: string }[] = [];

      for (const rangeAsset of this.rangeAssets) {
        const { asset, leverage } = rangeAsset;
        const leverageValue = leverage ?? new BN(1);

        // Get the amount to provide from assetsForInitFunction
        const assetForInit = this.assetsForInitFunction.find(
          (a) => (a.assetId === null && asset.assetId === "WAVES") || a.assetId === asset.assetId
        );

        if (!assetForInit) {
          throw new Error(`No amount calculated for asset ${asset.symbol}`);
        }

        const amountToProvide = new BN(assetForInit.amount);

        // Virtual balance = amount * leverage
        const virtualBalance = amountToProvide.times(leverageValue);
        // Format as integer string without scientific notation
        virtualBalances.push(virtualBalance.toFixed(0));

        // Add to payments array
        payments.push({
          assetId: asset.assetId === "WAVES" ? null : asset.assetId,
          amount: amountToProvide.toFixed(0)
        });
      }

      const vBalancesStr = virtualBalances.join(",");

      // Call init function on the deployed contract
      const txId = await this.rootStore.accountStore.invoke({
        dApp: this.deployedContractAddress,
        payment: payments,
        fee: feeToProvideLiquidity.toNumber(),
        call: {
          function: "init",
          args: [
            { type: "string", value: assetIdsStr },
            { type: "string", value: assetWeightsStr },
            { type: "string", value: assetMaxSelloffStr },
            { type: "string", value: baseTokenId },
            { type: "string", value: this.domain },
            { type: "integer", value: fee.toString() },
            { type: "string", value: vBalancesStr }
          ]
        }
      });

      if (!txId) {
        throw new Error("Transaction failed or was cancelled");
      }

      this.rootStore.accountStore.updateAccountAssets(true);

      console.log("Range initialized successfully! Transaction ID:", txId);

      // Show success notification
      this.setNotificationParams({
        type: "success",
        title: `"${this.domain}" Range has been created!`,
        description:
          "You have successfully provided initial liquidity. Your range is now active and ready for trading.",
        buttons: [
          () => {
            const address = this.deployedContractAddress!;
            const GoToRangeWhenReady: React.FC = () => {
              const [available, setAvailable] = React.useState(false);

              React.useEffect(() => {
                let disposed = false;
                let timer: number | undefined;

                const poll = async () => {
                  try {
                    const ok = await rangesService.pingRange(address);
                    if (disposed) return;
                    if (ok) {
                      setAvailable(true);
                    } else {
                      timer = window.setTimeout(poll, 10000);
                    }
                  } catch {
                    if (!disposed) timer = window.setTimeout(poll, 10000);
                  }
                };

                timer = window.setTimeout(poll, 10000);
                return () => {
                  disposed = true;
                  if (timer != null) window.clearTimeout(timer);
                };
              }, []);

              return (
                <Button
                  key="Go to Range page"
                  size="medium"
                  fixed
                  onClick={() => {
                    if (!available) return;
                    this.setNotificationParams(null);
                    this.initialize(null);
                    localStorage.removeItem("puzzle-custom-range");
                    window.open(`/ranges/${this.domain}/details`);
                  }}
                  title={available ? "Go to Range page" : "Range is being deployed"}
                  disabled={!available}
                  kind="secondary"
                >
                  Go to Range page
                </Button>
              );
            };

            return <GoToRangeWhenReady />;
          },
          () => (
            <Button
              key="Back to Ranges"
              size="medium"
              fixed
              onClick={() => {
                this.setNotificationParams(null);
                this.initialize(null);
                localStorage.removeItem("puzzle-custom-range");
                window.open("/ranges");
              }}
            >
              Back to Ranges
            </Button>
          )
        ]
      });

      // Update stores to reflect the new range
      await this.rootStore.rangesStore?.syncRanges?.();
    } catch (e: any) {
      console.error("Error providing liquidity to range:", e);
      this.setNotificationParams({
        type: "warning",
        title: "Error: Couldn't provide liquidity",
        description: e.message ?? e.toString(),
        buttons: [
          () => (
            <Button
              key="Try Again"
              size="medium"
              fixed
              onClick={() => {
                this.setNotificationParams(null);
                this.provideLiquidityToRange();
              }}
            >
              Try Again
            </Button>
          )
        ]
      });
    } finally {
      this.saveSettings();
      this._setLoading(false);
    }
  };

  // Store the deployed contract address for later use
  deployedContractAddress: string | null = null;
  setDeployedContractAddress = (address: string | null) => (this.deployedContractAddress = address);

  createRange = async () => {
    const { address } = this.rootStore.accountStore;
    if (address === null) return;

    try {
      this._setLoading(true);

      // Generate random address for the new range contract
      const seed = randomSeed();
      const randomAddress = Address(seed, "W");

      // Initial waves transfer for fees
      const transferTxId = await this.rootStore.accountStore.transfer({
        amount: feeToDeploy.toNumber().toString(),
        recipient: randomAddress,
        assetId: null
      });

      if (!transferTxId) {
        this.setNotificationParams({
          type: "warning",
          title: "Error: Couldn't transfer WAVES for fees",
          description: "Please ensure you have enough WAVES in your wallet."
        });
        throw new Error("Failed to transfer WAVES for fees");
      }

      // Deploy the range smart contract
      const deployScriptTx = await setScript({ script: RANGE_CONTRACT_B64, chainId: "W", fee: "4200000" }, seed);
      await broadcast(deployScriptTx, NODE_URL);
      try {
        await this.waitForTxThrottled(deployScriptTx.id, { apiBase: NODE_URL });
      } catch { }

      // Store the contract address for initialization in the next step
      this.setDeployedContractAddress(randomAddress);

      // Move to next step and show success message
      this.setStep(this.step + 1);

      this.setNotificationParams({
        type: "success",
        title: "Range Contract Deployed Successfully!",
        description: `Range contract has been deployed at address: ${randomAddress}. You can now provide initial liquidity.`,
        buttons: [
          () => (
            <Button
              key="Continue"
              size="medium"
              fixed
              onClick={() => {
                this.setNotificationParams(null);
                // Continue with the process (liquidity provision will be handled separately)
              }}
            >
              Continue
            </Button>
          )
        ]
      });
    } catch (e: any) {
      this.rootStore.notificationStore.notify("Cannot create range. Try to reload the page and try again.", {
        type: "warning"
      });

      console.error("Error creating range:", e);
    } finally {
      this.saveSettings();
      this._setLoading(false);
    }
  };

  get correspondingVirtualBalanceOfBaseToken(): Record<string, BN> {
    const { accountStore } = this.rootStore;
    const { findBalanceByAssetId } = accountStore;
    return this.rangeAssets.reduce<Record<string, BN>>((acc, { asset, share, initialPrice, leverage }, i) => {
      const rawBalance = findBalanceByAssetId(asset.assetId);
      if (rawBalance == null || rawBalance.balance == null || initialPrice == null) return acc;
      const tokenBalance = asset.assetId === "WAVES"
        ? rawBalance.balance.minus(this.deployedContractAddress ? feeToProvideLiquidity : feeToDeploy.plus(transactionFeeToDeploy).plus(feeToProvideLiquidity)) // reserve 0.042 + 0.001 WAVES for deploy and 0.005 WAVES for provide liquidity
        : rawBalance.balance;
      const baseToken = this.rangeAssets[0];
      const value = BN.formatUnits(tokenBalance, asset.decimals)
        .times(i === 0 ? 1 : BN.formatUnits(initialPrice, asset.decimals))
        .times(leverage ?? 1)
        .times(baseToken.share.div(share));
      return {
        ...acc,
        [asset.assetId]: value
      };
    }, {} as Record<string, BN>);
  }

  get minVirtualBalanceOfBaseToken(): [BN, string] {
    return Object.entries(this.correspondingVirtualBalanceOfBaseToken).reduce(
      (acc, [assetId, v], i) => (i === 0 ? [v, assetId] : v.lt(acc[0]) ? [v, assetId] : acc),
      [BN.ZERO, ""]
    );
  }

  get maxToProvide(): BN {
    const baseToken = this.rangeAssets[0];
    const w0 = baseToken.share; // Note: here the value 100 means 10,0%
    const [B0] = this.minVirtualBalanceOfBaseToken;
    const res = this.rangeAssets.reduce<BN>((acc, { share: w, leverage: L }) => {
      return acc.plus(B0.div(L).times(w.div(w0)));
    }, BN.ZERO);
    return res;
  }

  get maxToProvideUsd(): BN {
    return this.baseTokenPrice ? this.maxToProvide.times(this.baseTokenPrice) : this.maxToProvide;
  }

  get assetsToProvide(): Record<string, BN> {
    const [B0] = this.minVirtualBalanceOfBaseToken;

    const w0 = this.rangeAssets[0].share.div(10);

    return this.rangeAssets.reduce<Record<string, BN>>((acc, { asset, share, initialPrice, leverage }, i) => {
      const { assetId, decimals } = asset;
      const p = i === 0 ? new BN(1) : initialPrice ? BN.formatUnits(initialPrice, decimals) : new BN(1);
      const w1 = share.div(10);

      const B1 = B0.div(p).times(w1.div(w0));
      const L1 = leverage ?? new BN(1);
      const F1 = B1.div(L1);
      const amountToProvide = F1.times(this.providedPercentOfPool.div(100));

      return {
        ...acc,
        [assetId]: amountToProvide
      };
    }, {});
  }

  get assetsForInitFunction(): { assetId: string | null; amount: string }[] {
    return Object.entries(this.assetsToProvide).map(([assetId, amount]) => ({
      assetId: assetId === "WAVES" ? null : assetId,
      amount: BN.parseUnits(
        amount,
        this.rangeAssets.find((asset) => asset.asset.assetId === assetId)?.asset.decimals ?? 8
      )
        .toSignificant(0)
        .toString()
    }));
  }

  get totalAmountToDeposit(): BN {
    const total = this.maxToProvide.times(this.providedPercentOfPool).div(100)
    return total;
  }

  get totalAmountToDepositStr(): string {
    const total = this.totalAmountToDeposit;
    const baseToken = this.rangeAssets[0];
    return total != null
      ? total.toSmallFormat() + " " + baseToken?.asset.symbol
      : "0.00 " + baseToken?.asset.symbol;
  }

  get totalAmountToDepositUsd(): BN | null {
    const total = this.totalAmountToDeposit;
    const baseToken = this.rangeAssets[0];
    const baseTokenPrice = this.baseTokenPrice && !this.baseTokenPrice.isNaN()
      ? this.baseTokenPrice
      : (baseToken?.currentPrice ?? BN.ZERO);
    const usdnEquivalent = total?.times(baseTokenPrice);
    return usdnEquivalent ?? null;
  }

  private async waitForTxThrottled(txId: string, options: any, intervalMs = 10000): Promise<any> {
    let attempts = 0;
    const maxAttempts = 60;
    
    while (attempts < maxAttempts) {
      try {
        const result = await waitForTx(txId, { ...options, timeout: 5000 });
        return result;
      } catch (error) {
        attempts++;
        if (attempts >= maxAttempts) {
          throw error;
        }
        await new Promise((resolve) => setTimeout(resolve, intervalMs));
      }
    }
  }

  async getTokenPrice(assetId: string, tries = 0): Promise<BN | undefined> {
    const now = Date.now();
    const cached = this.priceCache.get(assetId);
    
    if (cached && (now - cached.timestamp) < this.CACHE_DURATION) {
      return cached.price;
    }

    const { tokenStore } = this.rootStore;
    if (tokenStore.initialized) {
      const price = this.rootStore.tokenStore.statisticsFromBackendByAssetId[assetId]?.price;
      if (price) {
        this.priceCache.set(assetId, { price, timestamp: now });
      }
      return price;
    } else if (tries * 1000 > 20000) {
      throw new Error("Timeout: tokenStore not initialized after 20 seconds");
    } else {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      return this.getTokenPrice(assetId, tries + 1);
    }
  }

  async syncCurrentPrices() {
    console.log("Sync current prices")
    // priceLoaded: mark all as loading before syncing from tokenStore
    this.rangeAssets.forEach((a) => (a.priceLoaded = false));
    const basePrice = await this.getTokenPrice(this.rangeAssets[0].asset.assetId);
    this.setBaseTokenPrice(basePrice ?? new BN(1));
    // priceLoaded: ensure base token is flagged as loaded after base price update
    if (this.rangeAssets[0]) this.rangeAssets[0].priceLoaded = true;
  }

  syncInWallet() {
    const { accountStore } = this.rootStore;
    this.rangeAssets.forEach((a) => {
      const balance = accountStore.findBalanceByAssetId(a.asset.assetId)
      if (balance?.balance)
        a.inWallet = BN.formatUnits(balance?.balance, a.asset.decimals);
    });
  }

  get minBalanceAsset(): IRangeToken {
    const baseToken = this.rangeAssets[0];
    const baseAssetId = baseToken.asset.assetId;
    const basePrice = this.baseTokenPrice;
    return this.rangeAssets.slice().map((t) => {
      const toProvide = this.assetsToProvide?.[t.asset.assetId] ?? BN.ZERO;
      const remainingRaw = (t.inWallet ?? BN.ZERO).minus(toProvide);
      const remaining = t.asset.assetId === "WAVES" ? remainingRaw.minus(this.deployedContractAddress ? feeToProvideLiquidity : feeToDeploy.plus(transactionFeeToDeploy).plus(feeToProvideLiquidity)) : remainingRaw;
      const price = (t.asset.assetId === baseAssetId)
        ? basePrice ?? 1
        : (t.currentPrice ? BN.formatUnits(t.currentPrice, t.asset.decimals).times(basePrice ?? 1) : 1);
      const remainingUsdEquivalent = remaining.times(price);
      return {
        ...t,
        remainingUsdEquivalent
      };
    }).sort((a, b) => {
      return a.remainingUsdEquivalent.gt(b.remainingUsdEquivalent) ? 1 : -1
    })[0] as IRangeToken;
  }

  get zeroAssetBalances(): number | null {
    return this.rangeAssets.filter(({ inWallet }) => !inWallet || inWallet.eq(0)).length;
  }
}
