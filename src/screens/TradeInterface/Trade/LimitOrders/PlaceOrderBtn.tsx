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
  const { amount0, token0, balance0, amount1, loading } = vm;
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
          Transaction in progress <Loading />
        </Button>
      );
    case amount0 == null || amount1 == null || amount0.eq(0):
      return (
        <Button disabled fixed>
          Enter an amount
        </Button>
      );
    case amount0!.gt(balance0!):
      return (
        <Button disabled fixed>
          Insufficient {`${token0?.name ?? ""} `}balance
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
