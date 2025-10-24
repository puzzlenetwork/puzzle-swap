import styled from "@emotion/styled";
import React, { useState, useEffect } from "react";
import Text from "@components/Text";
import Card from "@components/Card";
import SizedBox from "@components/SizedBox";
import { Column } from "@components/Flex";
import Tabs from "@components/Tabs";
import poolService from "@src/services/poolsService";

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
  gap: 16px;
  width: 100%;
  
  @media (min-width: 560px) {
    grid-template-columns: repeat(3, 1fr);
  }
`;

const StatItem = styled(Column)`
  gap: 4px;
`;

const tabs = [
  { name: "1D", timeRange: "1d" },
  { name: "7D", timeRange: "7d" },
  { name: "1M", timeRange: "30d" },
  { name: "1Y", timeRange: "1y" },
  { name: "All time", timeRange: "all" },
];

const StakingStats: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [puzzleApr, setPuzzleApr] = useState<number | null>(null);
  const [totalFees, setTotalFees] = useState<number | null>(null);
  const [avgStaked, setAvgStaked] = useState<number | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data: any = await poolService.getPuzzleTokenCharts(tabs[activeTab].timeRange);
        
        setPuzzleApr(data.puzzle_apr);
        
        if (data.data && data.data.length > 0) {
          const totalProtocolFees = data.data.reduce((sum: number, item: any) => sum + (item.protocol_fees || 0), 0);
          setTotalFees(totalProtocolFees);
          
          const totalStaked = data.data.reduce((sum: number, item: any) => sum + (item.staked || 0), 0);
          setAvgStaked(totalStaked / data.data.length);
        }
      } catch (error) {
        console.error("Failed to fetch stats:", error);
      }
    };
    fetchStats();
  }, [activeTab]);


  return (
    <Root>
      <Text weight={500} type="secondary">
        Staking stats
      </Text>
      <SizedBox height={8} />
      <Container>
        <Tabs tabs={tabs} activeTab={activeTab} setActive={setActiveTab} />
        <StatsGrid>
          <StatItem>
            <Text type="secondary" size="small">
              APR
            </Text>
            <Text weight={500}>{puzzleApr !== null ? `${puzzleApr.toFixed(2)}%` : "-"}</Text>
          </StatItem>
          <StatItem>
            <Text type="secondary" size="small">
              Earned
            </Text>
            <Text weight={500}>{totalFees !== null ? `$${totalFees.toFixed(2)}` : "-"}</Text>
          </StatItem>
          <StatItem>
            <Text type="secondary" size="small">
              Avg Staked
            </Text>
            <Text weight={500}>{avgStaked !== null ? `${avgStaked.toFixed(2)} PZL` : "-"}</Text>
          </StatItem>
        </StatsGrid>
      </Container>
    </Root>
  );
};

export default StakingStats;
