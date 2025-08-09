import { Column, Row } from "@components/Flex";
import SizedBox from "@components/SizedBox";
import Text from "@components/Text";
import BN from "@src/utils/BN";
import AssetSelector from "./AssetSelector";
import ShareTokenInput from "./ShareTokenInput";
import Balance from "@src/entities/Balance";
import { IRangeToken } from "../../CreateRangeVm";
import { observer } from "mobx-react-lite";
import { ReactComponent as Lock } from "@src/assets/icons/lock.svg";
import { ReactComponent as Unlock } from "@src/assets/icons/unlock.svg";
import { ReactComponent as Close } from "@src/assets/icons/smallClose.svg";
import styled from "@emotion/styled";
import MaxSellOffSelector from "./MaxSellOffSelector";
import InitialPriceSelector from "./InitialPriceSelector";
import Divider from "@src/components/Divider";
import LogSliderWithImage from "@src/components/LogSliderWithImage";

const StyledClose = styled(Close)`
  margin-left: 10px;
  width: 16px;
  height: 16px;
  cursor: pointer;
`;

// Show labels only on mobile to replace hidden table headers
const MobileLabel = styled(Text)`
  display: none;
  @media (max-width: 880px) {
    display: block;
    margin-bottom: 12px;
  }
`;

// On small screens allow row content to wrap so the slider and controls stack nicely
const WrappingRow = styled(Row)`
  flex-wrap: wrap;
  gap: 6px;
  width: fit-content;
  @media (min-width: 880px) {
    flex-wrap: nowrap;
    gap: 0;
  }
`;

// Mobile-only row wrapper
const ShowOnMobileTr = styled.tr`
  display: none;
  @media (max-width: 880px) {
    display: block;
  }
`;

// Hide specific cells on mobile
const HiddenOnMobileTd = styled.td`
  @media (max-width: 880px) {
    display: none !important;
  }
`;

const HiddenOnMobileTr = styled.tr`
  @media (max-width: 880px) {
    display: none !important;
  }
`;

interface IParams {
  token: IRangeToken;
  tokensToAdd: Balance[];
  replaceAssetInRange: (assetId: string, newAsset: string) => void;
  changeAssetLeverageInRange: (assetId: string, leverage: BN) => void;
  changeAssetShareInRange: (assetId: string, share: BN) => void;
  updateLockedState: (assetId: string, locked: boolean) => void;
  changeAssetMaxSellOffInRange: (assetId: string, maxSellOff: BN) => void;
  changeAssetInitialPriceInRange: (assetId: string, initialPrice: BN) => void;
  deleteAssetFromRange: (assetId: string) => void;
  baseTokenSymbol?: string;
  isLast?: boolean;
}

