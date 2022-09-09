import React from "react";
import { useStores } from "@stores";
import Button from "@components/Button";
import { observer } from "mobx-react-lite";
import Loading from "@components/Loading";
import { useLimitOrdersVM } from "@screens/TradeInterface/LimitOrdersVM";

interface IProps {}

const PlaceOrderBtn: React.FC<IProps> = () => {
  const { accountStore } = useStores();
  const vm = useLimitOrdersVM();
  const {
    price,
    token0,
    balance0,
    payment,
    loading,
    paymentSettings,
    finalAmount,
  } = vm;
  switch (true) {
    case accountStore.address == null:
      return (
        <Button onClick={() => accountStore.setLoginModalOpened(true)} fixed>
          Connect wallet
        </Button>
      );
    case loading:
      return (
        <Button disabled fixed>
          Loading <Loading />
        </Button>
      );
    case price == null || payment == null || price.eq(0):
      return (
        <Button disabled fixed>
          Enter an amount
        </Button>
      );
    case payment!.gt(balance0!) ||
      paymentSettings === 1 ||
      finalAmount.gt(balance0 ?? 0):
      return (
        <Button disabled fixed>
          Insufficient {`${token0?.symbol ?? ""} `}balance
        </Button>
      );
    default:
      return (
        <Button disabled fixed>
          Place order
        </Button>
      );
  }
};
export default observer(PlaceOrderBtn);
