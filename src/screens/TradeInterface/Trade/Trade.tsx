import styled from "@emotion/styled";
import React, { HTMLAttributes, useState } from "react";
import Card from "@components/Card";
import { observer } from "mobx-react-lite";
import SettingsHeader from "./SettingsHeader";
import Settings from "./Swap/Settings";
import Swap from "./Swap";
import Limit from "./Limit";
import { useTradeVM } from "@screens/TradeInterface/TradeVM";

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
  const vm = useTradeVM();
  return (
    <Root {...rest}>
      {vm.activeAction === 0 && <Swap squareRef={squareRef} />}
      {vm.activeAction === 1 && <Limit />}
    </Root>
  );
};
export default observer(Trade);
