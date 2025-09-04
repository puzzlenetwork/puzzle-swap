export interface IRangeTokenToStore {
  assetId: string;
  share: number;
  locked: boolean;
  leverage: number;
  initialPrice: number | undefined;
  maxSellOff: number | undefined;
}

export interface IInitDataToStore {
  assets: IRangeTokenToStore[];
  title: string;
  maxStep: number | null;
  step: number | null;
  swapFee: number;
  deployedContractAddress?: string;
}

export default function loadCreateRangeStateFromStorage() {
  let initData: IInitDataToStore | null = null;
  try {
    const storageData = localStorage.getItem("puzzle-custom-range");
    initData = storageData ? JSON.parse(storageData) : null;
  } catch (_) {}
  return initData;
}
