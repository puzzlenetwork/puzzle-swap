import styled from "@emotion/styled";
import React, { useState, useEffect } from "react";
import Text from "@components/Text";
import Card from "@components/Card";
import SizedBox from "@components/SizedBox";
import { Column, Row } from "@components/Flex";
import Tabs from "@components/Tabs";
import Input from "@components/Input";
import Button from "@components/Button";
import nodeService from "@src/services/nodeService";
import BN from "@src/utils/BN";
import { useStores } from "@stores";
import { observer } from "mobx-react-lite";
import { CONTRACT_ADDRESSES, ASSET_IDS } from "@src/constants";

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

const ConversionRow = styled(Row)`
  align-items: center;
  gap: 16px;
  width: 100%;
`;

const ArrowIcon = styled.div`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: ${({ theme }) => theme.colors.primary100};
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${({ theme }) => theme.colors.primary500};
  font-size: 16px;
  flex-shrink: 0;
  transition: background 0.2s ease-out;
`;

const MaxButton = styled.button`
  background: ${({ theme }) => theme.colors.primary300};
  border: none;
  border-radius: 8px;
  padding: 4px 8px;
  cursor: pointer;
  font-size: 12px;
  font-weight: 500;
  color: ${({ theme }) => theme.colors.primary800};
  transition: all 0.2s ease-out;

  &:hover {
    background: ${({ theme }) => theme.colors.primary500};
    color: #fff;
  }

  &:active {
    transform: scale(0.95);
  }
`;

const RateInfo = styled.div`
  background: ${({ theme }) => theme.colors.primary100};
  border-radius: 10px;
  padding: 10px 14px;
  border: 1px solid transparent;
  transition: border-color 0.2s ease-out;

  &:hover {
    border-color: ${({ theme }) => theme.colors.primary300};
  }
`;

interface Props {
  currentPrice: number | null;
}

const PWavesMintRedeem: React.FC<Props> = observer(({ currentPrice }) => {
  const { accountStore, notificationStore } = useStores();
  const [activeTab, setActiveTab] = useState(0);
  const [inputAmount, setInputAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [wavesBalance, setWavesBalance] = useState<BN>(BN.ZERO);
  const [pWavesBalance, setPWavesBalance] = useState<BN>(BN.ZERO);

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
  }, [accountStore.address]);

  const handleMaxClick = () => {
    const maxBalance = activeTab === 0 ? wavesBalance : pWavesBalance;
    setInputAmount(maxBalance.toString());
  };

  const calculateOutput = (): string => {
    if (!inputAmount || !currentPrice) return "";
    const input = new BN(inputAmount);
    if (input.isNaN() || input.lte(0)) return "";

    if (activeTab === 0) {
      return input.div(currentPrice).toFixed(8);
    } else {
      return input.times(currentPrice).toFixed(8);
    }
  };

  const handleMintRedeem = async () => {
    if (!inputAmount || !accountStore.address) {
      notificationStore.notify("Please connect wallet and enter amount", {
        title: "Error",
        type: "warning"
      });
      return;
    }

    const input = new BN(inputAmount);
    if (input.isNaN() || input.lte(0)) {
      notificationStore.notify("Invalid amount", {
        title: "Error",
        type: "warning"
      });
      return;
    }

    setLoading(true);
    try {
      const amount = input.times(1e8).toFixed(0);
      const txParams = activeTab === 0
        ? {
            dApp: CONTRACT_ADDRESSES.pWaves,
            payment: [{ assetId: null as string | null, amount }],
            call: {
              function: "mintLP",
              args: [] as { type: "string"; value: string }[]
            }
          }
        : {
            dApp: CONTRACT_ADDRESSES.pWaves,
            payment: [{ assetId: ASSET_IDS.pWaves, amount }],
            call: {
              function: "redeemLP",
              args: [] as { type: "string"; value: string }[]
            }
          };

      const txId = await accountStore.invoke(txParams);
      if (txId) {
        notificationStore.notify("Transaction successful", {
          title: "Success",
          type: "success"
        });
        setInputAmount("");

        setTimeout(async () => {
          if (!accountStore.address) return;
          try {
            const targetAddress = accountStore.effectiveAddress ?? accountStore.address;
            const balances = await nodeService.getAddressBalances(targetAddress);

            const wavesAsset = balances.find(b => b.assetId === "WAVES");
            setWavesBalance(wavesAsset ? new BN(wavesAsset.balance).div(1e8) : BN.ZERO);

            const pWavesAsset = balances.find(b => b.assetId === ASSET_IDS.pWaves);
            setPWavesBalance(pWavesAsset ? new BN(pWavesAsset.balance).div(1e8) : BN.ZERO);
          } catch (error) {
            console.error("Failed to refresh balances:", error);
          }
        }, 3000);
      }
    } catch (error) {
      console.error("Mint/Redeem error:", error);
      notificationStore.notify("Transaction failed", {
        title: "Error",
        type: "danger"
      });
    } finally {
      setLoading(false);
    }
  };

  const tabs = [{ name: "Mint" }, { name: "Redeem" }];

  return (
    <Root>
      <Text weight={500} type="secondary">
        Mint / Redeem
      </Text>
      <SizedBox height={8} />
      <Container>
        <Tabs tabs={tabs} activeTab={activeTab} setActive={(tab) => {
          setActiveTab(tab);
          setInputAmount("");
        }} />

        <Column style={{ gap: "16px", width: "100%" }}>
          {currentPrice && (
            <RateInfo>
              <Text size="small" type="secondary">Exchange rate: 1 pWAVES = {currentPrice.toFixed(6)} WAVES</Text>
            </RateInfo>
          )}

          <ConversionRow>
            <Column style={{ flex: 1 }}>
              <Input
                placeholder="0.0"
                value={inputAmount}
                onChange={(e) => setInputAmount(e.target.value)}
                suffix={<MaxButton onClick={handleMaxClick}>MAX</MaxButton>}
              />
              <SizedBox height={4} />
              <Text size="small" type="secondary">
                {activeTab === 0 ? "WAVES" : "pWAVES"}
              </Text>
            </Column>
            <ArrowIcon>→</ArrowIcon>
            <Column style={{ flex: 1 }}>
              <Input placeholder="0.0" disabled value={calculateOutput()} />
              <SizedBox height={4} />
              <Text size="small" type="secondary">
                {activeTab === 0 ? "pWAVES" : "WAVES"}
              </Text>
            </Column>
          </ConversionRow>

          <Button fixed onClick={handleMintRedeem} disabled={loading}>
            {loading ? "Processing..." : activeTab === 0 ? "Mint pWAVES" : "Redeem WAVES"}
          </Button>
        </Column>
      </Container>
    </Root>
  );
});

export default PWavesMintRedeem;
