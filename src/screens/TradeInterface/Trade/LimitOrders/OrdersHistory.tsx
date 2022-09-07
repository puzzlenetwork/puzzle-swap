import styled from "@emotion/styled";
import { observer } from "mobx-react-lite";
import React from "react";

interface IProps {}

const Root = styled.div`
  display: flex;
  flex-direction: column;
`;

const OrdersHistory: React.FC<IProps> = () => {
  return <Root></Root>;
};
export default observer(OrdersHistory);
