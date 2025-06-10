import React, { useMemo } from "react";
import { useVM } from "@src/hooks/useVM";
import { RootStore, useStores } from "@stores";
import { makeAutoObservable } from "mobx";
import rangesService from "@src/services/rangesService";
import { Range } from "@src/entities/Range";
import BN from "@src/utils/BN";

const ctx = React.createContext<InvestToRangeInterfaceVM | null>(null);

interface IProps {
  children: React.ReactNode;
  rangeAddress: string;
}

export const InvestToRangeInterfaceVMProvider: React.FC<IProps> = ({
  rangeAddress,
  children,
}) => {
  const rootStore = useStores();
  const store = useMemo(
    () => new InvestToRangeInterfaceVM(rootStore, rangeAddress),
    [rootStore, rangeAddress]
  );
  return <ctx.Provider value={store}>{children}</ctx.Provider>;
};

export const useInvestToRangeInterfaceVM = () => useVM(ctx);

class InvestToRangeInterfaceVM {
  private rootStore: RootStore;

  private rangeAddress: string;
  public get range() {
    return this.rootStore.rangesStore.getRangeByAddress(this.rangeAddress);
  }

  constructor(rootStore: RootStore, rangeAddress: string) {
    this.rootStore = rootStore;
    this.rangeAddress = rangeAddress;
    makeAutoObservable(this);
    
    rangesService.getRangeByAddress(rangeAddress)
      .then((rangeData) => {
        if (!rangeData) return;
        const newRange = new Range(rangeData);
        this.rootStore.rangesStore.setRanges([...this.rootStore.rangesStore.ranges, newRange]);
      });
  }

  prepareCompleteRangeInitialization = () => {
    const assets = this.range!.assets.map((t) => ({
      assetId: t.asset_id,
      share: new BN(t.share),
    }));
    const state = {
      assets,
      logo: this.range!.logo,
      title: this.range!.title,
      domain: this.range!.domain,
      step: 3,
      fileName: "–",
      fileSize: "–",
      maxStep: 3,
      swapFee: this.range!.swapFee,
    };
    localStorage.setItem("puzzle-custom-range", JSON.stringify(state));
  };
}
