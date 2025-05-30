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
  const { price, amount, amountError, loading, initialized, totalError } = vm;
  switch (true) {
    case accountStore.address == null:
      return (
        <Button onClick={() => accountStore.setLoginModalOpened(true)} fixed>
          Connect wallet
        </Button>
      );
    case !initialized:
      return (
        <Button fixed disabled>
          Place order
        </Button>
      );
    case loading:
      return (
        <Button disabled fixed>
          Transaction in progress <Loading />
        </Button>
      );
    case price == null || amount == null || price.eq(0) || amount.eq(0):
      return (
        <Button disabled fixed>
          Enter an amount
        </Button>
      );
    case amountError:
      return (
        <Button disabled fixed>
          Insufficient balance
        </Button>
      );
    case totalError:
      return (
        <Button disabled fixed>
          Insufficient balance
        </Button>
      );
    default:
      return (
        <Button fixed onClick={vm.createOrder}>
          Place order
        </Button>
      );
  }
};
export default observer(PlaceOrderBtn);
