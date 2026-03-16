import styled from "@emotion/styled";
import React, { useState, useMemo, useEffect, useRef } from "react";
import Text from "@components/Text";
import Card from "@components/Card";
import SizedBox from "@components/SizedBox";
import Tabs from "@components/Tabs";
import { createChart, AreaSeries, UTCTimestamp } from "lightweight-charts";

const Root = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
`;

const Container = styled(Card)`
  display: flex;
  flex-direction: column;
  gap: 24px;
`;


const ChartContainer = styled.div`
  width: 100%;
  height: 200px;
`;

interface StatsEntry {
  block: number;
  pWavesAmount: number;
  wavesAmount: number;
  price: number;
}

const BLOCKS_PER_DAY = 60 * 24;

const tabs = [
  { name: "1D", blocks: BLOCKS_PER_DAY },
  { name: "7D", blocks: BLOCKS_PER_DAY * 7 },
  { name: "1M", blocks: BLOCKS_PER_DAY * 30 },
  { name: "1Y", blocks: BLOCKS_PER_DAY * 365 },
  { name: "All time", blocks: 0 },
];

interface Props {
  allStats: StatsEntry[];
  currentHeight: number;
}

const PWavesStats: React.FC<Props> = ({ allStats, currentHeight }) => {
  const [activeTab, setActiveTab] = useState(0);
  const chartContainerRef = useRef<HTMLDivElement>(null);

  const filteredStats = useMemo(() => {
    if (allStats.length === 0) return [];
    const blocksBack = tabs[activeTab].blocks;
    if (blocksBack === 0) return allStats;
    const minBlock = currentHeight - blocksBack;
    return allStats.filter(s => s.block >= minBlock);
  }, [allStats, currentHeight, activeTab]);

  const chartData = useMemo(() => {
    if (filteredStats.length === 0 || currentHeight === 0) return [];
    const now = Date.now() / 1000;
    return filteredStats.map(s => ({
      time: Math.floor(now - (currentHeight - s.block) * 60) as UTCTimestamp,
      value: s.price,
    }));
  }, [filteredStats, currentHeight]);

  useEffect(() => {
    if (!chartContainerRef.current || chartData.length === 0) return;

    const chart = createChart(chartContainerRef.current, {
      width: chartContainerRef.current.clientWidth,
      height: 200,
      layout: {
        background: { color: "transparent" },
        textColor: "#8082c5",
      },
      grid: {
        vertLines: { color: "rgba(197, 203, 206, 0.1)" },
        horzLines: { color: "rgba(197, 203, 206, 0.1)" },
      },
      rightPriceScale: {
        borderColor: "rgba(197, 203, 206, 0.2)",
      },
      timeScale: {
        borderColor: "rgba(197, 203, 206, 0.2)",
        timeVisible: true,
        secondsVisible: false,
      },
      crosshair: {
        mode: 1,
      },
    });

    const series = chart.addSeries(AreaSeries, {
      lineColor: "#7075E9",
      topColor: "rgba(112, 117, 233, 0.4)",
      bottomColor: "rgba(112, 117, 233, 0.0)",
      lineWidth: 2,
    });

    series.setData(chartData);
    chart.timeScale().fitContent();

    const handleResize = () => {
      if (chartContainerRef.current) {
        chart.applyOptions({ width: chartContainerRef.current.clientWidth });
      }
    };
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      chart.remove();
    };
  }, [chartData]);

  return (
    <Root>
      <Text weight={500} type="secondary">
        pWAVES stats
      </Text>
      <SizedBox height={8} />
      <Container>
        <ChartContainer ref={chartContainerRef} />
        <Tabs tabs={tabs} activeTab={activeTab} setActive={setActiveTab} />
      </Container>
    </Root>
  );
};

export default PWavesStats;
