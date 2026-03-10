import styled from "@emotion/styled";
import React, { useState, useMemo } from "react";
import Text from "@components/Text";
import Card from "@components/Card";
import SizedBox from "@components/SizedBox";
import { Column } from "@components/Flex";
import Tabs from "@components/Tabs";

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

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 12px;
  width: 100%;

  @media (min-width: 560px) {
    grid-template-columns: repeat(3, 1fr);
  }
`;

const StatItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 12px;
  border-radius: 10px;
  background: ${({ theme }) => theme.colors.primary100};
  transition: background 0.2s ease-out;

  &:hover {
    background: ${({ theme }) => theme.colors.primary300};
  }
`;

const PriceChange = styled.span<{ positive: boolean }>`
  color: ${({ positive, theme }) => positive ? theme.colors.success500 : theme.colors.error500};
  font-size: 12px;
  font-weight: 500;
  margin-left: 4px;
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

  const filteredStats = useMemo(() => {
    if (allStats.length === 0) return [];
    const blocksBack = tabs[activeTab].blocks;
    if (blocksBack === 0) return allStats;
    const minBlock = currentHeight - blocksBack;
    return allStats.filter(s => s.block >= minBlock);
  }, [allStats, currentHeight, activeTab]);

  const apr = useMemo(() => {
    if (filteredStats.length < 2) return null;
    const first = filteredStats[0];
    const last = filteredStats[filteredStats.length - 1];
    const priceChange = (last.price - first.price) / first.price;
    const blocksDiff = last.block - first.block;
    if (blocksDiff === 0) return null;
    return (priceChange / blocksDiff) * BLOCKS_PER_DAY * 365 * 100;
  }, [filteredStats]);

  const priceChangePercent = useMemo(() => {
    if (filteredStats.length < 2) return null;
    const first = filteredStats[0];
    const last = filteredStats[filteredStats.length - 1];
    return ((last.price - first.price) / first.price) * 100;
  }, [filteredStats]);

  const currentPrice = allStats.length > 0 ? allStats[allStats.length - 1].price : null;
  const totalLocked = allStats.length > 0 ? allStats[allStats.length - 1].wavesAmount / 1e8 : null;

  return (
    <Root>
      <Text weight={500} type="secondary">
        pWAVES stats
      </Text>
      <SizedBox height={8} />
      <Container>
        <Tabs tabs={tabs} activeTab={activeTab} setActive={setActiveTab} />
        <StatsGrid>
          <StatItem>
            <Text type="secondary" size="small">APR</Text>
            <Text weight={500}>{apr !== null ? `${apr.toFixed(2)}%` : "-"}</Text>
          </StatItem>
          <StatItem>
            <Text type="secondary" size="small">pWAVES price</Text>
            <Text weight={500}>
              {currentPrice !== null ? `${currentPrice.toFixed(4)}` : "-"}
              {priceChangePercent !== null && (
                <PriceChange positive={priceChangePercent >= 0}>
                  {priceChangePercent >= 0 ? "+" : ""}{priceChangePercent.toFixed(3)}%
                </PriceChange>
              )}
            </Text>
          </StatItem>
          <StatItem>
            <Text type="secondary" size="small">Total locked</Text>
            <Text weight={500}>
              {totalLocked !== null
                ? `${totalLocked.toLocaleString(undefined, { maximumFractionDigits: 0 })} WAVES`
                : "-"
              }
            </Text>
          </StatItem>
        </StatsGrid>
      </Container>
    </Root>
  );
};

export default PWavesStats;
