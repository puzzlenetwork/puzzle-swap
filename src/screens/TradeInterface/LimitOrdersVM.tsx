import React, { useMemo } from "react";
import { makeAutoObservable, reaction } from "mobx";
import { RootStore, useStores } from "@stores";
import { useVM } from "@src/hooks/useVM";
import BN from "@src/utils/BN";
import {
  CONTRACT_ADDRESSES,
  EXPLORER_URL,
  TOKENS_BY_SYMBOL,
} from "@src/constants";
import makeNodeRequest from "@src/utils/makeNodeRequest";
import nodeService, { INodeData } from "@src/services/nodeService";
import { getStateByKey } from "@src/utils/getStateByKey";
import {
  buildCancelOrderParams,
  IDialogNotificationProps,
} from "@components/Dialog/DialogNotification";
import aggregatorService from "@src/services/aggregatorService";
import dayjs from "dayjs";
import {slice} from "lodash";

interface IProps {
  children: React.ReactNode;
}

const ctx = React.createContext<LimitOrdersVM | null>(null);

export const LimitOrdersVMProvider: React.FC<IProps> = ({ children }) => {
  const rootStore = useStores();
  const store = useMemo(() => new LimitOrdersVM(rootStore), [rootStore]);
  return <ctx.Provider value={store}>{children}</ctx.Provider>;
};

export const useLimitOrdersVM = () => useVM(ctx);

const getOrderStateKeys = (orderId: string) => [
  `order_${orderId}_amount0`,
  `order_${orderId}_token0`,
  `order_${orderId}_amount1`,
  `order_${orderId}_token1`,
  `order_${orderId}_fulfilled0`,
  `order_${orderId}_fulfilled1`,
  `order_${orderId}_status`,
  `order_${orderId}_timestamp`,
  `order_${orderId}_txId`,
];

export interface IOrder {
  id: string;
  amount0: BN;
  token0: string;
  amount1: BN;
  token1: string;
  txId: string;
  fulfilled0: BN;
  fulfilled1: BN;
  timestamp: number;
  status: "active" | "closed" | "canceled";
}

class LimitOrdersVM {
  constructor(private rootStore: RootStore) {
    makeAutoObservable(this);
    this.setLoading(true);
    const params = new URLSearchParams(window.location.search);
    const asset0 = params.get("asset0")?.toString();
    const asset1 = params.get("asset1")?.toString();
    this.assetId0 = asset0 ?? TOKENS_BY_SYMBOL.XTN.assetId;
    this.assetId1 = asset1 ?? TOKENS_BY_SYMBOL.PUZZLE.assetId;
    this.sync().then(() => {
      this.setInitialized(true);
      this.setLoading(false);
    });
    setInterval(this.sync, 60 * 1000);

    reaction(() => this.priceSettings, this.getMarketPrice);
    reaction(() => this.rootStore.accountStore?.address, this.sync);
  }

  orders: Array<IOrder> = [];
  setOrders = (orders: Array<IOrder>) => (this.orders = orders);

  assetId0: string = TOKENS_BY_SYMBOL.XTN.assetId;
  setAssetId0 = (assetId: string) => (this.assetId0 = assetId);

  get isMarketPrice() {
    return BN.ZERO;
  }

  assetId1: string = TOKENS_BY_SYMBOL.PUZZLE.assetId;
  setAssetId1 = (assetId: string) => (this.assetId1 = assetId);

  amountSettings: 0 | 1 = 0;
  toggleAmountSettings = () =>
    (this.amountSettings = this.amountSettings === 0 ? 1 : 0);

  priceSettings: 0 | 1 = 0;
  togglePriceSettings = () =>
    (this.priceSettings = this.priceSettings === 0 ? 1 : 0);

  get amountToken() {
    return this.amountSettings === 0 ? this.token0 : this.token1;
  }

  get priceToken() {
    return this.priceSettings === 0 ? this.token1 : this.token0;
  }

  get totalToken() {
    return this.amountSettings === 0 ? this.token1 : this.token0;
  }

