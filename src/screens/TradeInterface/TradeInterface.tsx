import styled from "@emotion/styled";
import React from "react";
import SizedBox from "@components/SizedBox";
import { Observer } from "mobx-react-lite";
import Layout from "@components/Layout";
import { TradeVMProvider } from "@screens/TradeInterface/TradeVM";
import TokensChart from "@screens/TradeInterface/TokensChart";
import Swap from "./Swap";

const Root = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  margin-bottom: 24px;
  margin-top: 40px;
`;

const TradeInterfaceImpl: React.FC = () => {
  return (
    <Layout>
      <Observer>
        {() => (
          <Root>
            <TokensChart />
            <SizedBox width={24} />
            <Swap />
          </Root>
        )}
      </Observer>
    </Layout>
  );
};

const TradeInterface: React.FC = () => (
  <TradeVMProvider>
    <TradeInterfaceImpl />
  </TradeVMProvider>
);
export default TradeInterface;
