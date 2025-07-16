import { Row } from "@components/Flex";
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
  isLast,
}) => {
  return (
    <>
      <tr style={{height: 20 }} />
      <tr>
        <td width="10%">
          <AssetSelector
            asset={token.asset}
            balances={tokensToAdd}
            onUpdateAsset={replaceAssetInRange}
          />
        </td>
        <td colSpan={2} width="80%">
          <Row alignItems="center">
            <Text size="small" type="secondary" fitContent>1x</Text>
            <SizedBox width={4} />
            <LogSliderWithImage
              value={token.leverage ? (
                token.leverage.gte(500) ? 500 : token.leverage.toNumber()
              ) : 1}
              min={1}
              max={500}
              imageUrl={token.asset.logo}
              onChange={(v) => {
                changeAssetLeverageInRange(token.asset.assetId, new BN(v));
              }}
            />
            <SizedBox width={4} />
            <Text size="small" type="secondary" fitContent>∞</Text>
          </Row>
        </td>
        <td width="10%">
          <Row alignItems="center" justifyContent="flex-end">
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
          </Row>
        </td>
      </tr>
      <tr style={{height: 20 }} />
      <tr>
        <td colSpan={2} width="50%">
          <MaxSellOffSelector
            value={token.maxSellOff}
            onUpdate={(value) => changeAssetMaxSellOffInRange(token.asset.assetId, value)}
          />
        </td>
        <td colSpan={2} width="50%">
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
          <tr style={{height: 20 }} />
          <tr>
            <td colSpan={4}>
              <Divider />
            </td>
          </tr>
        </>
      )}
    </>
  );
}

export default observer(RangeTokenRow);
