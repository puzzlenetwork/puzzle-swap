import { ISerializedRootFilterStore, ISerializedRootStore } from "@stores/RootStore";

export const loadState = (): ISerializedRootStore | undefined => {
  try {
    const state = JSON.parse(
      localStorage.getItem("puzzle-surf-store") as string
    );
    return state || undefined;
  } catch (error) {
    console.dir(error);
    return undefined;
  }
};
export const saveState = (state: ISerializedRootStore): void => {
  localStorage.setItem("puzzle-surf-store", JSON.stringify(state));
};


export const loadStateFilters = (): ISerializedRootFilterStore | undefined => {
  try {
    const state = JSON.parse(
      localStorage.getItem("puzzle-filters") as string
    );
    return state || undefined;
  } catch (error) {
    console.dir(error);
    return undefined;
  }
};
export const saveStateFilters = (state: ISerializedRootFilterStore): void => {
  localStorage.setItem("puzzle-filters", JSON.stringify(state));
};
