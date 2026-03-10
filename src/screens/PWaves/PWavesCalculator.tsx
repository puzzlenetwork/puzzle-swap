import styled from "@emotion/styled";
import React, { useState, useMemo } from "react";
import Text from "@components/Text";
import Card from "@components/Card";
import SizedBox from "@components/SizedBox";
import { Column } from "@components/Flex";
import Input from "@components/Input";

const Root = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
`;

const Container = styled(Card)`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const ResultsGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;

  @media (min-width: 560px) {
    grid-template-columns: repeat(4, 1fr);
  }
`;

const ResultCard = styled.div`
  background: ${({ theme }) => theme.colors.primary100};
  border-radius: 10px;
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 2px;
  transition: all 0.2s ease-out;
  border: 1px solid transparent;
  cursor: default;

  &:hover {
    background: ${({ theme }) => theme.colors.primary300};
    border-color: ${({ theme }) => theme.colors.primary300};
  }
`;

const AprBadge = styled.span`
  display: inline-block;
  background: ${({ theme }) => theme.colors.success100};
  color: ${({ theme }) => theme.colors.success550};
  font-size: 12px;
  font-weight: 500;
  padding: 2px 8px;
  border-radius: 6px;
`;

const BLOCKS_PER_DAY = 60 * 24;

interface StatsEntry {
  block: number;
  pWavesAmount: number;
  wavesAmount: number;
  price: number;
}

interface Props {
  allStats: StatsEntry[];
  currentHeight: number;
}

const PWavesCalculator: React.FC<Props> = ({ allStats, currentHeight }) => {
  const [amount, setAmount] = useState("100");

  const annualRate = useMemo(() => {
    if (allStats.length < 2) return null;
    const monthAgo = currentHeight - BLOCKS_PER_DAY * 30;
    const recentStats = allStats.filter(s => s.block >= monthAgo);
    const stats = recentStats.length >= 2 ? recentStats : allStats;
    const first = stats[0];
    const last = stats[stats.length - 1];
    const priceChange = (last.price - first.price) / first.price;
    const blocksDiff = last.block - first.block;
    if (blocksDiff === 0) return null;
    return (priceChange / blocksDiff) * BLOCKS_PER_DAY * 365;
  }, [allStats, currentHeight]);

  const inputNum = parseFloat(amount) || 0;

  const projections = useMemo(() => {
    if (annualRate === null || inputNum <= 0) {
      return { daily: 0, weekly: 0, monthly: 0, yearly: 0 };
    }
    return {
      daily: inputNum * (annualRate / 365),
      weekly: inputNum * (annualRate / 52),
      monthly: inputNum * (annualRate / 12),
      yearly: inputNum * annualRate
    };
  }, [annualRate, inputNum]);

  return (
    <Root>
      <Text weight={500} type="secondary">
        Calculate earnings
      </Text>
      <SizedBox height={8} />
      <Container>
        <Column style={{ gap: 8 }}>
          <Text size="small" type="secondary">
            Amount of WAVES to deposit
            {annualRate !== null && (
              <>
                {" "}<AprBadge>APR {(annualRate * 100).toFixed(2)}%</AprBadge>
              </>
            )}
          </Text>
          <Input
            placeholder="100"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
        </Column>
        <ResultsGrid>
          <ResultCard>
            <Text size="small" type="secondary">Daily</Text>
            <Text weight={500}>{projections.daily.toFixed(4)}</Text>
            <Text size="small" type="secondary">WAVES</Text>
          </ResultCard>
          <ResultCard>
            <Text size="small" type="secondary">Weekly</Text>
            <Text weight={500}>{projections.weekly.toFixed(4)}</Text>
            <Text size="small" type="secondary">WAVES</Text>
          </ResultCard>
          <ResultCard>
            <Text size="small" type="secondary">Monthly</Text>
            <Text weight={500}>{projections.monthly.toFixed(3)}</Text>
            <Text size="small" type="secondary">WAVES</Text>
          </ResultCard>
          <ResultCard>
            <Text size="small" type="secondary">Yearly</Text>
            <Text weight={500}>{projections.yearly.toFixed(2)}</Text>
            <Text size="small" type="secondary">WAVES</Text>
          </ResultCard>
        </ResultsGrid>
      </Container>
    </Root>
  );
};

export default PWavesCalculator;
