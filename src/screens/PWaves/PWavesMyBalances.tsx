import styled from "@emotion/styled";
import React, { useState, useEffect } from "react";
import Text from "@components/Text";
import Card from "@components/Card";
import SizedBox from "@components/SizedBox";
import { Column, Row } from "@components/Flex";
import SquareTokenIcon from "@components/SquareTokenIcon";
import tokenLogos from "@src/constants/tokenLogos";
import { observer } from "mobx-react-lite";
import BN from "@src/utils/BN";
import Skeleton from "react-loading-skeleton";
import { useStores } from "@stores";
import nodeService from "@src/services/nodeService";
import { ASSET_IDS } from "@src/constants";

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

const BalanceRow = styled(Row)`
  align-items: center;
  padding: 4px;
  border-radius: 10px;
  transition: background 0.2s ease-out;

  &:hover {
    background: ${({ theme }) => theme.colors.primary100};
  }
`;

const PWavesMyBalances: React.FC = () => {
  const { accountStore } = useStores();
  const [wavesBalance, setWavesBalance] = useState<BN | null>(null);
  const [pWavesBalance, setPWavesBalance] = useState<BN | null>(null);

  useEffect(() => {
    const fetchBalances = async () => {
      if (!accountStore.address) {
        setWavesBalance(BN.ZERO);
        setPWavesBalance(BN.ZERO);
        return;
      }
      try {
        const targetAddress = accountStore.effectiveAddress ?? accountStore.address;
        const balances = await nodeService.getAddressBalances(targetAddress);

        const wavesAsset = balances.find(b => b.assetId === "WAVES");
        setWavesBalance(wavesAsset ? new BN(wavesAsset.balance).div(1e8) : BN.ZERO);

        const pWavesAsset = balances.find(b => b.assetId === ASSET_IDS.pWaves);
        setPWavesBalance(pWavesAsset ? new BN(pWavesAsset.balance).div(1e8) : BN.ZERO);
      } catch (error) {
        console.error("Failed to fetch balances:", error);
        setWavesBalance(BN.ZERO);
        setPWavesBalance(BN.ZERO);
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
        <BalanceRow>
          <SquareTokenIcon src={tokenLogos.WAVES} size="small" />
          <SizedBox width={8} />
          <Column justifyContent="space-between">
            <Text type="secondary" size="small">WAVES</Text>
            <Text weight={500}>
              {wavesBalance == null && accountStore.address != null
                ? <Skeleton height={16} width={110} />
                : `${(wavesBalance ?? BN.ZERO).toFormat(2)}`
              }
            </Text>
          </Column>
        </BalanceRow>
        <BalanceRow>
          <SquareTokenIcon src={tokenLogos.pWAVES} size="small" />
          <SizedBox width={8} />
          <Column justifyContent="space-between">
            <Text type="secondary" size="small" style={{ marginBottom: 2 }}>pWAVES</Text>
            <Text weight={500}>
              {pWavesBalance != null
                ? pWavesBalance.toFormat(2, BN.ROUND_DOWN)
                : <Skeleton height={16} width={110} />
              }
            </Text>
          </Column>
        </BalanceRow>
      </Container>
    </Root>
  );
};

export default observer(PWavesMyBalances);
