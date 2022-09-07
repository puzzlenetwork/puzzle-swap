import styled from "@emotion/styled";
import React from "react";
import { useLimitOrdersVM } from "@screens/TradeInterface/LimitOrdersVM";
import { observer } from "mobx-react-lite";
import Order from "./Order";

interface IProps {}

const Root = styled.div`
  display: flex;
  flex-direction: column;
`;

const OpenedOrders: React.FC<IProps> = () => {
  const vm = useLimitOrdersVM();
  return (
    <Root>
      {vm.orders.map((v) => (
        <Order {...v} key={`order_${v.id}`} />
      ))}
    </Root>
  );
};
export default observer(OpenedOrders);
