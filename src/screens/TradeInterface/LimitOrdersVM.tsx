import React, { useMemo } from "react";
import { makeAutoObservable, reaction, when } from "mobx";
import { RootStore, useStores } from "@stores";
import { useVM } from "@src/hooks/useVM";
import BN from "@src/utils/BN";
import {
  CONTRACT_ADDRESSES,
  EXPLORER_URL,
  TOKENS_BY_SYMBOL,
} from "@src/constants";
import makeNodeRequest from "@src/utils/makeNodeRequest";
import { INodeData } from "@src/services/nodeService";
import { getStateByKey } from "@src/utils/getStateByKey";
import {
  buildCancelOrderParams,
  IDialogNotificationProps,
} from "@components/Dialog/DialogNotification";
import aggregatorService from "@src/services/aggregatorService";
import dayjs from "dayjs";

const ctx = React.createContext<LimitOrdersVM | null>(null);

export const LimitOrdersVMProvider: React.FC = ({ children }) => {
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
    this.assetId0 = asset0 ?? TOKENS_BY_SYMBOL.USDN.assetId;
    this.assetId1 = asset1 ?? TOKENS_BY_SYMBOL.PUZZLE.assetId;
    this.sync().then(() => {
      this.setInitialized(true);
      this.setLoading(false);
    });
    setInterval(this.sync, 60 * 1000);

    reaction(() => this.rootStore.accountStore?.address, this.sync);
    when(() => this.priceSettings === 1, this.getMarketPrice);
  }

  orders: Array<IOrder> = [];
  setOrders = (orders: Array<IOrder>) => (this.orders = orders);

  assetId0: string = TOKENS_BY_SYMBOL.USDN.assetId;
  setAssetId0 = (assetId: string) => (this.assetId0 = assetId);

  get isMarketPrice() {
    return BN.ZERO;
  }

  price: BN = BN.ZERO;
  setPrice = (amount: BN) => (this.price = amount);

  assetId1: string = TOKENS_BY_SYMBOL.PUZZLE.assetId;
  setAssetId1 = (assetId: string) => (this.assetId1 = assetId);

  payment: BN = BN.ZERO;
  setPayment = (amount: BN) => (this.payment = amount);

  initialized: boolean = false;
  private setInitialized = (l: boolean) => (this.initialized = l);

  loading: boolean = true;
  private setLoading = (l: boolean) => (this.loading = l);

  marketPriceLoading: boolean = false;
  private setMarketPriceLoading = (l: boolean) => (this.marketPriceLoading = l);

  priceSettings: 0 | 1 = 0;
  setPriceSettings = (value: 0 | 1) => (this.priceSettings = value);

  paymentSettings: 0 | 1 = 0;
  setPaymentSettings = (value: 0 | 1) => (this.paymentSettings = value);

  switchTokens = () => {
    const assetId0 = this.assetId0;
    this.setAssetId0(this.assetId1);
    this.setAssetId1(assetId0);
  };

  public notificationParams: IDialogNotificationProps | null = null;
  public setNotificationParams = (params: IDialogNotificationProps | null) =>
    (this.notificationParams = params);

  orderToDisplayDetails: IOrder | null = null;
  setOrderToDisplayDetails = (v: IOrder | null) =>
    (this.orderToDisplayDetails = v);

  sync = async () => {
    const orderIdList: string[] = await makeNodeRequest(
      `/addresses/data/${CONTRACT_ADDRESSES.limitOrders}/user_${this.rootStore.accountStore.address}_orders`
    )
      .then(({ data }) => data.value.split(","))
      .catch(() => []);
    if (orderIdList.length === 0) return;

    const keys = orderIdList.reduce(
      (acc, id) => [...acc, ...getOrderStateKeys(id)],
      [] as string[]
    );
    const ordersData: INodeData[] = await makeNodeRequest(
      `/addresses/data/${CONTRACT_ADDRESSES.limitOrders}`,
      { postData: { keys } }
    )
      .then(({ data }) => data)
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

  makePriceFromMarket = () => {
    const marketPriceOfToken0 = this.rootStore.poolsStore.t2tPrice(
      this.assetId0,
      this.assetId1
    );
    this.setPrice(marketPriceOfToken0);
  };

  createOrder = async () => {
    if (this.price.eq(0) || this.payment.eq(0)) return;
    const paymentAmount =
      this.paymentSettings === 0 ? this.payment : this.finalAmount;
    const paymentToken = this.token1;

    const requiredAmount =
      this.paymentSettings === 0 ? this.finalAmount : this.payment;
    const requiredToken = this.token0;
    this.setLoading(true);
    await this.rootStore.accountStore
      .invoke({
        dApp: CONTRACT_ADDRESSES.limitOrders,
        payment: [
          { assetId: paymentToken.assetId, amount: paymentAmount.toString() },
        ],
        call: {
          function: "createOrder",
          args: [
            { type: "string", value: requiredToken.assetId },
            { type: "integer", value: requiredAmount.toString() },
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
              title: `Order has been placed`,
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
      );
    this.setLoading(false);
  };

  cancelOrder = async (orderId: string) => {
    this.setLoading(true);
    this.setNotificationParams(null);
    this.setOrderToDisplayDetails(null);
    await this.rootStore.accountStore
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
      );

    this.setLoading(false);
  };

  cancelAllOrders = async () => {
    this.setLoading(true);
    const activeOrders = this.orders.filter(
      ({ status }) => status === "active"
    );
    if (activeOrders.length === 0) return;
    const ordersToCancel = activeOrders.map(({ id }) => id).join(",");
    this.setNotificationParams(null);
    await this.rootStore.accountStore
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
      .catch((e) =>
        this.rootStore.notificationStore.notify(e.message ?? e.toString(), {
          type: "error",
        })
      );
    this.setLoading(false);
  };

  checkOrderCancel = (id?: string, many?: boolean) => {
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
      const day = dayjs(order.timestamp).startOf("day").toDate().getUTCDate();
      Array.isArray(acc[day]) ? acc[day].push(order) : (acc[day] = [order]);
      return acc;
    }, {} as Record<number, Array<IOrder>>);
  }

  get isThereOpenedOrders() {
    return this.orders.filter((v) => v.status === "active").length > 0;
  }

  onPercentClick = (percent: number) => {
    const amount = new BN(percent).times(this.balance1 ?? 1).div(100);
    this.setPayment(amount);
  };

  get dollEq0() {
    const v = this.rootStore.poolsStore
      .usdnRate(this.assetId0)
      ?.times(this.price);
    if (v == null) return "$ 0.00";
    return `$ ${BN.formatUnits(v, this.token0.decimals).toFormat(2)}`;
  }

  get paymentError1() {
    if (this.rootStore.accountStore.address == null) return false;
    if (this.payment.eq(0) || this.price.eq(0)) return false;
    return (
      this.paymentSettings === 1 && this.finalAmount.gt(this.balance1 ?? 0)
    );
  }

  get paymentError0() {
    if (this.rootStore.accountStore.address == null) return false;
    if (this.payment.eq(0) || this.price.eq(0)) return false;
    return this.paymentSettings === 0 && this.payment.gt(this.balance1 ?? 0);
  }

  get dollEq1() {
    const token = this.paymentSettings === 0 ? this.token1 : this.token0;
    const v = this.rootStore.poolsStore
      .usdnRate(token.assetId)
      ?.times(this.payment);
    if (v == null) return "$ 0.00";
    return `$ ${BN.formatUnits(v, token.decimals).toFormat(2)}`;
  }

  get finalAmount(): BN {
    if (this.price.eq(0) || this.payment.eq(0)) return BN.ZERO;
    if (this.paymentSettings === 0) {
      const v1 = BN.formatUnits(this.price, this.token1.decimals);
      const v2 = BN.formatUnits(this.payment, this.token0.decimals);
      return BN.parseUnits(v1.times(v2), this.token0.decimals);
    } else if (this.paymentSettings === 1) {
      const v1 = BN.formatUnits(this.price, this.token0.decimals);
      const v2 = BN.formatUnits(this.payment, this.token1.decimals);
      return BN.parseUnits(v2.div(v1), this.token1.decimals);
    }
    return BN.ZERO;
  }

  getMarketPrice = async () => {
    this.setMarketPriceLoading(true);
    const res = await aggregatorService.calc(
      this.assetId1,
      this.assetId0,
      BN.parseUnits(1, this.token1.decimals)
    );
    this.setPrice(new BN(res.estimatedOut));
    this.setPriceSettings(0);
    this.setMarketPriceLoading(false);
  };
}
