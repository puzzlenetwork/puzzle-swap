import RootStore from "@stores/RootStore";
import { Signer } from "@waves/signer";
import { ProviderWeb } from "@waves.exchange/provider-web";
import { ProviderCloud } from "@waves.exchange/provider-cloud";
import { ProviderKeeper } from "@waves/provider-keeper";
import { NODE_URL, TOKENS_LIST } from "@src/constants";
import { ProviderMetamask } from "@waves/provider-metamask";
import { ProviderLedger } from "@waves/provider-ledger";
import { autorun, makeAutoObservable, reaction } from "mobx";
import Balance from "@src/entities/Balance";
import { getCurrentBrowser } from "@src/utils/getCurrentBrowser";
import BN from "@src/utils/BN";
import { nodeInteraction, waitForTx, broadcast } from "@waves/waves-transactions";
import nodeService from "@src/services/nodeService";
import { THEME_TYPE } from "@src/themes/ThemeProvider";
import centerEllipsis from "@src/utils/centerEllipsis";
import { wavesAddress2eth } from "@waves/node-api-js";
import { ProviderKeeperMobile } from "@keeper-wallet/provider-keeper-mobile";
import { ProviderAura } from "waves-provider-aura";
import { IDialogNotificationProps } from "@components/Dialog/DialogNotification";
import { getCustomPublicKey, getSmartAccountAddress, isBearMarketEnabled } from "@src/utils/userSettings";

export enum LOGIN_TYPE {
  SIGNER_SEED = "SIGNER_SEED",
  SIGNER_EMAIL = "SIGNER_EMAIL",
  KEEPER = "KEEPER",
  KEEPER_MOBILE = "KEEPER_MOBILE",
  LEDGER = "LEDGER",
  METAMASK = "METAMASK",
  AURA = "AURA"
}

export interface IInvokeTxParams {
  fee?: number;
  dApp: string;
  payment: Array<{ assetId: string | null; amount: string }>;
  call: {
    function: string;
    args: Array<{ type: "integer" | "string"; value: string } | { type: "boolean"; value: boolean }>;
  };
}

export interface ITransferParams {
  recipient: string;
  amount: string;
  assetId?: string | null;
  attachment?: string;
  feeAssetId?: string;
}

export interface ISerializedAccountStore {
  selectedTheme: THEME_TYPE | null;
  address: string | null;
  ethAddress: string | null;
  loginType: LOGIN_TYPE | null;
}

class AccountStore {
  public readonly rootStore: RootStore;

  constructor(rootStore: RootStore, initState?: ISerializedAccountStore) {
    this.rootStore = rootStore;
    makeAutoObservable(this);
    if (this.isBrowserSupportsWavesKeeper) {
      this.setupWavesKeeper();
    }
    if (initState) {
      initState.selectedTheme != null && (this.selectedTheme = initState.selectedTheme);
      this.setLoginType(initState.loginType);
      if (initState.loginType === LOGIN_TYPE.KEEPER) {
        this.setupSynchronizationWithKeeper().then();
      }
      if (initState.loginType === LOGIN_TYPE.METAMASK) {
        this.setupSynchronizationWithMetamask().then();
      }
      this.setAddress(initState.address);
      this.setEthAddress(initState.ethAddress);
    }
    Promise.all([this.checkScriptedAccount(), this.updateAccountAssets()]);
    setInterval(this.updateAccountAssets, 2 * 1000);
    setInterval(this.updateAccountAssets, 7 * 1000);
    setInterval(this.updateAccountAssets, 15 * 1000);
    reaction(
      () => this.address,
      () => Promise.all([this.checkScriptedAccount(), this.updateAccountAssets()])
    );
    reaction(
      () => this.smartAccountAddress,
      () => this.updateAccountAssets(true)
    );
  }

  selectedTheme: THEME_TYPE = THEME_TYPE.DARK_THEME;

  toggleTheme = (): void => {
    this.selectedTheme = this.selectedTheme === THEME_TYPE.LIGHT_THEME ? THEME_TYPE.DARK_THEME : THEME_TYPE.LIGHT_THEME;
  };

  bearMarketEnabled: boolean = isBearMarketEnabled();