  price: BN = BN.ZERO;
  setPrice = (price: BN, sync?: boolean) => {
    this.price = price;
    if (this.amount.gt(0) && price.gt(0) && sync) {
      const v1 = BN.formatUnits(price, this.priceToken.decimals);
      const v2 = BN.formatUnits(this.amount, this.amountToken.decimals);
      const as = this.amountSettings;
      const ps = this.priceSettings;
      if ((as === 1 && ps === 1) || (as === 0 && ps === 0)) {
        this.setTotal(BN.parseUnits(v2.times(v1), this.totalToken.decimals));
      }
      if ((as === 1 && ps === 0) || (as === 0 && ps === 1)) {
        this.setTotal(BN.parseUnits(v2.div(v1), this.totalToken.decimals));
      }
    }
  };

  amount: BN = BN.ZERO;
  setAmount = (amount: BN, sync?: boolean) => {
    this.amount = amount;
    if (this.price.gt(0) && amount.gt(0) && sync) {
      const v1 = BN.formatUnits(this.price, this.priceToken.decimals);
      const v2 = BN.formatUnits(amount, this.amountToken.decimals);
      const as = this.amountSettings;
      const ps = this.priceSettings;
      if ((as === 0 && ps === 0) || (as === 1 && ps === 1)) {
        this.setTotal(BN.parseUnits(v2.times(v1), this.totalToken.decimals));
      }
      if ((as === 0 && ps === 1) || (as === 1 && ps === 0)) {
        this.setTotal(BN.parseUnits(v2.div(v1), this.totalToken.decimals));
      }
    }
  };

  total: BN = BN.ZERO;
  setTotal = (total: BN, sync?: boolean) => {
    this.total = total;
    if (this.amount.gt(0) && this.price.gt(0) && sync) {
      const v1 = BN.formatUnits(this.price, this.priceToken.decimals);
      const v2 = BN.formatUnits(total, this.totalToken.decimals);
      const as = this.amountSettings;
      const ps = this.priceSettings;
      if ((as === 0 && ps === 0) || (as === 1 && ps === 0)) {
        this.setAmount(BN.parseUnits(v2.div(v1), this.amountToken.decimals));
      }
      if ((as === 1 && ps === 1) || (as === 0 && ps === 1)) {
        this.setAmount(BN.parseUnits(v2.times(v1), this.amountToken.decimals));
      }
    }
  };

  initialized: boolean = false;
  private setInitialized = (l: boolean) => (this.initialized = l);

  loading: boolean = true;
  private setLoading = (l: boolean) => (this.loading = l);

  marketPriceLoading: boolean = false;
  private setMarketPriceLoading = (l: boolean) => (this.marketPriceLoading = l);

  switchTokens = () => {
    const assetId0 = this.assetId0;
    this.setAssetId0(this.assetId1);
    this.setPrice(BN.ZERO);
    this.setAmount(BN.ZERO);
    this.setAssetId1(assetId0);
  };

  public notificationParams: IDialogNotificationProps | null = null;
  public setNotificationParams = (params: IDialogNotificationProps | null) =>
    (this.notificationParams = params);

  orderToDisplayDetails: IOrder | null = null;
  setOrderToDisplayDetails = (v: IOrder | null) =>
    (this.orderToDisplayDetails = v);

  sync = async () => {
    if (this.rootStore.accountStore == null) return;
    const data = await nodeService.nodeKeysRequest(
      CONTRACT_ADDRESSES.limitOrders,
      `user_${this.rootStore.accountStore.address}_orders`
    );
    if (data.length === 0) return;
    const orderIdList: string[] = data[0].value.toString().split(",");
    if (orderIdList.length === 0) return;

    const keys = orderIdList.reduce(
      (acc, id) => [...acc, ...getOrderStateKeys(id)],
      [] as string[]
    );
    const ordersData: INodeData[] = await makeNodeRequest(
      `/addresses/data/${CONTRACT_ADDRESSES.limitOrders}`,
      { postData: { keys: slice(keys, 0, 1000) } }
    )
      .then(async ({ data }) => {
        if (keys.length < 1000) {
          console.log("less than 1000 data keys");
          return data
        } else {
          console.log("more than 1000 data keys");
          return await makeNodeRequest(
              `/addresses/data/${CONTRACT_ADDRESSES.limitOrders}`,
              { postData: { keys: slice(keys, 1000, 2000) } }
          ).then((resp => {
            const res = data.concat(resp.data);
            return res;
          })
          ).catch(() => data);
        }
      })
      .catch(() => []);

    const orders = orderIdList.map((id) => ({
      id,
      txId: getStateByKey(ordersData, `order_${id}_txId`) ?? "",
      amount0: new BN(getStateByKey(ordersData, `order_${id}_amount0`) ?? 0),
      token0: getStateByKey(ordersData, `order_${id}_token0`) ?? "",
      timestamp: getStateByKey(ordersData, `order_${id}_timestamp`) ?? 0,
      amount1: new BN(getStateByKey(ordersData, `order_${id}_amount1`) ?? 0),
      token1: getStateByKey(ordersData, `order_${id}_token1`) ?? "",
      fulfilled0: new BN(
        getStateByKey(ordersData, `order_${id}_fulfilled0`) ?? 0
      ),
      fulfilled1: new BN(
        getStateByKey(ordersData, `order_${id}_fulfilled1`) ?? 0
      ),
      status: getStateByKey(ordersData, `order_${id}_status`) ?? "closed",
    }));
    this.setOrders(orders as IOrder[]);
  };

