import styled from "@emotion/styled";
import React from "react";
import Card from "@components/Card";
import SettingsHeader from "@screens/TradeInterface/Trade/SettingsHeader";
import SizedBox from "@components/SizedBox";
import Tokens from "./Tokens";
import Prices from "./Prices";
import MyOrders from "./MyOrders";
import useWindowSize from "@src/hooks/useWindowSize";
import { useSwapVM } from "@screens/TradeInterface/SwapVM";

interface IProps {}

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

const LimitOrders: React.FC<IProps> = ({ ...rest }) => {
  const { width } = useWindowSize();
  const { openedChart } = useSwapVM();
  return (
    <Root {...rest}>
      <Card
        style={{ position: "relative" }}
        paddingDesktop="16px 24px"
        paddingMobile="16px"
      >
        <SettingsHeader />
        <Tokens />
        <SizedBox height={16} />
        <Prices />
      </Card>
      <SizedBox height={40} />
      {((width && width < 880) || !openedChart) && <MyOrders />}
    </Root>
  );
};

export default LimitOrders;