  setBearMarketEnabled = (v: boolean) => {
    this.bearMarketEnabled = v;
  };

  // Colors for up/down price movements (inverted in bear market mode)
  get priceColors() {
    return {
      up: this.bearMarketEnabled ? "#ef5350" : "#26a69a",
      down: this.bearMarketEnabled ? "#26a69a" : "#ef5350",
      upAlt: this.bearMarketEnabled ? "#ED827E" : "#35A15A",
      downAlt: this.bearMarketEnabled ? "#35A15A" : "#ED827E"
    };
  }

  isAccScripted = false;
  setIsAccScripted = (v: boolean) => (this.isAccScripted = v);

  isWavesKeeperInstalled = false;
  setWavesKeeperInstalled = (state: boolean) => (this.isWavesKeeperInstalled = state);

  assetsBalancesLoading = false;
  setAssetsBalancesLoading = (state: boolean) => (this.assetsBalancesLoading = state);

  loginModalOpened: boolean = false;
  setLoginModalOpened = (state: boolean) => (this.loginModalOpened = state);

  walletModalOpened: boolean = false;
  setWalletModalOpened = (state: boolean) => (this.walletModalOpened = state);

  settingsSidebarOpened: boolean = false;
  setSettingsSidebarOpened = (state: boolean) => (this.settingsSidebarOpened = state);

  sendAssetModalOpened: boolean = false;
  setSendAssetModalOpened = (state: boolean) => (this.sendAssetModalOpened = state);

  assetToSend: Balance | null = null;
  setAssetToSend = (state: Balance | null) => (this.assetToSend = state);

  changePoolModalOpened: boolean = false;
  setChangePoolModalOpened = (state: boolean) => (this.changePoolModalOpened = state);

  public assetBalances: Balance[] | null = null;
  setAssetBalances = (assetBalances: Balance[] | null) => (this.assetBalances = assetBalances);

  findBalanceByAssetId = (assetId: string) =>
    this.assetBalances && this.assetBalances.find((balance) => balance.assetId === assetId);

  public address: string | null = null;
  setAddress = (address: string | null) => (this.address = address);

  // Smart account address (derived from custom public key in settings)
  public smartAccountAddress: string | null = getSmartAccountAddress();
  setSmartAccountAddress = (address: string | null) => (this.smartAccountAddress = address);

  // Returns smart account address if set, otherwise connected wallet address
  get effectiveAddress(): string | null {
    return this.smartAccountAddress ?? this.address;
  }

  public ethAddress: string | null = null;
  setEthAddress = (v: string | null) => (this.ethAddress = v);

  public loginType: LOGIN_TYPE | null = null;
  setLoginType = (loginType: LOGIN_TYPE | null) => (this.loginType = loginType);

  public signer: Signer | null = null;
  setSigner = (signer: Signer | null) => (this.signer = signer);

  get isBrowserSupportsWavesKeeper(): boolean {
    const browser = getCurrentBrowser();
    return ["chrome", "firefox", "opera", "edge"].includes(browser);
  }

  setupSynchronizationWithKeeper = () =>
    new Promise((resolve, reject) => {
      let attemptsCount = 0;
      const interval = setInterval(async () => {
        if ((window as any).WavesKeeper == null) {
          attemptsCount = attemptsCount + 1;
          if (attemptsCount > 10) {
            clearInterval(interval);
            reject("❌ There is no waves keeper");
          }
        } else {
          clearInterval(interval);
        }

        const result = await window?.WavesKeeper?.initialPromise
          .then((keeperApi: any) => keeperApi.publicState())
          .then(() => this.subscribeToKeeperUpdate())
          .catch(({ code }: { code: string }) => code === "14" && this.subscribeToKeeperUpdate());
        resolve(result);
      }, 500);
    });

  setupSynchronizationWithMetamask = () =>
    new Promise((resolve, reject) => {
      let attemptsCount = 0;
      const interval = setInterval(async () => {
        if (window?.ethereum == null) {
          attemptsCount = attemptsCount + 1;
          if (attemptsCount > 10) {
            clearInterval(interval);
            reject("❌ There is no Metamask");
          }
        } else {
          clearInterval(interval);
        }

        const result = await window?.ethereum.on("accountsChanged", (addresses: string[]) => {
          addresses.length > 0 && this.setEthAddress(addresses[0]);
          this.login(LOGIN_TYPE.METAMASK);
        });
        resolve(result);
      }, 500);
    });

