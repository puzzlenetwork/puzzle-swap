import styled from "@emotion/styled";
import React, { useMemo } from "react";
import Text from "@components/Text";
import Card from "@components/Card";
import SizedBox from "@components/SizedBox";
import { useInvestToRangeInterfaceVM } from "./RangeDetailsVM";
import { observer } from "mobx-react-lite";
import { Line, LineChart, Tooltip, XAxis } from "recharts";
import useWindowSize from "@src/hooks/useWindowSize";
import dayjs from "dayjs";
import BN from "@src/utils/BN";
import poolsService from "@src/services/poolsService";
import { Row } from "@src/components/Flex";
import Tabs from "@src/components/Tabs";
import Select from "@src/components/Select";

interface IProps {}

const Root = styled.div<{ disabled?: boolean }>`
  display: flex;
  flex-direction: column;
  padding-top: 24px;
  transition: 0.4s;
  height: ${({ disabled }) => (disabled ? 0 : 320)}px;
  overflow: hidden;

  .recharts-tooltip-item-name,
  .recharts-tooltip-item-separator {
    display: none;
  }

  .recharts-cartesian-axis-tick {
    font-size: 12px;
    line-height: 16px;
  }

  .xAxis > line {
    stroke: #f1f2fe;
  }

  .recharts-tooltip-cursor {
    stroke: #7075e9;
  }
`;

const calcChartWidth = (screenWidth: number) => {
  switch (true) {
    case screenWidth > 1160 + 32:
      return 700;
    case screenWidth <= 1160 + 32 && screenWidth >= 880:
      return ((screenWidth - 32 - 40) / 3) * 2 - 50;
    case screenWidth < 880:
      return screenWidth - 82;
  }
};

const TradesVolume: React.FC<IProps> = () => {
  const vm = useInvestToRangeInterfaceVM();
  const { width: screenWidth } = useWindowSize();
  const chartWidth = screenWidth ? calcChartWidth(screenWidth) : 0;

  const activeTab = useMemo(() => {
    switch (vm.chartDataKey) {
      case "volume":
        return 0;
      case "fees":
        return 1;
      case "liquidity":
        return 2;
    }
  }, [vm.chartDataKey]);

  const handleChangeTab = (index: number) => {
    vm.setChartDataKey(["volume", "fees", "liquidity"][index] as ("volume" | "fees" | "liquidity"));
  }

  const timeRanges = [
    {
      key: "1d",
      title: "Last Day",
    },
    {
      key: "7d",
      title: "Last Week",
    },
    {
      key: "1m",
      title: "Last Month",
    },
    {
      key: "3m",
      title: "Last 3 Months",
    },
    {
      key: "1y",
      title: "Last Year",
    },
    {
      key: "all",
      title: "All Time",
    },
  ]

  return (
    <Root
      disabled={
        vm.chartData == null ||
        vm.chartData.length < 2
      }
    >
      <Row>
        <Tabs
          tabs={[
            { name: "Trades volume" },
            { name: "Fees Earned" },
            { name: "Total Liquidity" },
          ]}
          activeTab={activeTab}
          setActive={handleChangeTab}
          style={{ borderBottom: "none" }}
        />
        <Select
          kind="text"
          textSize="medium"
          options={timeRanges}
          selected={timeRanges.find((v) => v.key === "all")}
          onSelect={(v) => {
            
          }}
        />
      </Row>
      <SizedBox height={8} />
      <Card style={{ height: 288 }}>
        <Row>
          <Text type="secondary" size="medium" fitContent>Total for period:</Text>
          <SizedBox width={8} />
          <Text size="medium" fitContent>${ vm.chartTotal.toFormat(2) }</Text>
        </Row>
        <LineChart width={chartWidth} height={240} data={vm.chartData}>
          <XAxis
            tickLine={false}
            dataKey="time"
            tickFormatter={(date) => dayjs(date).format("MMM DD")}
            style={{ fill: "#8082c5" }}
          />
          <Tooltip
            labelFormatter={(date) => (
              <Text type="secondary" size="small">
                {dayjs(date).format("dddd, MMM DD")}
              </Text>
            )}
            formatter={(value) => "$ " + new BN(`${value}`).toFormat(2)}
            itemStyle={{ border: "none" }}
            contentStyle={{
              border: "none",
              filter: "drop-shadow(0px 8px 24px rgba(54, 56, 112, 0.16))",
            }}
          />
          <Line
            dot={false}
            type="monotone"
            dataKey={vm.chartDataKey}
            stroke="#7075E9"
            strokeWidth={2}
          />
        </LineChart>
      </Card>
    </Root>
  );
};

export default observer(TradesVolume);
