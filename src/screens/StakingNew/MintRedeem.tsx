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
  font-size: 20px;
  color: ${({ theme }) => theme.colors.primary500};
  display: flex;
  align-items: center;
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
  transition: 0.3s;
  
  &:hover {
    background: ${({ theme }) => theme.colors.primary200};
  }
  
  &:active {
    transform: scale(0.95);
  }
`;

const AmbassadorSelector = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const AmbassadorLabel = styled(Text)`
  margin-bottom: 4px;
`;

const AmbassadorCircles = styled(Row)`
  gap: 8px;
  align-items: center;
`;

const AmbassadorCircle = styled.div<{ selected?: boolean; imageUrl?: string }>`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: ${({ selected, imageUrl, theme }) => 
    imageUrl 
      ? `url(${imageUrl}) center/cover` 
      : selected ? theme.colors.blue500 : theme.colors.primary300
  };
  border: ${({ selected, theme }) => (selected ? `2px solid ${theme.colors.blue500}` : '2px solid transparent')};
  cursor: pointer;
  transition: 0.3s;
  position: relative;
  
  :hover {
    opacity: 0.8;
  }
`;

const NoneOption = styled.div<{ selected?: boolean }>`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: ${({ selected, theme }) => (selected ? theme.colors.blue500 : theme.colors.primary300)};
  border: ${({ selected, theme }) => (selected ? `2px solid ${theme.colors.blue500}` : '2px solid transparent')};
  cursor: pointer;
  transition: 0.3s;
  display: flex;
  align-items: center;
  justify-content: center;
  
  :hover {
    opacity: 0.8;
  }
`;

export const Banner = styled(Card)`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
  margin-top: 24px;
  background: ${({ theme }) => theme.colors.primary800};
  
  @media (min-width: 880px) {
    flex-direction: row;
  }
`;

export const BannerContent = styled(Column)`
  flex: 1;
  height: -webkit-fill-available;
  justify-content: space-around;
  width: 100%;
  
  @media (min-width: 880px) {
    width: auto;
  }
`;

export const BannerTitle = styled(Text)`
  font-weight: 500;
  font-size: 24px;
  line-height: 32px;
`;

export const EagleImg = styled.img`
  height: 160px;
  width: 160px;
  margin: -24px -24px 0 -24px;
  order: -1;
  
  @media (min-width: 880px) {
    height: 176px;
    width: 176px;
    margin: -24px;
    order: 0;
  }
