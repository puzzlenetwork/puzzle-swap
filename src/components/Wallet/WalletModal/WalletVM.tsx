import React, { useMemo } from "react";
import { useVM } from "@src/hooks/useVM";
import { makeAutoObservable } from "mobx";
import { RootStore, useStores } from "@stores";
import copy from "copy-to-clipboard";
import Balance from "@src/entities/Balance";
import BN from "@src/utils/BN";
import { ROUTES, TOKENS_LIST } from "@src/constants";

interface IProps {
  children: React.ReactNode;
}

const ctx = React.createContext<WalletVM | null>(null);

export const WalletVMProvider: React.FC<IProps> = ({ children }) => {
  const rootStore = useStores();
  const store = useMemo(() => new WalletVM(rootStore), [rootStore]);
  return <ctx.Provider value={store}>{children}</ctx.Provider>;
};

export const useWalletVM = () => useVM(ctx);

class WalletVM {
  rootStore: RootStore;

  headerExpanded: boolean = true;
  setHeaderExpanded = (state: boolean) => (this.headerExpanded = state);

  constructor(rootStore: RootStore) {
    this.rootStore = rootStore;
    makeAutoObservable(this);
  }

  handleCopyAddress = () => {
    const { accountStore, notificationStore } = this.rootStore;
    if (accountStore.address) {
      copy(accountStore.address ?? "");
      notificationStore.notify("Your address was copied", {
        type: "success",
        title: "Congratulations!",
      });
    } else {
      notificationStore.notify("There is no address", { type: "error" });
    }
  };

  handleLogOut = async () =>
    Promise.all([
      this.rootStore.accountStore.setWalletModalOpened(false),
      this.rootStore.accountStore.setAssetBalances(null),
      this.rootStore.accountStore.setAddress(null),
      this.rootStore.accountStore.setLoginType(null),
      this.rootStore.stakeStore.setStakedAccountPuzzle(null),
    ]);

  get signInInfo() {
    const { signInMethod, addressToDisplay } = this.rootStore.accountStore;
    return `${signInMethod}: ${addressToDisplay}`;
  }

  get balances() {
    const { accountStore } = this.rootStore;
    return TOKENS_LIST.map((t) => {
      const balance = accountStore.findBalanceByAssetId(t.assetId);
      return balance ?? new Balance(t);
    })
      .filter(({ balance }) => balance && !balance.eq(0))
      .sort((a, b) => {
        if (a.usdnEquivalent == null && b.usdnEquivalent == null) return 0;
        if (a.usdnEquivalent == null && b.usdnEquivalent != null) return 1;
        if (a.usdnEquivalent == null && b.usdnEquivalent == null) return -1;
        return a.usdnEquivalent!.lt(b.usdnEquivalent!) ? 1 : -1;
      });
  }

  get totalInvestmentAmount() {
    const { balances } = this.rootStore.accountStore;
    const balancesAmount = balances.reduce(
      (acc, b) => acc.plus(b.usdnEquivalent ?? 0),
      BN.ZERO
    );
    return balancesAmount.plus(BN.ZERO).toFormat(2);
  }

  get investments() {
    const { poolsStore, stakeStore } = this.rootStore;
    const poolsData =
      poolsStore.investedInPools
        ?.filter(({ liquidityInUsdt }) => !liquidityInUsdt.eq(0))
        .map(
          ({
            pool,
            addressStaked,
            indexTokenRate,
            liquidityInUsdt,
            indexTokenName,
          }) => {
            const amount = BN.formatUnits(addressStaked, 8);
            return {
              onClickPath: `/pools/${pool.domain}/invest`,
              logo: pool?.logo,
              name: pool?.title,
              amount:
                (amount.gte(0.0001) ? amount.toFormat(4) : amount.toFormat(8)) +
                indexTokenName,
              nuclearValue: indexTokenRate,
              usdnEquivalent: liquidityInUsdt,
            };
          }
        ) ?? [];
    const stakedNftData = this.stakedNfts.map(
      ({ imageLink, marketPrice, name }) => {
        return {
          onClickPath: ROUTES.ULTRASTAKE,
          logo: imageLink,
          amount: "1 NFT",
          name,
          nuclearValue: new BN(marketPrice ?? 0),
          usdnEquivalent: new BN(marketPrice ?? 0),
        };
      }
    );
    return [...stakedNftData, ...poolsData, ...stakeStore.puzzleWallet].sort(
      (a, b) => (a.usdnEquivalent.gt(b.usdnEquivalent) ? -1 : 1)
    );
  }

  get stakedNfts() {
    const { nftStore } = this.rootStore;
    return nftStore.stakedAccountNFTs ?? [];
  }
}