  get token0() {
    return this.rootStore.accountStore.balances.find(
      ({ assetId }) => assetId === this.assetId0
    )!;
  }

  get balance0() {
    return this.token0?.balance;
  }

  get balance1() {
    return this.token1?.balance;
  }

  get token1() {
    return this.rootStore.accountStore.balances.find(
      ({ assetId }) => assetId === this.assetId1
    )!;
  }

  createOrder = async () => {
    if (this.price.eq(0) || this.amount.eq(0)) return;
    if (this.amountError || this.totalError) return;
    this.setLoading(true);

    return this.rootStore.accountStore
      .invoke({
        dApp: CONTRACT_ADDRESSES.limitOrders,
        payment: [
          { assetId: this.amountToken.assetId, amount: this.amount.toFixed(0) },
        ],
        call: {
          function: "createOrder",
          args: [
            { type: "string", value: this.totalToken.assetId },
            { type: "integer", value: this.total.toFixed(0).toString() },
          ],
        },
      })
      .then(
        (txId) =>
          txId &&
          this.rootStore.notificationStore.notify(
            `You can find your active orders in orders history`,
            {
              type: "success",
              title: `Order has been placed`,
              link: `${EXPLORER_URL}/tx/${txId}`,
              linkTitle: "View on Explorer",
            }
          )
      )
      .then(() => this.sync())
      .then(() => {
        this.setPrice(BN.ZERO);
        this.setAmount(BN.ZERO);
      })
      .catch((e) =>
        this.rootStore.notificationStore.notify(e.message ?? e.toString(), {
          type: "error",
        })
      )
      .finally(() => this.setLoading(false));
  };

  cancelOrder = async (orderId: string) => {
    this.setLoading(true);
    this.setNotificationParams(null);
    this.setOrderToDisplayDetails(null);
    return this.rootStore.accountStore
      .invoke({
        payment: [],
        dApp: CONTRACT_ADDRESSES.limitOrders,
        call: {
          function: "cancelOrder",
          args: [
            { type: "string", value: orderId },
            { type: "string", value: "" },
          ],
        },
      })
      .then(
        (txId) =>
          txId &&
          this.rootStore.notificationStore.notify(
            `You can find your cancelled orders in orders history`,
            {
              type: "success",
              title: `Order has been cancelled`,
              link: `${EXPLORER_URL}/tx/${txId}`,
              linkTitle: "View on Explorer",
            }
          )
      )
      .then(() => this.sync())
      .catch((e) =>
        this.rootStore.notificationStore.notify(e.message ?? e.toString(), {
          type: "error",
        })
      )
      .finally(() => this.setLoading(false));
  };

  cancelAllOrders = async () => {
    this.setLoading(true);
    const activeOrders = this.orders.filter(
      ({ status }) => status === "active"
    );
    if (activeOrders.length === 0) return;
    const ordersToCancel = activeOrders.map(({ id }) => id).join(",");
    this.setNotificationParams(null);
    return this.rootStore.accountStore
      .invoke({
        payment: [],
        dApp: CONTRACT_ADDRESSES.proxyLimitOrders,
        call: {
          function: "cancelMany",
          args: [{ type: "string", value: ordersToCancel }],
        },
      })
      .then(
        (txId) =>
          txId &&
          this.rootStore.notificationStore.notify(
            `You can find your cancelled orders in orders history`,
            {
              type: "success",
              title: `Orders has been cancelled`,
              link: `${EXPLORER_URL}/tx/${txId}`,
              linkTitle: "View on Explorer",
            }
          )
      )
      .then(() => this.sync())
      .then(() => this.setLoading(false))
      .catch((e) =>
        this.rootStore.notificationStore.notify(e.message ?? e.toString(), {
          type: "error",
        })
      )
      .finally(() => this.setLoading(false));
  };

