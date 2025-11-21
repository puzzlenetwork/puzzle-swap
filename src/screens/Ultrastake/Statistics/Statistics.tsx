import styled from "@emotion/styled";
import React, { useState } from "react";
import Text from "@components/Text";
import Card from "@components/Card";
import SizedBox from "@components/SizedBox";
import { Column } from "@src/components/Flex";
import { observer } from "mobx-react-lite";
import { useUltrastakeVM } from "../UltrastakeVM";
import BN from "@src/utils/BN";
import Skeleton from "react-loading-skeleton";

const Root = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  padding-top: 24px;
`;

const Container = styled(Card)`
  display: grid;
  row-gap: 16px;
  @media (min-width: 880px) {
    grid-template-columns: 1fr 1fr;
    padding: 24px;
  }
`;

const TabsContainer = styled.div`
  display: flex;
  gap: 8px;
  margin-bottom: 8px;
`;

const Tab = styled.button<{ active: boolean }>`
  padding: 6px 12px;
  border: 1px solid ${({ active }) => (active ? "#7075E9" : "#E1E2FE")};
  background: ${({ active }) => (active ? "#7075E9" : "transparent")};
  color: ${({ active }) => (active ? "#fff" : "#363870")};
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s;

  &:hover {
    background: ${({ active }) => (active ? "#7075E9" : "#F7F7FF")};
  }
`;

const Statistics: React.FC = () => {
  const vm = useUltrastakeVM();
  const [period, setPeriod] = useState<"_1d" | "_7d" | "_30d">("_1d");

  const periodLabels = {
    _1d: "24 hours",
    _7d: "7 days",
    _30d: "30 days"
  };

  const stats = vm.ultrastakeStats;
  const eaglesEarn = stats?.[period]?.eagles_earn_puzzle;
  const aniasEarn = stats?.[period]?.anias_earn_puzzle;
  const eaglesEarnUsd = stats?.[period]?.eagles_earn_usd;
  const aniasEarnUsd = stats?.[period]?.anias_earn_usd;
  const stakedEagles = stats?.staked_eagles;
  const stakedAnias = stats?.staked_anias;

  return (
    <Root>
      <Text weight={500} type="secondary">
        NFT Statistics
      </Text>
      <SizedBox height={8} />
      <TabsContainer>
        <Tab active={period === "_1d"} onClick={() => setPeriod("_1d")}>
          24h
        </Tab>
        <Tab active={period === "_7d"} onClick={() => setPeriod("_7d")}>
          7d
        </Tab>
        <Tab active={period === "_30d"} onClick={() => setPeriod("_30d")}>
          30d
        </Tab>
      </TabsContainer>
      <Container>
        <Column justifyContent="space-between">
          <Text type="secondary" size="small">
            Eagles earned ({periodLabels[period]})
          </Text>
          <Text weight={500} style={{ fontSize: 18 }}>
            {stats == null ? (
              <Skeleton height={20} width={150} />
            ) : (
              <>
                {new BN(eaglesEarn ?? 0).toFormat(2)} PUZZLE
                <Text type="secondary" size="small" style={{ display: "block", marginTop: 4 }}>
                  ${new BN(eaglesEarnUsd ?? 0).toFormat(2)} • {stakedEagles ?? 0} NFTs staked
                </Text>
              </>
            )}
          </Text>
        </Column>
        <Column justifyContent="space-between">
          <Text type="secondary" size="small">
            Ania earned ({periodLabels[period]})
          </Text>
          <Text weight={500} style={{ fontSize: 18 }}>
            {stats == null ? (
              <Skeleton height={20} width={150} />
            ) : (
              <>
                {new BN(aniasEarn ?? 0).toFormat(2)} PUZZLE
                <Text type="secondary" size="small" style={{ display: "block", marginTop: 4 }}>
                  ${new BN(aniasEarnUsd ?? 0).toFormat(2)} • {stakedAnias ?? 0} NFTs staked
                </Text>
              </>
            )}
          </Text>
        </Column>
      </Container>
    </Root>
  );
};

export default observer(Statistics);
