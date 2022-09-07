import styled from "@emotion/styled";
import React, { HTMLAttributes } from "react";
import { observer } from "mobx-react-lite";
import Swap from "./Swap";
import { useSwapVM } from "@screens/TradeInterface/SwapVM";
import LimitOrders from "./LimitOrders";

interface IProps extends HTMLAttributes<HTMLDivElement> {
  squareRef: any;
}

const Root = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
  padding: 0 16px;
  width: 100%;
  max-width: 560px;
`;

const Trade: React.FC<IProps> = ({ squareRef, ...rest }) => {
  const vm = useSwapVM();
  return (
    <Root {...rest}>
      {vm.activeAction === 0 && <Swap squareRef={squareRef} />}
      {vm.activeAction === 1 && <LimitOrders squareRef={squareRef} />}
    </Root>
  );
};
export default observer(Trade);
