import styled from "@emotion/styled";
import React from "react";
import Card from "@components/Card";
import { Row } from "@components/Flex";
import Text from "@components/Text";
import { observer } from "mobx-react-lite";
import SizedBox from "@components/SizedBox";
import ChartAgeButtons from "@components/ChartAgeButtons";
import { IToken } from "@src/constants";
import TokensChart from "@components/TokensChart/TokensChart";
import TradingViewChart, { useTradingViewChartAvailability } from "@components/TokensChart/TradingViewChart";
import ChartTypeSwitcher from "@components/ChartTypeSwitcher";
import { TokenChartVMProvider, useTokenChartVM } from "@components/TokensChart/TokenChartVM";
import LearnMoreTokenChartButtons from "@components/TokensChart/LearnMoreTokenChartButtons";
import MyOrders from "@screens/Trade/Trade/LimitOrders/MyOrders";
import { useSwapVM } from "@screens/Trade/SwapVM";
import useCollapse from "@components/Collapse";

interface IProps {
  token0: IToken;
  token1: IToken;
  visible: boolean;
  height: number;
}

const Root = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  max-width: 660px;
  box-sizing: border-box;
  padding: 0 8px 0 16px;

  .icon {
    cursor: pointer;
    transition: 0.4s;
  }

  .age-btns {
    max-width: 296px;
  }
`;

const TokensChartDesktopImpl: React.FC<IProps> = observer(({ height, ...rest }) => {
  const { getCollapseProps } = useCollapse({
    isExpanded: rest.visible,
    showDuration: 500,
    hideDuration: 0
  });
  const vm = useTokenChartVM();
  const swapVm = useSwapVM();
  const { hasChartData } = useTradingViewChartAvailability();
  return (
    <Root {...getCollapseProps()}>
      <Card style={{ height }}>
        <Row alignItems="center" justifyContent="space-between">
          <Row alignItems="center">
            <Text weight={500} fitContent>{`${rest.token1.symbol}/${rest.token0.symbol}`}</Text>
            <SizedBox width={16} />
            {hasChartData && (
              <ChartTypeSwitcher 
                chartType={swapVm.chartType} 
                onToggle={swapVm.setChartType} 
              />
            )}
          </Row>
          <Row alignItems="center">
            <ChartAgeButtons className="age-btns" value={vm.selectedChartPeriod} onChange={vm.setSelectedChartPeriod} />
          </Row>
        </Row>
        {swapVm.chartType === "standard" || !hasChartData ? (
          <TokensChart {...(rest as any)} />
        ) : (
          <TradingViewChart height={height - 60} />
        )}
      </Card>
      <SizedBox height={16} />
      <LearnMoreTokenChartButtons />
      <SizedBox height={40} />
      {swapVm.activeAction === 1 && <MyOrders />}
    </Root>
  );
});

const TokensChartDesktop: React.FC<IProps> = (props) => (
  <TokenChartVMProvider assetId0={props.token0.assetId} assetId1={props.token1.assetId}>
    <TokensChartDesktopImpl {...props} />
  </TokenChartVMProvider>
);

export default TokensChartDesktop;
