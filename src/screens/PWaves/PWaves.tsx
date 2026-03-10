import styled from "@emotion/styled";
import React, { useState, useEffect } from "react";
import { Observer } from "mobx-react-lite";
import Layout from "@components/Layout";
import Text from "@components/Text";
import SizedBox from "@components/SizedBox";
import { Column } from "@components/Flex";
import PWavesMyBalances from "./PWavesMyBalances";
import PWavesMintRedeem from "./PWavesMintRedeem";
import PWavesStats from "./PWavesStats";
import PWavesCalculator from "./PWavesCalculator";
import PWavesHero from "./PWavesHero";
import makeNodeRequest from "@src/utils/makeNodeRequest";
import { CONTRACT_ADDRESSES } from "@src/constants";

interface StatsEntry {
  block: number;
  pWavesAmount: number;
  wavesAmount: number;
  price: number;
}

const Root = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  box-sizing: border-box;
  padding: 0 16px;
  width: 100%;
  min-height: 100%;
  max-width: calc(1160px + 32px);
  margin-bottom: 24px;
  margin-top: 40px;
  text-align: left;
  @media (min-width: 880px) {
    margin-top: 56px;
  }
`;

const Body = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 24px;
  @media (min-width: 880px) {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 40px;
  }
`;

const LeftColumn = styled(Column)`
  width: 100%;
  gap: 24px;
`;

const RightColumn = styled(Column)`
  width: 100%;
  gap: 24px;
`;


const PWaves: React.FC = () => {
  const [allStats, setAllStats] = useState<StatsEntry[]>([]);
  const [currentHeight, setCurrentHeight] = useState<number>(0);

  useEffect(() => {
    const fetchAllStats = async () => {
      try {
        const [statsResponse, heightResponse] = await Promise.all([
          makeNodeRequest(`/addresses/data/${CONTRACT_ADDRESSES.pWaves}?matches=stats_.*`),
          makeNodeRequest(`/blocks/height`)
        ]);

        setCurrentHeight(heightResponse.data.height);

        const entries: StatsEntry[] = [];
        for (const entry of statsResponse.data) {
          const match = entry.key.match(/^stats_(\d+)$/);
          if (match) {
            const block = parseInt(match[1]);
            const [pWavesAmount, wavesAmount] = entry.value.split("__").map(Number);
            if (pWavesAmount > 0) {
              entries.push({ block, pWavesAmount, wavesAmount, price: wavesAmount / pWavesAmount });
            }
          }
        }

        entries.sort((a, b) => a.block - b.block);
        setAllStats(entries);
      } catch (error) {
        console.error("Failed to fetch pWAVES stats:", error);
      }
    };
    fetchAllStats();
  }, []);

  const currentPrice = allStats.length > 0 ? allStats[allStats.length - 1].price : null;
  const totalLocked = allStats.length > 0 ? allStats[allStats.length - 1].wavesAmount / 1e8 : null;

  return (
    <Layout>
      <Observer>
        {() => (
          <Root>
            <PWavesHero price={currentPrice} totalLocked={totalLocked} />
            <SizedBox height={32} />
            <Body>
              <LeftColumn>
                <PWavesMyBalances />
                <PWavesMintRedeem currentPrice={currentPrice} />
              </LeftColumn>
              <RightColumn>
                <PWavesStats allStats={allStats} currentHeight={currentHeight} />
                <PWavesCalculator allStats={allStats} currentHeight={currentHeight} />
              </RightColumn>
            </Body>
          </Root>
        )}
      </Observer>
    </Layout>
  );
};

export default PWaves;
