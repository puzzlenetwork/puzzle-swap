import styled from "@emotion/styled";
import React from "react";
import { observer } from "mobx-react-lite";
import { usePoolInvestVM } from "./PoolInvestVM";
import Card from "@src/components/Card";
import Text from "@src/components/Text";
import SizedBox from "@components/SizedBox";
import { Row, Column } from "@src/components/Flex";
import BN from "@src/utils/BN";
import dayjs from "dayjs";
import Skeleton from "react-loading-skeleton";
import { Area, AreaChart, Tooltip, XAxis, YAxis, ResponsiveContainer } from "recharts";
import useWindowSize from "@src/hooks/useWindowSize";

const PERIODS = ["1d", "7d", "30d", "90d", "1y"] as const;
type TPeriod = (typeof PERIODS)[number];

const PERIOD_LABELS: Record<TPeriod, string> = {
  "1d": "24h",
  "7d": "7D",
  "30d": "30D",
  "90d": "90D",
  "1y": "1Y"
};

const Root = styled.div`
  display: flex;
  flex-direction: column;
  padding-top: 24px;
`;

const TabsRow = styled(Row)`
  gap: 4px;
  margin-bottom: 12px;
`;

const Tab = styled.button<{ active?: boolean }>`
  border: 1px solid ${({ theme, active }) => (active ? theme.colors.primary300 : theme.colors.primary100)};
  background: ${({ theme, active }) => (active ? theme.colors.primary300 : "transparent")};
  color: ${({ theme, active }) => (active ? "#fff" : theme.colors.primary800)};
  border-radius: 8px;
  padding: 4px 12px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    border-color: ${({ theme }) => theme.colors.primary300};
  }
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
  margin-bottom: 12px;

  @media (min-width: 560px) {
    grid-template-columns: repeat(4, 1fr);
  }
`;

const StatCard = styled(Card)`
  padding: 10px 14px;
  @media (min-width: 560px) {
    padding: 12px 16px;
  }
`;

const ChangeValue = styled.span<{ positive: boolean }>`
  color: ${({ positive, theme }) => (positive ? theme.colors.success : theme.colors.error500)};
  font-size: 18px;
  line-height: 24px;
  font-weight: 500;
`;

const ChangePercent = styled.span<{ positive: boolean }>`
  color: ${({ positive, theme }) => (positive ? theme.colors.success : theme.colors.error500)};
  font-size: 13px;
  font-weight: 500;
  padding: 2px 6px;
  border-radius: 6px;
  background: ${({ positive, theme }) =>
    positive ? (theme.colors.success ?? "#22c55e") + "18" : (theme.colors.error500 ?? "#ef4444") + "18"};
`;

const ChartCard = styled(Card)`
  padding: 12px 8px 8px;
  @media (min-width: 560px) {
    padding: 16px 16px 8px;
  }

  .recharts-cartesian-axis-tick {
    font-size: 11px;
    line-height: 14px;
  }

  .recharts-tooltip-cursor {
    stroke: #7075e9;
    stroke-dasharray: 4 4;
  }
`;

const calcChartWidth = (screenWidth: number): number => {
  if (screenWidth > 1160 + 32) return 698;
  if (screenWidth >= 880) return ((screenWidth - 32 - 40) / 3) * 2 - 48;
  return screenWidth - 82;
};

const formatUsd = (value: BN): string => {
  if (value.abs().gte(1_000_000)) {
    return "$" + value.div(1_000_000).toFormat(2) + "M";
  }
  if (value.abs().gte(1_000)) {
    return "$" + value.div(1_000).toFormat(2) + "K";
  }
  return "$" + value.toFormat(2);
};

