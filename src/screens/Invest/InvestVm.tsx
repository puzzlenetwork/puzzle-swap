import React, { useMemo } from "react";
import { useVM } from "@src/hooks/useVM";
import { makeAutoObservable } from "mobx";
import { RootStore, useStores } from "@stores";
import Pool from "@src/entities/Pool";
import BN from "@src/utils/BN";

const ctx = React.createContext<InvestVM | null>(null);

export const InvestVMProvider: React.FC = ({ children }) => {
  const rootStore = useStores();
  const store = useMemo(() => new InvestVM(rootStore), [rootStore]);
  return <ctx.Provider value={store}>{children}</ctx.Provider>;
};

export const useInvestVM = () => useVM(ctx);

class InvestVM {
  public rootStore: RootStore;
  searchValue = "";
  setSearchValue = (v: string) => (this.searchValue = v);

  sortApy = true;
  setSortApy = (v: boolean) => (this.sortApy = v);

  sortLiquidity = true;
  setSortLiquidity = (v: boolean) => (this.sortLiquidity = v);

  customPools: Pool[] = [];
  setCustomPools = (v: Pool[]) => (this.customPools = v);

  poolCategoryFilter: number = 0;
  setPoolCategoryFilter = (v: number) => (this.poolCategoryFilter = v);

  constructor(rootStore: RootStore) {
    this.rootStore = rootStore;
    // this.syncCustomPools();
    makeAutoObservable(this);
  }

  // syncCustomPools = async () => {
  //   const vpools = await poolService.getPools();
  //   const pools = vpools.filter(({ domain }) => domain === "pooool");
  //   const customPools = pools.map((pool) => {
  //     const tokens = pool.assets.reduce((acc, v) => {
  //       const token = Object.entries(TOKENS)
  //         .map(([_, value]) => value)
  //         .find(({ assetId }) => assetId === v.assetId);
  //       return token != null
  //         ? [
  //             ...acc,
  //             {
  //               ...token,
  //               logo: tokenLogosByAssetId[v.assetId],
  //               share: v.share,
  //             },
  //           ]
  //         : [...acc];
  //     }, [] as Array<IToken & { share: number }>);
  //
  //     return new Pool({
  //       contractAddress: pool.contractAddress,
  //       layer2Address: pool.layer2Address,
  //       baseTokenId: pool.baseTokenId,
  //       title: pool.title,
  //       domain: pool.domain,
  //       isCustom: pool.isCustom,
  //       logo: pool.logo,
  //       defaultAssetId0: pool.assets[0].assetId,
  //       defaultAssetId1: pool.assets[1].assetId,
  //       tokens,
  //     });
  //   });
  //   this.setCustomPools(customPools);
  // };

  get pools() {
    const { poolsStats, pools } = this.rootStore.poolsStore;
    return pools.map((p) => {
      const apy = poolsStats != null ? poolsStats[p.domain]?.apy : BN.ZERO;
      return { ...p, logo: p.logo, baseToken: p.baseToken, apy };
    });
  }

  get totalInvestmentBalance(): string | null {
    const { accountPoolsLiquidity } = this.rootStore.poolsStore;
    if (accountPoolsLiquidity == null) return null;
    const value = accountPoolsLiquidity?.reduce(
      (acc, v) => acc.plus(v.liquidityInUsdn),
      BN.ZERO
    );
    console.log(value?.toFormat(2));

    return "";
  }
}
