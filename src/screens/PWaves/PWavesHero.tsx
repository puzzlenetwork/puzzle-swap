import styled from "@emotion/styled";
import React from "react";
import Text from "@components/Text";
import { Column, Row } from "@components/Flex";
import SizedBox from "@components/SizedBox";
import tokenLogos from "@src/constants/tokenLogos";

const HeroBanner = styled.div`
  width: 100%;
  border-radius: 16px;
  padding: 24px;
  background: ${({ theme }) => theme.colors.card.background};
  border: 1px solid ${({ theme }) => theme.colors.primary100};
  position: relative;
  overflow: hidden;
  box-shadow: 0 4px 40px ${({ theme }) => theme.colors.blue500}12;

  &::before {
    content: "";
    position: absolute;
    top: 0;
    left: 24px;
    right: 24px;
    height: 2px;
    background: linear-gradient(
      90deg,
      transparent 0%,
      ${({ theme }) => theme.colors.blue500} 50%,
      transparent 100%
    );
    border-radius: 2px;
  }

  @media (min-width: 560px) {
    padding: 24px;
  }
`;

const HeroContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;

  @media (min-width: 880px) {
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
  }
`;

const HeroLeft = styled(Column)`
  flex: 1;
  gap: 8px;
`;

const HeroRight = styled(Row)`
  gap: 12px;
  flex-wrap: wrap;

  @media (min-width: 880px) {
    flex-wrap: nowrap;
  }
`;

const StatCard = styled.div`
  background: ${({ theme }) => theme.colors.primary100};
  border-radius: 12px;
  padding: 14px 20px;
  min-width: 120px;
  flex: 1;
  transition: background 0.2s ease-out;

  &:hover {
    background: ${({ theme }) => theme.colors.primary300};
  }
`;

const TokenIcon = styled.img`
  width: 36px;
  height: 36px;
  border-radius: 50%;
`;

const Title = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

const StatValue = styled(Text)`
  font-size: 20px;
  line-height: 1.2;
`;

interface Props {
  price: number | null;
  totalLocked: number | null;
}

const PWavesHero: React.FC<Props> = ({ price, totalLocked }) => {
  return (
    <HeroBanner>
      <HeroContent>
        <HeroLeft>
          <Title>
            <TokenIcon src={tokenLogos.WAVES} alt="pWAVES" />
            <Text weight={500} size="large">
              pWAVES
            </Text>
          </Title>
          <Text type="secondary" style={{ maxWidth: 460, lineHeight: "20px" }} size="small">
            Yield-bearing WAVES wrapper. Deposit WAVES and receive pWAVES that grows in value as staking rewards accumulate.
          </Text>
        </HeroLeft>
        <HeroRight>
          <StatCard>
            <Text type="secondary" size="small">pWAVES Price</Text>
            <SizedBox height={4} />
            <StatValue weight={500}>
              {price !== null ? `${price.toFixed(4)}` : "-"}
            </StatValue>
            <Text type="secondary" size="small">WAVES</Text>
          </StatCard>
          <StatCard>
            <Text type="secondary" size="small">Total Locked</Text>
            <SizedBox height={4} />
            <StatValue weight={500}>
              {totalLocked !== null
                ? `${totalLocked.toLocaleString(undefined, { maximumFractionDigits: 0 })}`
                : "-"
              }
            </StatValue>
            <Text type="secondary" size="small">WAVES</Text>
          </StatCard>
        </HeroRight>
      </HeroContent>
    </HeroBanner>
  );
};

export default PWavesHero;
