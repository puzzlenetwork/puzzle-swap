import styled from "@emotion/styled";
import React, { HTMLAttributes } from "react";
import Card from "@components/Card";
import SettingsHeader from "@screens/TradeInterface/Trade/SettingsHeader";
import SizedBox from "@components/SizedBox";
import Tokens from "./Tokens";
import Prices from "./Prices";
import MyOrders from "./MyOrders";

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

const LimitOrders: React.FC<IProps> = ({ squareRef, ...rest }) => {
  return (
    <Root {...rest}>
      <Card
        ref={squareRef}
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
      <MyOrders />
    </Root>
  );
};

export default LimitOrders;
