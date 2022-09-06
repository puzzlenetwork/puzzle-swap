import styled from "@emotion/styled";
import React from "react";
import { observer, Observer } from "mobx-react-lite";
import Layout from "@components/Layout";
import { TradeVMProvider, useTradeVM } from "@screens/TradeInterface/TradeVM";
import useElementSize from "@src/hooks/useElementSize";
import useWindowSize from "@src/hooks/useWindowSize";
import { TokensChartDesktop, TokensChartMobile } from "@components/TokensChart";
import Swap from "@screens/TradeInterface/Trade/Swap";

const Root = styled.div`
  display: flex;
  width: 100%;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  margin-bottom: 24px;
  margin-top: 40px;
  @media (min-width: 880px) {
    margin-top: 56px;
  }
`;

const TradeInterfaceImpl: React.FC = observer(() => {
  const vm = useTradeVM();
  const [squareRef, { height }] = useElementSize();
  const { width } = useWindowSize();
  return (
    <Layout>
      <Observer>
        {() => (
          <Root>
            {width && width > 880 && (
              <TokensChartDesktop
                height={height + 18}
                token0={vm.token0}
                token1={vm.token1}
                visible={vm.openedChart}
              />
            )}
            {width && width <= 880 && (
              <TokensChartMobile
                token0={vm.token0}
                token1={vm.token1}
                visible={vm.openedChart}
                onClose={() => vm.setOpenedChart(false)}
              />
            )}
            <Swap squareRef={squareRef} />
          </Root>
        )}
      </Observer>
    </Layout>
  );
});

const TradeInterface: React.FC = () => (
  <TradeVMProvider>
    <TradeInterfaceImpl />
  </TradeVMProvider>
);
export default TradeInterface;
