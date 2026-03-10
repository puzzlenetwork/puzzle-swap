import styled from "@emotion/styled";
import React, { useState, useEffect } from "react";
import Text from "@components/Text";
import Card from "@components/Card";
import SizedBox from "@components/SizedBox";
import { Row } from "@components/Flex";
import makeNodeRequest from "@src/utils/makeNodeRequest";
import { ASSET_IDS, CONTRACT_ADDRESSES, EXPLORER_URL } from "@src/constants";

const Root = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
`;

const Container = styled(Card)`
  display: flex;
  flex-direction: column;
  padding: 0;
  overflow: hidden;
`;

const StatRow = styled(Row)`
  justify-content: space-between;
  align-items: center;
  padding: 14px 24px;
  transition: background 0.15s ease-out;

  &:not(:last-child) {
    border-bottom: 1px solid ${({ theme }) => theme.colors.primary100};
  }

  &:hover {
    background: ${({ theme }) => theme.colors.primary100};
  }
`;

const LinkText = styled.a`
  color: ${({ theme }) => theme.colors.blue500};
  text-decoration: none;
  font-size: 13px;
  font-weight: 500;
  transition: opacity 0.15s ease-out;
  cursor: pointer;

  &:hover {
    opacity: 0.8;
    text-decoration: underline;
  }
`;

const PWavesTokenStats: React.FC = () => {
  const [circulating, setCirculating] = useState<number | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const detailsResponse = await makeNodeRequest(`/assets/details/${ASSET_IDS.pWaves}`);
        setCirculating(detailsResponse.data.quantity / 1e8);
      } catch (error) {
        console.error("Failed to fetch pWAVES stats:", error);
      }
    };
    fetchStats();
  }, []);

  return (
    <Root>
      <Text weight={500} type="secondary">
        Token info
      </Text>
      <SizedBox height={8} />
      <Container>
        <StatRow>
          <Text size="small" type="secondary">Circulating supply</Text>
          <Text size="small" weight={500}>
            {circulating !== null
              ? `${circulating.toLocaleString(undefined, { maximumFractionDigits: 2 })} pWAVES`
              : "-"
            }
          </Text>
        </StatRow>
        <StatRow>
          <Text size="small" type="secondary">Contract</Text>
          <LinkText
            href={`${EXPLORER_URL}/address/${CONTRACT_ADDRESSES.pWaves}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            {CONTRACT_ADDRESSES.pWaves.slice(0, 8)}...{CONTRACT_ADDRESSES.pWaves.slice(-6)}
          </LinkText>
        </StatRow>
        <StatRow>
          <Text size="small" type="secondary">Asset ID</Text>
          <LinkText
            href={`${EXPLORER_URL}/assets/${ASSET_IDS.pWaves}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            {ASSET_IDS.pWaves.slice(0, 8)}...{ASSET_IDS.pWaves.slice(-6)}
          </LinkText>
        </StatRow>
      </Container>
    </Root>
  );
};

export default PWavesTokenStats;