  checkOrderCancel = async (id?: string, many?: boolean) => {
    this.setNotificationParams(
      buildCancelOrderParams({
        onOrderCancel: () =>
          many ? this.cancelAllOrders() : this.cancelOrder(id ?? ""),
        many,
        onCancel: () => this.setNotificationParams(null),
      })
    );
  };

  checkOrderDetails = (id?: string, many?: boolean) => {
    this.setNotificationParams(
      buildCancelOrderParams({
        onOrderCancel: () =>
          many ? this.cancelAllOrders() : this.cancelOrder(id ?? ""),
        many,
        onCancel: () => this.setNotificationParams(null),
      })
    );
  };

  groupedOrders(opened?: boolean) {
    const orders = opened
      ? this.orders.filter((v) => v.status === "active")
      : this.orders.filter((v) => v.status !== "active");
    const sorted = orders
      .slice()
      .sort((a, b) => (a.timestamp < b.timestamp ? 1 : -1));
    if (sorted.length === 0) return {};
    return sorted.reduce((acc, order) => {
      const day = dayjs(order.timestamp)
        .startOf("day")
        .format("MMM DD, YYYY")
        .toString();
      Array.isArray(acc[day]) ? acc[day].push(order) : (acc[day] = [order]);
      return acc;
    }, {} as Record<string, Array<IOrder>>);
  }

  get isThereOpenedOrders() {
    return this.orders.filter((v) => v.status === "active").length > 0;
  }

  onPercentClick = (percent: number) => {
    const balance = this.amountSettings === 0 ? this.balance0 : this.balance1;
    const amount = new BN(percent).times(balance ?? 1).div(100);
    this.setAmount(amount, true);
  };

  get amountDollEq() {
    const v = this.rootStore.poolsStore
      .usdtRate(this.amountToken.assetId)
      ?.times(this.amount);
    if (v == null) return "$ 0.00";
    return `$ ${BN.formatUnits(v, this.amountToken.decimals).toFormat(2)}`;
  }

  get priceDollEq() {
    const v = this.rootStore.poolsStore
      .usdtRate(this.priceToken.assetId)
      ?.times(this.price);
    if (v == null) return "$ 0.00";
    return `$ ${BN.formatUnits(v, this.priceToken.decimals).toFormat(2)}`;
  }

  get totalDollEq() {
    const v = this.rootStore.poolsStore
      .usdtRate(this.totalToken.assetId)
      ?.times(this.total);
    if (v == null) return "$ 0.00";
    return `$ ${BN.formatUnits(v, this.totalToken.decimals).toFormat(2)}`;
  }

  get amountError() {
    if (this.rootStore.accountStore.address == null) return false;
    if (this.amount.eq(0) || this.price.eq(0)) return false;
    return this.amountSettings === 0 && this.amount.gt(this.balance0 ?? 0);
  }

  get totalError() {
    if (this.rootStore.accountStore.address == null) return false;
    if (this.amount.eq(0) || this.price.eq(0)) return false;
    return this.amountSettings === 1 && this.amount.gt(this.balance1 ?? 0);
  }

  get finalAmount(): BN {
    if (this.price.eq(0) || this.amount.eq(0)) return BN.ZERO;
    const v1 = BN.formatUnits(this.price, this.token1.decimals);
    const v2 = BN.formatUnits(this.amount, this.token0.decimals);
    return BN.parseUnits(v2.times(v1), this.token1.decimals);
  }

  getMarketPrice = async () => {
    this.setMarketPriceLoading(true);
    const token = this.priceSettings === 0 ? this.token0 : this.token1;
    const res = await aggregatorService.calc(
      this.priceSettings === 0 ? this.assetId0 : this.assetId1,
      this.priceSettings === 0 ? this.assetId1 : this.assetId0,
      BN.parseUnits(1, token.decimals)
    );
    this.setPrice(new BN(res.estimatedOut), true);
    this.setMarketPriceLoading(false);
  };
}