const LiquidityFlow: React.FC = () => {
  const vm = usePoolInvestVM();
  const { width: screenWidth } = useWindowSize();
  const chartWidth = screenWidth ? calcChartWidth(screenWidth) : 0;

  const { history, change, changePercent, current, previous } = vm.liquidityFlowData;
  const isPositive = change.gte(0);
  const hasData = history.length >= 2;

  const chartData = history.map((h) => ({
    time: h.time * 1000,
    liquidity: h.liquidity
  }));

  const allPeriodsData = PERIODS.map((period) => {
    const sorted = [...vm.history]
      .filter((h) => h.liquidity != null && h.liquidity > 0)
      .sort((a, b) => a.time - b.time);

    if (sorted.length < 2) return { period, change: BN.ZERO, changePercent: BN.ZERO };

    const now = sorted[sorted.length - 1].time;
    const days: Record<string, number> = { "1d": 1, "7d": 7, "30d": 30, "90d": 90, "1y": 365 };
    const cutoff = now - days[period] * 86400;
    const filtered = sorted.filter((h) => h.time >= cutoff);

    if (filtered.length < 2) return { period, change: BN.ZERO, changePercent: BN.ZERO };

    const cur = new BN(filtered[filtered.length - 1].liquidity);
    const prev = new BN(filtered[0].liquidity);
    const ch = cur.minus(prev);
    const pct = prev.gt(0) ? ch.times(100).div(prev) : BN.ZERO;

    return { period, change: ch, changePercent: pct };
  });

  if (vm.history.length === 0) {
    return null;
  }

  return (
    <Root>
      <Row alignItems="center" style={{ justifyContent: "space-between", marginBottom: 12 }}>
        <Text weight={500} type="secondary" fitContent>
          Liquidity Flow
        </Text>
        <TabsRow>
          {PERIODS.map((p) => (
            <Tab key={p} active={vm.liquidityFlowPeriod === p} onClick={() => vm.setLiquidityFlowPeriod(p)}>
              {PERIOD_LABELS[p]}
            </Tab>
          ))}
        </TabsRow>
      </Row>

      <StatsGrid>
        <StatCard>
          <Text type="secondary" size="small">
            Current Liquidity
          </Text>
          <SizedBox height={4} />
          {hasData ? (
            <Text style={{ fontSize: "18px", lineHeight: "24px" }} weight={500}>
              {formatUsd(current)}
            </Text>
          ) : (
            <Skeleton height={24} />
          )}
        </StatCard>

        <StatCard>
          <Text type="secondary" size="small">
            {PERIOD_LABELS[vm.liquidityFlowPeriod]} ago
          </Text>
          <SizedBox height={4} />
          {hasData ? (
            <Text style={{ fontSize: "18px", lineHeight: "24px" }} weight={500}>
              {formatUsd(previous)}
            </Text>
          ) : (
            <Skeleton height={24} />
          )}
        </StatCard>

        <StatCard>
          <Text type="secondary" size="small">
            Net Change
          </Text>
          <SizedBox height={4} />
          {hasData ? (
            <ChangeValue positive={isPositive}>
              {isPositive ? "+" : ""}
              {formatUsd(change)}
            </ChangeValue>
          ) : (
            <Skeleton height={24} />
          )}
        </StatCard>

        <StatCard>
          <Text type="secondary" size="small">
            Change %
          </Text>
          <SizedBox height={4} />
          {hasData ? (
            <Row alignItems="center" style={{ gap: 6 }}>
              <ChangePercent positive={isPositive}>
                {isPositive ? "+" : ""}
                {changePercent.toFormat(2)}%
              </ChangePercent>
            </Row>
          ) : (
            <Skeleton height={24} />
          )}
        </StatCard>
      </StatsGrid>

      {/* Period comparison row */}
      <Row style={{ gap: 6, flexWrap: "wrap", marginBottom: 12 }}>
        {allPeriodsData.map(({ period, changePercent: pct }) => {
          const pos = pct.gte(0);
          return (
            <ChangePercent key={period} positive={pos} style={{ fontSize: "12px" }}>
              {PERIOD_LABELS[period as TPeriod]}: {pos ? "+" : ""}
              {pct.toFormat(2)}%
            </ChangePercent>
          );
        })}
      </Row>

      {hasData && (
        <ChartCard>
          <AreaChart width={chartWidth} height={200} data={chartData}>
            <defs>
              <linearGradient id="liquidityGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={isPositive ? "#22c55e" : "#ef4444"} stopOpacity={0.2} />
                <stop offset="95%" stopColor={isPositive ? "#22c55e" : "#ef4444"} stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis
              tickLine={false}
              dataKey="time"
              tickFormatter={(t) => dayjs(t).format(vm.liquidityFlowPeriod === "1d" ? "HH:mm" : "MMM DD")}
              style={{ fill: "#8082c5" }}
              axisLine={false}
            />
            <YAxis
              hide
              domain={["dataMin", "dataMax"]}
            />
            <Tooltip
              labelFormatter={(t) => (
                <Text type="secondary" size="small">
                  {dayjs(t).format("ddd, MMM DD, YYYY")}
                </Text>
              )}
              formatter={(value: number) => ["$" + new BN(value).toFormat(2), "Liquidity"]}
              contentStyle={{
                border: "none",
                borderRadius: "8px",
                filter: "drop-shadow(0px 8px 24px rgba(54, 56, 112, 0.16))"
              }}
            />
            <Area
              type="monotone"
              dataKey="liquidity"
              stroke={isPositive ? "#22c55e" : "#ef4444"}
              strokeWidth={2}
              fill="url(#liquidityGradient)"
              dot={false}
            />
          </AreaChart>
        </ChartCard>
      )}
    </Root>
  );
};

export default observer(LiquidityFlow);