const RangeTokenRow: React.FC<IParams> = ({
  token,
  tokensToAdd,
  replaceAssetInRange,
  changeAssetLeverageInRange,
  changeAssetShareInRange,
  updateLockedState,
  changeAssetMaxSellOffInRange,
  changeAssetInitialPriceInRange,
  deleteAssetFromRange,
  baseTokenSymbol,
  isLast
}) => {
  return (
    <>
      <HiddenOnMobileTr style={{ height: 20 }} />
      {/* Mobile-only combined row: Asset selector + Share controls in one line */}
      <ShowOnMobileTr>
        <td colSpan={4}>
          <Row alignItems="center" justifyContent="space-between" style={{ gap: 8, flexWrap: "nowrap" }}>
            <AssetSelector asset={token.asset} balances={tokensToAdd} onUpdateAsset={replaceAssetInRange} />
            <WrappingRow alignItems="center" justifyContent="flex-end" style={{ flexShrink: 0 }}>
              <ShareTokenInput
                amount={token.share}
                onChange={(v) => changeAssetShareInRange(token.asset.assetId, v)}
                disabled={token.locked}
                maxValue={new BN(1000)}
              />
              <SizedBox width={10} />
              {token.locked ? (
                <Lock onClick={() => updateLockedState(token.asset.assetId, false)} style={{ cursor: "pointer" }} />
              ) : (
                <Unlock onClick={() => updateLockedState(token.asset.assetId, true)} style={{ cursor: "pointer" }} />
              )}
              <StyledClose onClick={() => deleteAssetFromRange(token.asset.assetId)} />
            </WrappingRow>
          </Row>
        </td>
      </ShowOnMobileTr>
      <tr>
        <HiddenOnMobileTd width="10%">
          <AssetSelector asset={token.asset} balances={tokensToAdd} onUpdateAsset={replaceAssetInRange} />
        </HiddenOnMobileTd>
        <td colSpan={2} width="80%">
          <MobileLabel type="primary" size="medium" weight={500}>
            Leverage
          </MobileLabel>
          <Row alignItems="center">
            <Text size="small" type="secondary" fitContent>
              1x
            </Text>
            <SizedBox width={4} />
            <LogSliderWithImage
              value={token.leverage ? (token.leverage.gte(500) ? 500 : token.leverage.toNumber()) : 1}
              min={1}
              max={500}
              imageUrl={token.asset.logo}
              onChange={(v) => {
                changeAssetLeverageInRange(token.asset.assetId, new BN(v));
              }}
              minTooltipContent={
                <Column>
                  <Text size="small" nowrap>
                    Leverage 1x means fact balance = virt balance. You will
                  </Text>
                  <Text size="small" nowrap>
                    need to provide the entire balance as liquidity and there
                  </Text>
                  <Text size="small" nowrap>
                    will be no max price for this token.
                  </Text>
                </Column>
              }
              maxTooltipContent={
                <Column>
                  <Text size="small" nowrap>
                    The infinite leverage means there will be no fact balance
                  </Text>
                  <Text size="small" nowrap>
                    for this token: you won't need to provide liquidity in it
                  </Text>
                  <Text size="small" nowrap>
                    and it won't be available for purchase in the range.
                  </Text>
                </Column>
              }
            />
            <SizedBox width={4} />
            <Text size="small" type="secondary" fitContent>
              ∞
            </Text>
          </Row>
        </td>
        <HiddenOnMobileTd width="10%">
          <WrappingRow alignItems="center" justifyContent="flex-end">
            <ShareTokenInput
              amount={token.share}
              onChange={(v) => changeAssetShareInRange(token.asset.assetId, v)}
              disabled={token.locked}
              maxValue={new BN(1000)}
            />
            <SizedBox width={10} />
            {token.locked ? (
              <Lock onClick={() => updateLockedState(token.asset.assetId, false)} style={{ cursor: "pointer" }} />
            ) : (
              <Unlock onClick={() => updateLockedState(token.asset.assetId, true)} style={{ cursor: "pointer" }} />
            )}
            <StyledClose onClick={() => deleteAssetFromRange(token.asset.assetId)} />
          </WrappingRow>
        </HiddenOnMobileTd>
      </tr>
      <HiddenOnMobileTr style={{ height: 20 }} />
      <tr>
        <td colSpan={2} width="50%">
          <MobileLabel type="primary" size="medium" weight={500}>
            Max Sell-Off
          </MobileLabel>
          <MaxSellOffSelector
            value={token.maxSellOff}
            onUpdate={(value) => changeAssetMaxSellOffInRange(token.asset.assetId, value)}
          />
        </td>
        <td colSpan={2} width="50%">
          <MobileLabel type="primary" size="medium" weight={500}>
            Change Initial Price
          </MobileLabel>
          <InitialPriceSelector
            asset={token}
            baseTokenSymbol={baseTokenSymbol}
            value={token.initialPrice || BN.ZERO}
            onUpdate={(value) => changeAssetInitialPriceInRange(token.asset.assetId, value)}
          />
        </td>
      </tr>
      {!isLast && (
        <>
          <tr style={{ height: 20 }} />
          <tr>
            <td colSpan={4}>
              <Divider />
            </td>
          </tr>
        </>
      )}
    </>
  );
};

export default observer(RangeTokenRow);
