import styled from "@emotion/styled";
import React, { useMemo } from "react";
import Text from "@components/Text";
import Card from "@components/Card";
import SizedBox from "@components/SizedBox";
import { useRangeDetailsInterfaceVM } from "./RangeDetailsVM";
import { observer } from "mobx-react-lite";
import { Line, LineChart, Tooltip, XAxis } from "recharts";
import useWindowSize from "@src/hooks/useWindowSize";
import dayjs from "dayjs";
import BN from "@src/utils/BN";
import { Row } from "@src/components/Flex";
import Tabs from "@src/components/Tabs";
import Select from "@src/components/Select";

const PERIOD_LABELS: Record<"1d" | "7d" | "30d" | "90d" | "1y", string> = {
  "1d": "24h",
  "7d": "7D",
  "30d": "30D",
  "90d": "90D",
  "1y": "1Y"
};

const ChangePercentBadge = styled.span<{ positive: boolean }>`
  color: ${({ positive, theme }) => (positive ? theme.colors.success : theme.colors.error500)};
  font-size: 12px;
  font-weight: 500;
  padding: 2px 8px;
  border-radius: 6px;
  background: ${({ positive, theme }) =>
    positive ? (theme.colors.success ?? "#22c55e") + "18" : (theme.colors.error500 ?? "#ef4444") + "18"};
  white-space: nowrap;
`;

const PeriodsRow = styled(Row)`
  gap: 6px;
  flex-wrap: wrap;
  margin-top: 8px;
`;

interface IProps {}

const Root = styled.div<{ disabled?: boolean }>`
  display: flex;
  flex-direction: column;
  padding-top: 24px;
  transition: 0.4s;
  height: ${({ disabled }) => (disabled ? 0 : "auto")};
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
      return screenWidth - 66; // 16 * 4 + 2 ((padding) + 2 (border))
  }
};

const RangeCharts: React.FC<IProps> = () => {
  const vm = useRangeDetailsInterfaceVM();
  const { width: screenWidth } = useWindowSize();
  const chartWidth = screenWidth ? calcChartWidth(screenWidth) : 0;
  const isMobile = !!(screenWidth && screenWidth < 880);

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
    vm.setChartDataKey(["volume", "fees", "liquidity"][index] as "volume" | "fees" | "liquidity");
  };

  const timeRanges = [
    {
      key: "1d",
      title: "Last Day"
    },
    {
      key: "7d",
      title: "Last Week"
    },
    {
      key: "1m",
      title: "Last Month"
    },
    {
      key: "3m",
      title: "Last 3 Months"
    },
    {
      key: "1y",
      title: "Last Year"
    },
    {
      key: "all",
      title: "All Time"
    }
  ];

  const showExactTime = useMemo(() => {
    return vm.chartData && vm.chartData.length <= (24 * 8);
  }, [vm.chartData]);

  const periodsChange = vm.periodsChange;
  const hasAnyPeriodData = periodsChange.some(({ changePercent }) => !changePercent.eq(0));
  const showPeriodsChange = activeTab === 2 && hasAnyPeriodData;

  return (
    <Root disabled={vm.chartData == null || vm.chartData.length < 2}>
      <Row style={isMobile ? { flexDirection: "column", gap: 12 } : {}}>
        <Tabs
          tabs={[{ name: "Trades volume" }, { name: "Fees Earned" }, { name: "Total Liquidity" }]}
          textStyle={{ textWrap: "nowrap" }}
          activeTab={activeTab}
          setActive={handleChangeTab}
          style={{ borderBottom: "none" }}
        />
        {isMobile ? (
          <Card
            flexDirection="row"
            alignItems="center"
            paddingMobile="8px 12px"
            flexGrow={1}
            style={{ borderRadius: "8px" }}
          >
            <Select
              kind="text"
              textSize="medium"
              options={timeRanges}
              selected={timeRanges.find((v) => v.key === vm.chartDataRange)}
              onSelect={(v) => {
                vm.setChartDataRange(v.key as "1d" | "7d" | "1m" | "3m" | "1y" | "all");
              }}
              fullWidth
            />
          </Card>
        ) : (
          <Select
            kind="text"
            textSize="medium"
            options={timeRanges}
            selected={timeRanges.find((v) => v.key === vm.chartDataRange)}
            onSelect={(v) => {
              vm.setChartDataRange(v.key as "1d" | "7d" | "1m" | "3m" | "1y" | "all");
            }}
          />
        )}
      </Row>
      {showPeriodsChange && (
        <PeriodsRow>
          {periodsChange.map(({ period, changePercent }) => {
            const positive = changePercent.gte(0);
            const isZero = changePercent.eq(0);
            return (
              <ChangePercentBadge key={period} positive={positive}>
                {PERIOD_LABELS[period]}: {isZero ? "" : positive ? "+" : ""}
                {changePercent.toFormat(2)}%
              </ChangePercentBadge>
            );
          })}
        </PeriodsRow>
      )}
      <SizedBox height={8} />
      <Card>
        {activeTab !== 2 && (
          <Row>
            <Text type="secondary" size="medium" fitContent>
              Total for period:
            </Text>
            <SizedBox width={8} />
            <Text size="medium" fitContent>
              ${vm.chartTotal.toFormat(2)}
            </Text>
          </Row>
        )}
        <LineChart width={chartWidth} height={240} data={vm.chartData}>
          <XAxis
            tickLine={false}
            dataKey="time"
            tickFormatter={(date) => dayjs(date).format("MMM DD")}
            style={{ fill: "#8082c5" }}
          />
          <Tooltip
            labelFormatter={(date) => (
              // FIXME: raises hydration error because label uses <p></p>
              <Text type="secondary" size="small">
                {showExactTime
                  ? dayjs(date).format("dddd, MMM DD HH:mm")
                  : dayjs(date).format("dddd, MMM DD")}
              </Text>
            )}
            formatter={(value) => "$ " + new BN(`${value}`).toFormat(2)}
            itemStyle={{ border: "none" }}
            contentStyle={{
              border: "none",
              filter: "drop-shadow(0px 8px 24px rgba(54, 56, 112, 0.16))"
            }}
          />
          <Line dot={false} type="monotone" dataKey={vm.chartDataKey} stroke="#7075E9" strokeWidth={2} />
        </LineChart>
      </Card>
    </Root>
  );
};

export default observer(RangeCharts);
