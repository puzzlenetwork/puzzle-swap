import styled from "@emotion/styled";
import React from "react";
import { observer, Observer } from "mobx-react-lite";
import Layout from "@components/Layout";
import useWindowSize from "@src/hooks/useWindowSize";
import { TokensChartDesktop, TokensChartMobile } from "@components/TokensChart";
import { SwapVMProvider, useSwapVM } from "@screens/Trade/SwapVM";
import { LimitOrdersVMProvider } from "@screens/Trade/LimitOrdersVM";
import Swap from "@screens/Trade/Trade/Swap";
import LimitOrders from "@screens/Trade/Trade/LimitOrders";
import SwapHistoryDesktop from "@screens/Trade/Trade/Swap/SwapHistoryDesktop";
import SwapHistoryMobile from "@screens/Trade/Trade/Swap/SwapHistoryMobile";

const Root = styled.div`
  display: flex;
  width: 100%;
  flex-direction: row;
  justify-content: center;
  margin-bottom: 24px;
  margin-top: 40px;
  @media (min-width: 880px) {
    margin-top: 56px;
  }
`;
const Container = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  max-width: 592px;
`;
const TradeImpl: React.FC = observer(() => {
  const vm = useSwapVM();
  const { width } = useWindowSize();
  return (
    <Layout>
      <Observer>
        {() => (
          <Root>
            {width && width > 880 && (
              <TokensChartDesktop height={485} token0={vm.token0} token1={vm.token1} visible={vm.openedChart} />
            )}
            {width && width <= 880 && (
              <TokensChartMobile
                token0={vm.token0}
                token1={vm.token1}
                visible={vm.openedChart}
                onClose={() => vm.setOpenedChart(false)}
              />
            )}
            <Container>
              {vm.activeAction === 0 && <Swap />}
              {vm.activeAction === 1 && <LimitOrders />}
            </Container>
            {width && width > 880 && vm.activeAction === 0 && (
              <SwapHistoryDesktop visible={vm.openedHistory} />
            )}
            {width && width <= 880 && vm.activeAction === 0 && (
              <SwapHistoryMobile
                visible={vm.openedHistory}
                onClose={() => vm.setOpenedHistory(false)}
              />
            )}
          </Root>
        )}
      </Observer>
    </Layout>
  );
});

const Trade: React.FC = () => (
  <SwapVMProvider>
    <LimitOrdersVMProvider>
      <TradeImpl />
    </LimitOrdersVMProvider>
  </SwapVMProvider>
);
export default Trade;