  checkScriptedAccount = async () => {
    const { address } = this;
    if (address == null) return;
    const res = await nodeInteraction.scriptInfo(address, NODE_URL);
    this.setIsAccScripted(res.extraFee > 0);
  };

  login = async (loginType: LOGIN_TYPE) => {
    this.setLoginType(loginType);
    switch (loginType) {
      case LOGIN_TYPE.KEEPER_MOBILE:
        this.setSigner(new Signer());
        await this.signer?.setProvider(new ProviderKeeperMobile());
        break;
      case LOGIN_TYPE.METAMASK:
        this.setSigner(new Signer());
        await this.setupSynchronizationWithMetamask();
        await this.signer?.setProvider(new ProviderMetamask());
        break;
      case LOGIN_TYPE.LEDGER:
        this.setSigner(new Signer());
        await this.signer?.setProvider(new ProviderLedger());
        break;
      case LOGIN_TYPE.KEEPER:
        this.setSigner(new Signer());
        await this.setupSynchronizationWithKeeper();
        await this.signer?.setProvider(new ProviderKeeper());
        break;
      case LOGIN_TYPE.SIGNER_EMAIL:
        this.setSigner(new Signer());
        await this.signer?.setProvider(new ProviderCloud());
        break;
      case LOGIN_TYPE.SIGNER_SEED:
        this.setSigner(new Signer({ NODE_URL: NODE_URL }));
        const provider = new ProviderWeb("https://waves.exchange/signer/");
        await this.signer?.setProvider(provider);
        break;
      case LOGIN_TYPE.AURA:
        this.setSigner(new Signer());
        await this.signer?.setProvider(new ProviderAura());
        break;
      default:
        return;
    }
    const loginData = await this.signer?.login();
    if (loginType === LOGIN_TYPE.METAMASK && loginData != null) {
      const ethereumAddress = wavesAddress2eth(loginData.address);
      this.setEthAddress(ethereumAddress);
    }
    this.setAddress(loginData?.address ?? null);
    await this.updateAccountAssets();
  };

  async logout() {
    await this.signer?.logout();
    this.setSigner(null);
    this.setAddress(null);
    this.setEthAddress(null);
    this.setLoginType(null);
  }

  setupWavesKeeper = () => {
    let attemptsCount = 0;

    autorun(
      (reaction) => {
        if (attemptsCount === 2) {
          reaction.dispose();
        } else if ((window as any).WavesKeeper) {
          reaction.dispose();
          this.setWavesKeeperInstalled(true);
        } else {
          attemptsCount += 1;
        }
      },
      { scheduler: (run) => setInterval(run, 5 * 1000) }
    );
  };

  subscribeToKeeperUpdate = () =>
    (window as any).WavesKeeper.on("update", (publicState: any) => {
      const newAddress = publicState.account?.address ?? null;
      this.setAddress(newAddress);
    });

  serialize = (): ISerializedAccountStore => ({
    selectedTheme: this.selectedTheme,
    address: this.address,
    ethAddress: this.ethAddress,
    loginType: this.loginType
  });

  updateAccountAssets = async (force = false) => {
    if (this.address == null) {
      this.setAssetBalances([]);
      return;
    }
    if (!force && this.assetsBalancesLoading) return;
    this.setAssetsBalancesLoading(true);

    const address = this.effectiveAddress ?? this.address;
    const data = await nodeService.getAddressBalances(address);
    const assetBalances = TOKENS_LIST.map((asset) => {
      const t = data.find(({ assetId }) => asset.assetId === assetId);
      const balance = new BN(t != null ? t.balance : 0);

      const rate = this.rootStore.poolsStore.usdtRate(asset.assetId) ?? BN.ZERO;
      const usdnEquivalent = rate ? rate.times(BN.formatUnits(balance, asset.decimals)) : BN.ZERO;
      return new Balance({ balance, usdnEquivalent, ...asset });
    });
    const newEffectiveAddress = this.effectiveAddress;
    if (address !== newEffectiveAddress) return;

    this.setAssetBalances(assetBalances);
    this.setAssetsBalancesLoading(false);
    this.rootStore.rangesStore.syncInvestments();
  };

