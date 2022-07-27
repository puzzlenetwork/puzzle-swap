import styled from "@emotion/styled";
import React from "react";
import { observer, Observer } from "mobx-react-lite";
import Layout from "@components/Layout";
import { TradeVMProvider, useTradeVM } from "@screens/TradeInterface/TradeVM";
import TokensChart from "@components/TokensChart";
import Swap from "./Swap";
import useElementSize from "@src/hooks/useElementSize";
import useWindowSize from "@src/hooks/useWindowSize";
import Dialog from "@components/Dialog";

const Root = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  margin-bottom: 24px;
  margin-top: 40px;
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
              <TokensChart
                height={height}
                token0={vm.token0}
                token1={vm.token1}
                visible={vm.openedChart}
              />
            )}
            {width && width <= 880 && (
              <Dialog visible={vm.openedChart}>
                <TokensChart
                  height={height}
                  token0={vm.token0}
                  token1={vm.token1}
                  visible={vm.openedChart}
                />
              </Dialog>
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
