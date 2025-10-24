import styled from "@emotion/styled";
import React, { useState, useEffect } from "react";
import Text from "@components/Text";
import Card from "@components/Card";
import SizedBox from "@components/SizedBox";
import { Column } from "@components/Flex";

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
  gap: 20px;
  width: 100%;
  
  @media (min-width: 560px) {
    grid-template-columns: repeat(2, 1fr);
  }
`;

const StatItem = styled(Column)`
  gap: 8px;
`;

const StatValue = styled(Text)`
  font-size: 20px;
`;

const STPUZZLE_ASSET_ID = "3jXnyztUEVPLyAhwcYdAuoLtbZi55QqbHvYzWekfkGNo";
const BRIDGE_ADDRESS = "3P6Rk2XBo6MJm9seLfxvJ1VSGz54yWiYb9U";
const NODE_URL = "https://nodes.wavesnodes.com";

const StPuzzleStats: React.FC = () => {
  const [circulating, setCirculating] = useState<number | null>(null);
  const [bridged, setBridged] = useState<number | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const detailsResponse = await fetch(`${NODE_URL}/assets/details/${STPUZZLE_ASSET_ID}`);
        const detailsData = await detailsResponse.json();
        console.log("stPUZZLE details:", detailsData);
        setCirculating(detailsData.quantity / 1e8);

        const balanceResponse = await fetch(`${NODE_URL}/assets/balance/${BRIDGE_ADDRESS}/${STPUZZLE_ASSET_ID}`);
        const balanceData = await balanceResponse.json();
        console.log("stPUZZLE bridge balance:", balanceData);
        setBridged(balanceData.balance / 1e8);
      } catch (error) {
        console.error("Failed to fetch stPUZZLE stats:", error);
      }
    };

    fetchStats();
  }, []);

  const stats = [
    {
      label: "Circulating",
      value: circulating !== null ? circulating.toFixed(2) : "-",
    },
    {
      label: "Bridged",
      value: bridged !== null ? bridged.toFixed(2) : "-",
    },
  ];

  return (
    <Root>
      <Text weight={500} type="secondary">
        stPUZZLE stats
      </Text>
      <SizedBox height={8} />
      <Container>
        <StatsGrid>
          {stats.map((stat, index) => (
            <StatItem key={index}>
              <Text type="secondary" size="small">
                {stat.label}
              </Text>
              <StatValue weight={500}>
                {stat.value}
              </StatValue>
            </StatItem>
          ))}
        </StatsGrid>
      </Container>
    </Root>
  );
};

export default StPuzzleStats;
