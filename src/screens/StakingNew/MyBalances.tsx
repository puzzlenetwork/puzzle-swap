import styled from "@emotion/styled";
import React from "react";
import Text from "@components/Text";
import Card from "@components/Card";
import SizedBox from "@components/SizedBox";
import { Column, Row } from "@components/Flex";
import SquareTokenIcon from "@components/SquareTokenIcon";
import stakedPuzzle from "@src/assets/tokens/staked-puzzle.svg";
import puzzleLogo from "@src/assets/tokens/PUZZLE.svg";
import { observer } from "mobx-react-lite";
import BN from "@src/utils/BN";
import Skeleton from "react-loading-skeleton";
import { useStores } from "@stores";
import { useState, useEffect } from "react";
import nodeService from "@src/services/nodeService";
import { useLocation } from "react-router-dom";
import { ROUTES } from "@src/constants";

const Root = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
`;

const Container = styled(Card)`
  display: grid;
  row-gap: 16px;
  @media (min-width: 880px) {
    grid-template-columns: 1fr 1fr;
    padding: 24px;
  }
`;

const STPUZZLE_ASSET_ID = "3jXnyztUEVPLyAhwcYdAuoLtbZi55QqbHvYzWekfkGNo";

const PUZZLE_ASSET_ID = "HEB8Qaw9xrWpWs8tHsiATYGBWDBtP2S7kcPALrMu43AS";

const MyBalances: React.FC = () => {
  const location = useLocation();
  const isPzlRoute = location.pathname === ROUTES.PZL;
  const { accountStore } = useStores();
  const [stPuzzleBalance, setStPuzzleBalance] = useState<BN | null>(null);
  const [puzzleBalance, setPuzzleBalance] = useState<BN | null>(null);

  useEffect(() => {
    const fetchBalances = async () => {
      if (!accountStore.address) {
        setStPuzzleBalance(BN.ZERO);
        setPuzzleBalance(BN.ZERO);
        return;
      }
      try {
        const balances = await nodeService.getAddressBalances(accountStore.address);
        
        const stPuzzleAsset = balances.find(b => b.assetId === STPUZZLE_ASSET_ID);
        if (stPuzzleAsset) {
          setStPuzzleBalance(new BN(stPuzzleAsset.balance).div(1e8));
        } else {
          setStPuzzleBalance(BN.ZERO);
        }

        const puzzleAsset = balances.find(b => b.assetId === PUZZLE_ASSET_ID);
        if (puzzleAsset) {
          setPuzzleBalance(new BN(puzzleAsset.balance).div(1e8));
        } else {
          setPuzzleBalance(BN.ZERO);
        }
      } catch (error) {
        console.error("Failed to fetch balances:", error);
        setStPuzzleBalance(BN.ZERO);
        setPuzzleBalance(BN.ZERO);
      }
    };
    fetchBalances();
    
    const interval = setInterval(fetchBalances, 5000);
    return () => clearInterval(interval);
  }, [accountStore.address]);
  return (
    <Root>
      <Text weight={500} type="secondary">
        My balances
      </Text>
      <SizedBox height={8} />
      <Container>
        <Row>
          <SquareTokenIcon src={puzzleLogo} size="small" />
          <SizedBox width={8} />
          <Column justifyContent="space-between">
            <Text type="secondary" size="small">
              PUZZLE
            </Text>
            <Text weight={500}>
              {puzzleBalance == null && accountStore.address != null ? (
                <Skeleton height={16} width={110} />
              ) : (
                `${(puzzleBalance ?? BN.ZERO).toFormat(2)}`
              )}
            </Text>
          </Column>
        </Row>
        <Row>
          <SquareTokenIcon src={stakedPuzzle} size="small" />
          <SizedBox width={8} />
          <Column justifyContent="space-between">
            <Text type="secondary" size="small" style={{ marginBottom: 2 }}>
              {isPzlRoute ? "Staked PUZZLE (PZL)" : "stPUZZLE"}
            </Text>
            <Text weight={500}>{stPuzzleBalance != null ? stPuzzleBalance.toFormat(2, BN.ROUND_DOWN) : <Skeleton height={16} width={110} />}</Text>
          </Column>
        </Row>
      </Container>
    </Root>
  );
};

export default observer(MyBalances);