`;

const STPUZZLE_CONTRACT = "3PQ5u6ipEAxgvKP5a9Qq8srsKLJP92fRkjJ";
const STPUZZLE_ASSET_ID = "3jXnyztUEVPLyAhwcYdAuoLtbZi55QqbHvYzWekfkGNo";
const NODE_URL = "https://nodes.wavesnodes.com";

interface AmbassadorData {
  domain: string;
  address: string;
  name: string;
  imageUrl: string;
}

const MintRedeem: React.FC = observer(() => {
  const { accountStore, notificationStore } = useStores();
  const [activeTab, setActiveTab] = useState(0);
  const [selectedAmbassador, setSelectedAmbassador] = useState("");
  const [ambassadors, setAmbassadors] = useState<AmbassadorData[]>([]);
  const [lpPrice, setLpPrice] = useState<BN | null>(null);
  const [inputAmount, setInputAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [puzzleBalance, setPuzzleBalance] = useState<BN>(BN.ZERO);
  const [stPuzzleBalance, setStPuzzleBalance] = useState<BN>(BN.ZERO);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await nodeService.evaluate(STPUZZLE_CONTRACT, "getLPPrice(false)");
        console.log("getLPPrice result:", result);
        if (result?.result?.type === "Tuple") {
          const tupleValue = result.result.value as { _2: { type: string; value: number } };
          const value = tupleValue._2?.value;
          if (value) {
            setLpPrice(new BN(value).div(1e8));
          }
        }
      } catch (error) {
        console.error("Failed to fetch LP price:", error);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    const fetchAmbassadors = async () => {
      try {
        const response = await fetch(
          `${NODE_URL}/addresses/data/${STPUZZLE_CONTRACT}`
        );
        const data = await response.json();

        const refDomainsEntry = data.find((entry: any) => entry.key === "ref_domains");
        if (!refDomainsEntry) return;

        const domains = refDomainsEntry.value
          .split(",")
          .filter((d: string) => d.trim() !== "");

        const ambassadorsList: AmbassadorData[] = domains.map((domain: string) => {
          const refDataEntry = data.find(
            (entry: any) => entry.key === `ref_${domain}_data`
          );

          if (refDataEntry) {
            const [address, name, imageUrl] = refDataEntry.value.split("__");
            return {
              domain,
              address,
              name,
              imageUrl,
            };
          }

          return null;
        }).filter(Boolean);

        setAmbassadors(ambassadorsList);
      } catch (error) {
        console.error("Failed to fetch ambassadors:", error);
      }
    };

    fetchAmbassadors();
  }, []);

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
          const balance = new BN(stPuzzleAsset.balance).div(1e8);
          setStPuzzleBalance(balance);
        } else {
          setStPuzzleBalance(BN.ZERO);
        }
        
        const puzzleAsset = balances.find(b => b.assetId === "HEB8Qaw9xrWpWs8tHsiATYGBWDBtP2S7kcPALrMu43AS");
        if (puzzleAsset) {
          const balance = new BN(puzzleAsset.balance).div(1e8);
          setPuzzleBalance(balance);
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
  }, [accountStore.address]);

  const handleMaxClick = () => {
    const maxBalance = activeTab === 0 ? puzzleBalance : stPuzzleBalance;
    console.log("Max clicked, tab:", activeTab, "puzzle balance:", puzzleBalance.toString(), "stPuzzle balance:", stPuzzleBalance.toString(), "maxBalance:", maxBalance.toString());
    setInputAmount(maxBalance.toString());
  };

  const calculateOutput = (): string => {
    if (!inputAmount || !lpPrice) return "";
    const input = new BN(inputAmount);
    if (input.isNaN() || input.lte(0)) return "";

    if (activeTab === 0) {
      return input.div(lpPrice).toFixed(8);
    } else {
      return input.times(lpPrice).toFixed(8);
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
            dApp: STPUZZLE_CONTRACT,
            payment: [
              {
                assetId: "HEB8Qaw9xrWpWs8tHsiATYGBWDBtP2S7kcPALrMu43AS",
                amount
              }
            ],
            call: {
              function: "mintLP",
              args: [
                { type: "string" as const, value: selectedAmbassador }
              ]
            }
          }
        : {
            dApp: STPUZZLE_CONTRACT,
            payment: [
              {
                assetId: STPUZZLE_ASSET_ID,
                amount
              }
            ],
            call: {
              function: "redeemLP",
              args: []
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
            const balances = await nodeService.getAddressBalances(accountStore.address);
            
            const stPuzzleAsset = balances.find(b => b.assetId === STPUZZLE_ASSET_ID);
            if (stPuzzleAsset) {
              setStPuzzleBalance(new BN(stPuzzleAsset.balance).div(1e8));
            } else {
              setStPuzzleBalance(BN.ZERO);
            }
            
            const puzzleAsset = balances.find(b => b.assetId === "HEB8Qaw9xrWpWs8tHsiATYGBWDBtP2S7kcPALrMu43AS");
            if (puzzleAsset) {
              setPuzzleBalance(new BN(puzzleAsset.balance).div(1e8));
            } else {
              setPuzzleBalance(BN.ZERO);
            }
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
                {activeTab === 0 ? "PUZZLE" : "stPUZZLE"}
              </Text>
            </Column>
            <Column style={{ alignItems: "center" }}>
              <ArrowIcon>→</ArrowIcon>
              <SizedBox height={4} />
              {lpPrice && (
                <Text size="small" type="secondary">
                  {activeTab === 0
                    ? `${(1 / lpPrice.toNumber()).toFixed(4)}`
                    : `${lpPrice.toFixed(4)}`
                  }
                </Text>
              )}
            </Column>
            <Column style={{ flex: 1 }}>
              <Input
                placeholder="0.0"
                disabled
                value={calculateOutput()}
              />
              <SizedBox height={4} />
              <Text size="small" type="secondary">
                {activeTab === 0 ? "stPUZZLE" : "PUZZLE"}
              </Text>
            </Column>
          </ConversionRow>

          {activeTab === 0 && (
            <AmbassadorSelector>
              <AmbassadorLabel type="secondary" size="small">
                Choose your ambassador
              </AmbassadorLabel>
              <AmbassadorCircles>
                <NoneOption
                  selected={selectedAmbassador === ""}
                  onClick={() => setSelectedAmbassador("")}
                  title="None"
                >
                  <Text size="small" textAlign="center" type={selectedAmbassador === "" ? "light" : "secondary"}>
                    None
                  </Text>
                </NoneOption>
                {ambassadors.map((ambassador) => (
                  <AmbassadorCircle
                    key={ambassador.domain}
                    selected={selectedAmbassador === ambassador.domain}
                    imageUrl={ambassador.imageUrl}
                    onClick={() => setSelectedAmbassador(ambassador.domain)}
                    title={ambassador.name}
                  />
                ))}
              </AmbassadorCircles>
            </AmbassadorSelector>
          )}

          <Button fixed onClick={handleMintRedeem} disabled={loading}>
            {loading ? "Processing..." : activeTab === 0 ? "Mint" : "Redeem"}
          </Button>
        </Column>
      </Container>
    </Root>
  );
});

export default MintRedeem;
