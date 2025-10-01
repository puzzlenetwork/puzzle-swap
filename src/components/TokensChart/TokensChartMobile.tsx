import React from "react";
import { observer } from "mobx-react-lite";
import SizedBox from "@components/SizedBox";
import ChartAgeButtons from "@components/ChartAgeButtons";
import { IToken } from "@src/constants";
import TokensChart from "@components/TokensChart/TokensChart";
import TradingViewChart from "@components/TokensChart/TradingViewChart";
import ChartTypeSwitcher from "@components/ChartTypeSwitcher";
import Dialog from "@components/Dialog";
import { TokenChartVMProvider, useTokenChartVM } from "@components/TokensChart/TokenChartVM";
import LearnMoreTokenChartButtons from "@components/TokensChart/LearnMoreTokenChartButtons";
import { useSwapVM } from "@screens/Trade/SwapVM";

interface IProps {
  token0: IToken;
  token1: IToken;
  visible: boolean;
  onClose: () => void;
}

const TokensChartMobileImpl: React.FC<IProps> = observer(({ ...rest }) => {
  const vm = useTokenChartVM();
  const swapVm = useSwapVM();
  return (
    <Dialog
      onClose={rest.onClose}
      styles={{
        body: { maxHeight: "70vh", overflowY: "auto" }
      }}
      visible={rest.visible}
      title={`${rest.token0.symbol}/${rest.token1.symbol}`}
    >
      <ChartTypeSwitcher 
        chartType={swapVm.chartType} 
        onToggle={swapVm.setChartType} 
      />
      <SizedBox height={16} />
      {swapVm.chartType === "standard" ? (
        <TokensChart {...(rest as any)} />
      ) : (
        <TradingViewChart />
      )}
      <SizedBox height={24} />
      <ChartAgeButtons className="age-btns" value={vm.selectedChartPeriod} onChange={vm.setSelectedChartPeriod} />
      <SizedBox height={24} />
      <LearnMoreTokenChartButtons />
      <SizedBox height={24} />
    </Dialog>
  );
});

const TokensChartMobile: React.FC<IProps> = (props) => (
  <TokenChartVMProvider assetId0={props.token0.assetId} assetId1={props.token1.assetId}>
    <TokensChartMobileImpl {...props} />
  </TokenChartVMProvider>
);

export default TokensChartMobile;
