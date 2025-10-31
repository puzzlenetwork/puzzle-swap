import { TOKENS_BY_ASSET_ID } from "@src/constants";
import Pool from "@src/entities/Pool";
import { useVM } from "@src/hooks/useVM";
import poolService from "@src/services/poolsService";
import BN from "@src/utils/BN";
import { RootStore, useStores } from "@stores";
import { makeAutoObservable } from "mobx";
import React, { useMemo } from "react";
interface IProps {
  children: React.ReactNode;
}

const ctx = React.createContext<InvestVM | null>(null);

export const InvestVMProvider: React.FC<IProps> = ({ children }) => {
  const rootStore = useStores();
  const store = useMemo(() => new InvestVM(rootStore), [rootStore]);
  return <ctx.Provider value={store}>{children}</ctx.Provider>;
};

export const useInvestVM = () => useVM(ctx);

class InvestVM {
  public rootStore: RootStore;

  customPools: Pool[] = [];
  setCustomPools = (v: Pool[]) => (this.customPools = v);

  poolCategoryFilter: number = 0;
  setPoolCategoryFilter = (v: number) => (this.poolCategoryFilter = v);

  customPoolFilter: number = 0;
  setCustomPoolFilter = (v: number) => (this.customPoolFilter = v);

  constructor(rootStore: RootStore) {
    this.rootStore = rootStore;
    this.syncCustomPools();
    makeAutoObservable(this);
  }

  syncCustomPools = async () => {
    const { pools: poolsData, totalItems } = await poolService.getPools(this.rootStore.poolsStore.paramsAllPools);
    this.rootStore.poolsStore.setTotalItems(totalItems);
    const pools = poolsData.map((p) => {
      const tokens = p.assets.map(({ asset_id, share }) => ({
        ...TOKENS_BY_ASSET_ID[asset_id],
        share
      }));
      return new Pool({ ...p, tokens });
    });
    this.setCustomPools(pools);
  };

  get pools() {
    return this.rootStore.poolsStore.pools;
  }

  get totalInvestmentBalance(): string | null {
    const { investedInPools, usdtRate } = this.rootStore.poolsStore;
    if (investedInPools == null) return null;
    
    const value = investedInPools.reduce((acc, invested) => {
      if (!invested.addressStaked || invested.addressStaked.eq(0)) return acc;
      
      const pool = this.pools.find((p) => p.domain === invested.pool.domain);
      if (!pool) return acc;
      
      const totalValue = pool.tokens.reduce((tokenAcc, token) => {
        const top = pool.liquidity?.[token.assetId]?.times(invested.addressStaked!) ?? BN.ZERO;
        const tokenAmount = top.div(pool.globalPoolTokenAmount ?? new BN(1));
        const rate = usdtRate(token.assetId, 1) ?? BN.ZERO;
        const usdValue = tokenAmount.times(rate).div(new BN(10).pow(token.decimals));
        return tokenAcc.plus(usdValue);
      }, BN.ZERO);
      
      return acc.plus(totalValue);
    }, BN.ZERO);
    
    return "$" + value.toFormat(2);
  }
}
