export interface IRangeTokenToStore {
  assetId: string;
  share: number;
  locked: boolean;
  initialPrice: number;
}

export interface IInitDataToStore {
  assets: IRangeTokenToStore[];
  share: string;
  locked: boolean;
  title: string;
  maxStep: number | null;
  step: number | null;
  swapFee: number;
}

export default function loadCreateRangeStateFromStorage() {
  let initData: IInitDataToStore | null = null;
  try {
    const storageData = localStorage.getItem("puzzle-custom-range");
    initData = storageData ? JSON.parse(storageData) : null;
  } catch (_) {}
  return initData;
}