  ///------------------transfer

  public transfer = async (txParams: ITransferParams) => {
    switch (this.loginType) {
      case LOGIN_TYPE.LEDGER:
        return this.transferWithSigner(txParams, LOGIN_TYPE.LEDGER);
      case LOGIN_TYPE.SIGNER_SEED:
        return this.transferWithSigner(txParams, LOGIN_TYPE.SIGNER_SEED);
      case LOGIN_TYPE.SIGNER_EMAIL:
        return this.transferWithSigner(txParams, LOGIN_TYPE.SIGNER_EMAIL);
      case LOGIN_TYPE.KEEPER:
        return this.transferWithKeeper(txParams);
      case LOGIN_TYPE.KEEPER_MOBILE:
        return this.transferWithSigner(txParams, LOGIN_TYPE.KEEPER_MOBILE);
      case LOGIN_TYPE.METAMASK:
        return this.transferWithSigner(txParams, LOGIN_TYPE.METAMASK);
      case LOGIN_TYPE.AURA:
        return this.transferWithSigner(txParams, LOGIN_TYPE.AURA);
    }
    return null;
  };

  private transferWithSigner = async (data: ITransferParams, loginType: LOGIN_TYPE): Promise<string | null> => {
    if (loginType === LOGIN_TYPE.KEEPER_MOBILE) {
      this.showRequiredKeeperWalletMsg();
    }
    if (this.signer == null) {
      await this.login(this.loginType ?? loginType);
    }
    if (this.signer == null) {
      this.rootStore.notificationStore.notify("You need to login firstly", {
        title: "Error",
        type: "warning"
      });
      return null;
    }
    try {
      const ttx = this.signer.transfer({
        ...data,
        fee: this.isAccScripted ? 500000 : 100000
      });
      const txId = await ttx.broadcast().then((result: any) => (Array.isArray(result) ? result[0].id : result.id));
      await waitForTx(txId, {
        apiBase: NODE_URL
      });
      return txId;
    } catch (e: any) {
      this.rootStore.notificationStore.notify(e.toString(), {
        type: "warning",
        title: "Transaction is not completed"
      });
      return null;
    }
  };

  private executeKeeperTransaction = async (type: number, data: any): Promise<string> => {
    const customPublicKey = getCustomPublicKey();

    if (customPublicKey) {
      data.senderPublicKey = customPublicKey;
      const signedTx = await (window as any).WavesKeeper.signTransaction({ type, data });
      const parsedTx = JSON.parse(signedTx);
      const result = await broadcast(parsedTx, NODE_URL);
      await waitForTx(result.id, { apiBase: NODE_URL });
      return result.id;
    }

    const tx = await (window as any).WavesKeeper.signAndPublishTransaction({ type, data });
    const txId = JSON.parse(tx).id;
    await waitForTx(txId, { apiBase: NODE_URL });
    return txId;
  };

  private transferWithKeeper = async (data: ITransferParams): Promise<string | null> => {
    const tokenAmount = BN.formatUnits(data.amount, this.assetToSend?.decimals).toString();
    const txData = {
      amount: { tokens: tokenAmount, assetId: data.assetId },
      fee: { tokens: this.isAccScripted ? "0.005" : "0.001", assetId: "WAVES" },
      recipient: data.recipient
    };
    return this.executeKeeperTransaction(4, txData);
  };

  ///////////------------invoke

  public invoke = async (txParams: IInvokeTxParams) => {
    switch (this.loginType) {
      case LOGIN_TYPE.LEDGER:
        return this.invokeWithSigner(txParams, LOGIN_TYPE.LEDGER);
      case LOGIN_TYPE.SIGNER_SEED:
        return this.invokeWithSigner(txParams, LOGIN_TYPE.SIGNER_SEED);
      case LOGIN_TYPE.SIGNER_EMAIL:
        return this.invokeWithSigner(txParams, LOGIN_TYPE.SIGNER_EMAIL);
      case LOGIN_TYPE.KEEPER:
        return this.invokeWithKeeper(txParams);
      case LOGIN_TYPE.METAMASK:
        return this.invokeWithSigner(txParams, LOGIN_TYPE.METAMASK);
      case LOGIN_TYPE.KEEPER_MOBILE:
        return this.invokeWithSigner(txParams, LOGIN_TYPE.KEEPER_MOBILE);
      case LOGIN_TYPE.AURA:
        return this.invokeWithSigner(txParams, LOGIN_TYPE.AURA);
    }
    return null;
  };

