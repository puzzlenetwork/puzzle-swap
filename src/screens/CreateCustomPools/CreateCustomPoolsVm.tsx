import React, { useMemo } from "react";
import { useVM } from "@src/hooks/useVM";
import { action, makeAutoObservable } from "mobx";
import { RootStore, useStores } from "@stores";
import { IToken } from "@src/constants";
import BN from "@src/utils/BN";
import { sleep } from "@src/utils/sleep";
import {
  buildSuccessNFTSaleDialogParams,
  IDialogNotificationProps,
} from "@components/Dialog/DialogNotification";
import surf from "@src/assets/nfts/surf.png";

const ctx = React.createContext<CreateCustomPoolsVm | null>(null);

export const CreateCustomPoolsVMProvider: React.FC = ({ children }) => {
  const rootStore = useStores();
  const store = useMemo(() => new CreateCustomPoolsVm(rootStore), [rootStore]);
  return <ctx.Provider value={store}>{children}</ctx.Provider>;
};

export const useCreateCustomPoolsVM = () => useVM(ctx);

interface IPoolToken {
  asset: IToken;
  share: BN;
  locked: boolean;
}

interface IInitData {
  assets: { share: number; assetId: string; locked: boolean }[];
  share: BN;
  locked: boolean;
  logo: string | null;
  title: string;
  domain: string;
  maxStep: number | null;
  step: number | null;
  fileName: string | null;
  fileSize: string | null;
  swapFee: number;
}

class CreateCustomPoolsVm {
  public rootStore: RootStore;

  constructor(rootStore: RootStore) {
    this.rootStore = rootStore;
    let initData: IInitData | null = null;
    try {
      initData = JSON.parse(
        localStorage.getItem("puzzle-custom-pool") as string
      );
    } catch (error) {
      console.dir(error);
    }
    if (initData != null) {
      if (initData.assets != null) {
        const assetsData = initData.assets?.map(
          ({ assetId, share, locked }) => {
            const asset = rootStore.accountStore.TOKENS_ARRAY[assetId];
            return {
              share: new BN(share).times(10),
              locked,
              asset: asset,
            };
          }
        );
        this.poolsAssets = assetsData;
      }
      this.logo = initData.logo;
      this.swapFee = new BN(initData.swapFee).times(10);
      this.fileName = initData.fileName;
      this.title = initData.title;
      this.step = initData.step ?? 0;
      this.maxStep = initData.maxStep ?? 0;
      this.domain = initData.domain;
      makeAutoObservable(this);
    } else {
      this.poolsAssets = [
        {
          asset: rootStore.accountStore.TOKENS.PUZZLE,
          share: new BN(500),
          locked: false,
        },
      ];
    }
    setInterval(this.saveSettings, 1000);
  }

  loading: boolean = false;
  private _setLoading = (l: boolean) => (this.loading = l);

  maxStep: number = 0;
  step: number = 0;
  setStep = (s: number, jump = false) => {
    if (!jump) {
      this.maxStep = s;
    }
    this.step = s;
  };

  poolsAssets: IPoolToken[] = [];

  get totalTakenShare(): BN {
    return this.poolsAssets.reduce((acc, v) => acc.plus(v.share), BN.ZERO);
  }

  addAssetToPool = (assetId: string) => {
    const balances = this.rootStore.accountStore.assetBalances;
    const asset = balances?.find((b) => b.assetId === assetId);
    if (asset == null) return;
    this.poolsAssets.push({ asset: asset, share: BN.ZERO, locked: false });
    const unlockedPercent = this.poolsAssets.reduce(
      (acc, v) => (v.locked ? acc.minus(v.share) : acc),
      new BN(1000)
    );
    const unlockedCount = this.poolsAssets.reduce(
      (acc, v) => (!v.locked ? acc + 1 : acc),
      0
    );
    const averageUnlockedPercent = unlockedPercent.div(unlockedCount).div(10);
    this.poolsAssets.forEach((v, i) => {
      if (v.locked) return;
      const percent = Math.round(averageUnlockedPercent.toNumber() * 2) / 2;
      this.poolsAssets[i].share = new BN(percent).times(10);
    });
  };

  removeAssetFromPool = (assetId: string) => {
    const puzzle = this.rootStore.accountStore.TOKENS.PUZZLE;
    if (assetId === puzzle.assetId) return;
    const indexOfObject = this.poolsAssets.findIndex(
      ({ asset }) => asset.assetId === assetId
    );
    this.poolsAssets.splice(indexOfObject, 1);
  };
  changeAssetShareInPool = (assetId: string, share: BN) => {
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

  poolSettingError: boolean = false;
  setPoolSettingError = (v: boolean) => (this.poolSettingError = v);

  swapFee: BN = new BN(50);
  setSwapFee = (v: BN) => (this.swapFee = v);

  //logo details
  fileName: string | null = null;
  setFileName = (v: string | null) => (this.fileName = v);
  fileSize: string | null = null;
  setFileSize = (v: string | null) => (this.fileSize = v);
  logo: string | null = null;
  setLogo = (v: any) => (this.logo = v);

  public notificationParams: IDialogNotificationProps | null = null;
  public setNotificationParams = (params: IDialogNotificationProps | null) =>
    (this.notificationParams = params);

  get tokensToAdd() {
    const balances = this.rootStore.accountStore.assetBalances;
    if (balances == null) return [];
    const currentTokens = this.poolsAssets.reduce<string[]>(
      (acc, v) => [...acc, v.asset.assetId],
      []
    );
    return balances.filter((b) => !currentTokens.includes(b.assetId));
  }

  artefactToSpend: string | null = null;
  setArtefactToSpend = (v: string | null) => (this.fileName = v);

  doesUserHasArtifact = true;

  buyRandomArtefact = async () => {
    this._setLoading(true);
    await sleep(1000);
    this.setNotificationParams(
      buildSuccessNFTSaleDialogParams({ name: "Surf", picture: surf })
    );
    this._setLoading(false);
  };

  providedPercentOfPool: BN = new BN(100);
  @action.bound setProvidedPercentOfPool = (value: number) =>
    (this.providedPercentOfPool = new BN(value));

  maxToProvide: BN = new BN(0);
  _setMaxToProvide = (value: number) => (this.maxToProvide = new BN(value));

  get totalAmountToAddLiquidity(): string | null {
    return BN.ZERO.toFormat();
  }

  saveSettings = () => {
    const assets = this.poolsAssets.map((t) => ({
      assetId: t.asset.assetId,
      locked: t.locked,
      share: t.share.div(10).toNumber(),
    }));
    const state = {
      assets,
      logo: this.logo,
      title: this.title,
      domain: this.domain,
      step: this.step,
      fileName: this.fileName,
      fileSize: this.fileSize,
      maxStep: this.maxStep,
      swapFee: this.swapFee.div(10).toNumber(),
    };
    localStorage.setItem("puzzle-custom-pool", JSON.stringify(state));
  };

  provideLiquidityToPool = async () => {
    console.log("provideLiquidityToPool");
  };
}
