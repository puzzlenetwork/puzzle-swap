import styled from "@emotion/styled";
import React from "react";
import Text from "@components/Text";
import Card from "@components/Card";
import SizedBox from "@components/SizedBox";
import { Column, Row } from "@components/Flex";
import SquareTokenIcon from "@components/SquareTokenIcon";
import stakedPuzzle from "@src/assets/tokens/staked-puzzle.svg";
import puzzleLogo from "@src/assets/tokens/PUZZLE.svg";
import { useStakingVM } from "@screens/Stake/StakingVM";
import { observer } from "mobx-react-lite";
import BN from "@src/utils/BN";
import Skeleton from "react-loading-skeleton";
import { useStores } from "@stores";
import { useState, useEffect } from "react";
import nodeService from "@src/services/nodeService";

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

const MyBalances: React.FC = () => {
  const { accountStore } = useStores();
  const vm = useStakingVM();
  const [stPuzzleBalance, setStPuzzleBalance] = useState<BN | null>(null);
  const available = BN.formatUnits(vm.puzzleBalance.balance ?? BN.ZERO, vm.puzzleToken.decimals);

  useEffect(() => {
    const fetchStPuzzleBalance = async () => {
      if (!accountStore.address) {
        setStPuzzleBalance(BN.ZERO);
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
      } catch (error) {
        console.error("Failed to fetch stPUZZLE balance:", error);
        setStPuzzleBalance(BN.ZERO);
      }
    };
    fetchStPuzzleBalance();
    
    const interval = setInterval(fetchStPuzzleBalance, 5000);
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
              {vm.puzzleBalance.balance == null && accountStore.address != null ? (
                <Skeleton height={16} width={110} />
              ) : (
                `${available.toFormat(2)}`
              )}
            </Text>
          </Column>
        </Row>
        <Row>
          <SquareTokenIcon src={stakedPuzzle} size="small" />
          <SizedBox width={8} />
          <Column justifyContent="space-between">
            <Text type="secondary" size="small" style={{ marginBottom: 2 }}>
              stPUZZLE
            </Text>
            <Text weight={500}>{stPuzzleBalance != null ? stPuzzleBalance.toFormat(2, BN.ROUND_DOWN) : <Skeleton height={16} width={110} />}</Text>
          </Column>
        </Row>
      </Container>
    </Root>
  );
};

export default observer(MyBalances);
