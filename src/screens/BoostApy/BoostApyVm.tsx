import React, { useMemo } from "react";
import { useVM } from "@src/hooks/useVM";
import { makeAutoObservable, when } from "mobx";
import { RootStore, useStores } from "@stores";
import BN from "@src/utils/BN";
import Balance from "@src/entities/Balance";

const ctx = React.createContext<BoostApyVm | null>(null);

export const BoostApyVmProvider: React.FC<{
  poolDomain: string;
}> = ({ poolDomain, children }) => {
  const rootStore = useStores();
  const store = useMemo(
    () => new BoostApyVm(rootStore, poolDomain),
    [rootStore, poolDomain]
  );
  return <ctx.Provider value={store}>{children}</ctx.Provider>;
};

export const useBoostApyVm = () => useVM(ctx);

class BoostApyVm {
  public poolDomain: string;
  public rootStore: RootStore;

  public get pool() {
    return this.rootStore?.poolsStore.getPoolByDomain(this.poolDomain)!;
  }

  public days: number = 0;
  public setDays = (v: number) => (this.days = v);

  assetId: string = this.pool?.defaultAssetId0!;
  setAssetId = (assetId: string) => (this.assetId = assetId);

  amount: BN = BN.ZERO;
  setAmount = (amount: BN) => (this.amount = amount);

  get token() {
    return this.pool?.tokens.find(({ assetId }) => assetId === this.assetId);
  }

  get balance() {
    return this.balances?.find((b) => b.assetId === this.assetId)?.balance;
  }

  get balances() {
    const { accountStore } = this.rootStore;
    return this.pool?.tokens
      .map((t) => {
        const balance = accountStore.findBalanceByAssetId(t.assetId);
        return balance ?? new Balance(t);
      })
      .sort((a, b) => {
        if (a.usdnEquivalent == null && b.usdnEquivalent == null) return 0;
        if (a.usdnEquivalent == null && b.usdnEquivalent != null) return 1;
        if (a.usdnEquivalent == null && b.usdnEquivalent == null) return -1;
        return a.usdnEquivalent!.lt(b.usdnEquivalent!) ? 1 : -1;
      });
  }

  get amountMaxClickFunc(): (() => void) | undefined {
    const { token, balance } = this;
    return token != null && balance != null
      ? () => this.setAmount(balance)
      : undefined;
  }

  get usdnEquivalent(): string {
    const { token } = this;
    const usdnRate = this.rootStore?.poolsStore.usdnRate(this.assetId, 1);
    if (token == null || usdnRate == null) return "—";
    const result = usdnRate.times(BN.formatUnits(this.amount, token.decimals));
    if (!result.gt(0)) return "—";
    return `~ ${usdnRate
      .times(BN.formatUnits(this.amount, token.decimals))
      .toFormat(2)} $`;
  }

  get calcBoostedApy() {
    const usdnRate = this.rootStore?.poolsStore.usdnRate(this.assetId, 1);
    const v = new BN(1)
      .plus(new BN(usdnRate ?? 1).div(this.pool?.globalLiquidity))
      .times(new BN(365).div(this.days));
    console.log(v.toString());
    return "100%";
    //apyBoost = (1 + boostingAmount / poolLiquidity)  ** (365 / boostingDays)
  }

  get isAllDataProvided() {
    return this.days > 0 && this.days <= 365 && !this.amount.eq(0);
  }

  constructor(rootStore: RootStore, poolDomain: string) {
    this.poolDomain = poolDomain;
    this.rootStore = rootStore;
    makeAutoObservable(this);
    when(
      () => this.pool != null,
      () => {
        this.setAssetId(this.pool.tokens[0].assetId);
      }
    );
  }
}