  private invokeWithSigner = async (txParams: IInvokeTxParams, loginType: LOGIN_TYPE): Promise<string | null> => {
    if (loginType === LOGIN_TYPE.KEEPER_MOBILE) {
      this.showRequiredKeeperWalletMsg();
    }
    if (this.signer == null) {
      await this.login(this.loginType ?? loginType);
    }
    if (this.signer == null) {
      this.rootStore.notificationStore.notify("You need to login firstly", {
        title: "Error",
        type: "warning"
      });
      return null;
    }
    const ttx = this.signer.invoke({
      dApp: txParams.dApp,
      fee: txParams.fee ?? (this.isAccScripted ? 900000 : 500000),
      payment: txParams.payment,
      call: txParams.call
    });

    const txId = await ttx.broadcast().then((tx: any) => tx.id);
    await waitForTx(txId, { apiBase: NODE_URL });
    return txId;
  };

  private invokeWithKeeper = async (txParams: IInvokeTxParams): Promise<string | null> => {
    const data = {
      fee: { assetId: "WAVES", amount: txParams.fee ?? (this.isAccScripted ? 900000 : 500000) },
      dApp: txParams.dApp,
      call: txParams.call,
      payment: txParams.payment
    };
    return this.executeKeeperTransaction(16, data);
  };

  get balances() {
    const { accountStore } = this.rootStore;
    const allBalances = TOKENS_LIST.map((t, index) => {
      const balance = accountStore.findBalanceByAssetId(t.assetId);
      return { balance: balance ?? new Balance(t), originalIndex: index };
    });

    const withBalance = allBalances
      .filter(({ balance }) => balance.usdnEquivalent != null && balance.usdnEquivalent.gt(0))
      .sort((a, b) => a.balance.usdnEquivalent!.lt(b.balance.usdnEquivalent!) ? 1 : -1);

    const withoutBalance = allBalances
      .filter(({ balance }) => balance.usdnEquivalent == null || balance.usdnEquivalent.eq(0))
      .sort((a, b) => a.originalIndex - b.originalIndex);

    return [...withBalance, ...withoutBalance].map(({ balance }) => balance);
  }

  get addressToDisplay(): string {
    return this.ethAddress == null ? centerEllipsis(this.address ?? "", 6) : centerEllipsis(this.ethAddress ?? "", 10);
  }

  get signInMethod(): string {
    switch (this.loginType) {
      case LOGIN_TYPE.KEEPER_MOBILE:
        return "Keeper Mobile";
      case LOGIN_TYPE.SIGNER_SEED:
        return "Signer";
      case LOGIN_TYPE.KEEPER:
        return "Keeper";
      case LOGIN_TYPE.METAMASK:
        return "Metamask";
      case LOGIN_TYPE.AURA:
        return "Aura Wallet";
    }
    return "login";
  }

  public keeperWalletNotification: IDialogNotificationProps | null = null;
  public setKeeperWalletNotification = (params: IDialogNotificationProps | null) =>
    (this.keeperWalletNotification = params);

  showRequiredKeeperWalletMsg = () => {
    this.rootStore.notificationStore.notify("Please sign your transaction in Keeper Mobile App", {
      title: "Signature is required",
      type: "info",
      duration: 20
    });
  };

  getPublicKey = async (): Promise<string | null> => {
    // First check for custom public key in settings
    const customPublicKey = getCustomPublicKey();
    if (customPublicKey) {
      return customPublicKey;
    }

    // Try to get from WavesKeeper
    if (this.loginType === LOGIN_TYPE.KEEPER && (window as any).WavesKeeper) {
      try {
        const state = await (window as any).WavesKeeper.publicState();
        return state?.account?.publicKey ?? null;
      } catch {
        return null;
      }
    }

    return null;
  };
}

export default AccountStore;
