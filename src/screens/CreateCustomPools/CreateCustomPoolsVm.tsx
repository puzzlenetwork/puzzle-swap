import React, { useMemo } from "react";
import { useVM } from "@src/hooks/useVM";
import { makeAutoObservable } from "mobx";
import { RootStore, useStores } from "@stores";
import { IToken } from "@src/constants";

const ctx = React.createContext<CreateCustomPoolsVm | null>(null);

export const CreateCustomPoolsVMProvider: React.FC = ({ children }) => {
  const rootStore = useStores();
  const store = useMemo(() => new CreateCustomPoolsVm(rootStore), [rootStore]);
  return <ctx.Provider value={store}>{children}</ctx.Provider>;
};

export const useCreateCustomPoolsVM = () => useVM(ctx);

interface IPoolToken {
  asset: IToken;
  share: number;
  locked: boolean;
}

class CreateCustomPoolsVm {
  public rootStore: RootStore;

  maxStep: number = 0;
  step: number = 0;
  setStep = (s: number, jump = false) => {
    if (!jump) {
      this.maxStep = s;
    }
    this.step = s;
  };

  poolsAssets: IPoolToken[] = [];

  addAssetToPool = (assetId: string) => {
    const balances = this.rootStore.accountStore.assetBalances;
    const asset = balances?.find((b) => b.assetId === assetId);
    if (asset == null) return;
    const totalTakenShare = this.poolsAssets.reduce(
      (acc, v) => acc + v.share,
      0
    );
    let share = 10;
    if (totalTakenShare < 100) {
      share = 100 - this.poolsAssets.reduce((acc, v) => acc + v.share, 0);
    } else {
      const notFixedValues = this.poolsAssets.reduce<{
        totalShare: number;
        amount: number;
      }>(
        (acc, item) => {
          if (!item.locked) {
            return {
              totalShare: acc.totalShare + item.share,
              amount: acc.amount + 1,
            };
          }
          return acc;
        },
        { totalShare: 0, amount: 0 }
      );
      share = notFixedValues.totalShare / (notFixedValues.amount + 1);
      this.poolsAssets.forEach((item, index) => {
        if (!item.locked) {
          this.poolsAssets[index].share = share;
        }
      });
    }
    this.poolsAssets.push({ asset, share, locked: false });
  };
  removeAssetFromPool = (assetId: string) => {
    const puzzle = this.rootStore.accountStore.TOKENS.PUZZLE;
    if (assetId === puzzle.assetId) return;
    const indexOfObject = this.poolsAssets.findIndex(
      ({ asset }) => asset.assetId === assetId
    );
    this.poolsAssets.splice(indexOfObject, 1);
  };
  changeAssetShareInPool = (assetId: string, share: number) => {
    const indexOfObject = this.poolsAssets.findIndex(
      ({ asset }) => asset.assetId === assetId
    );
    this.poolsAssets[indexOfObject].share = share;
  };
  changeAssetInShareInPool = (oldAssetId: string, newAssetId: string) => {
    const indexOfObject = this.poolsAssets.findIndex(
      ({ asset }) => asset.assetId === oldAssetId
    );
    const balances = this.rootStore.accountStore.assetBalances;
    const asset = balances?.find((b) => b.assetId === newAssetId);
    if (asset == null) return;
    this.poolsAssets[indexOfObject].asset = asset;
  };
  updateLockedState = (assetId: string, val: boolean) => {
    const indexOfObject = this.poolsAssets.findIndex(
      ({ asset }) => asset.assetId === assetId
    );
    this.poolsAssets[indexOfObject].locked = val;
  };

  title: string = "";
  setTitle = (v: string) => (this.title = v);

  domain: string = "";
  setDomain = (v: string) => (this.domain = v);

  swapFee: number = 0.5;
  setSwapFee = (v: number) => (this.swapFee = v);

  //logo details
  fileName: string | null = null;
  setFileName = (v: string | null) => (this.fileName = v);
  fileSize: string | null = null;
  setFileSize = (v: string | null) => (this.fileSize = v);
  logo: string | null = null;
  setLogo = (v: any) => (this.logo = v);

  constructor(rootStore: RootStore) {
    this.rootStore = rootStore;
    this.poolsAssets = [
      { asset: rootStore.accountStore.TOKENS.PUZZLE, share: 50, locked: false },
    ];
    makeAutoObservable(this);
  }

  get canContinue() {
    switch (this.step) {
      case 0:
        return true;
      case 1:
        return true;
      case 2:
        return true;
      default:
        return false;
    }
  }

  get tokensToAdd() {
    const balances = this.rootStore.accountStore.assetBalances;
    if (balances == null) return [];
    const currentTokens = this.poolsAssets.reduce<string[]>(
      (acc, v) => [...acc, v.asset.assetId],
      []
    );
    return balances.filter((b) => !currentTokens.includes(b.assetId));
  }
}
