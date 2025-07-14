import { Row } from "@components/Flex"
import SizedBox from "@components/SizedBox"
import Switch from "@components/Switch"
import TitleWithTips from "@components/TitleWithTips"
import Text from "@components/Text"
import BN from "@src/utils/BN"
import AssetSelector from "./AssetSelector"
import ShareTokenInput from "./ShareTokenInput"
import { IRangeToken } from "../../CreateRangeVm"
import Balance from "@src/entities/Balance"
import { ReactComponent as Lock } from "@src/assets/icons/lock.svg";
import { ReactComponent as Unlock } from "@src/assets/icons/unlock.svg";
import { ReactComponent as Close } from "@src/assets/icons/smallClose.svg";
import styled from "@emotion/styled";
import { observer } from "mobx-react-lite"

const StyledClose = styled(Close)`
  margin-left: 10px;
  width: 16px;
  height: 16px;
  opacity: 0.5;
`;

interface IParams {
  token: IRangeToken;
  tokensToAdd: Balance[];
  equalShares: boolean;
  setEqualShares: (value: boolean) => void;
  replaceAssetInRange: (assetId: string, newAsset: string) => void;
  changeAssetShareInRange: (assetId: string, share: BN) => void;
  updateLockedState: (assetId: string, locked: boolean) => void;
}

const RangeBaseTokenRow: React.FC<IParams> = ({
  equalShares,
  setEqualShares,
  token,
  tokensToAdd,
  replaceAssetInRange,
  changeAssetShareInRange,
  updateLockedState,
}) => (
  <table>
    <thead>
      <tr>
        <th>
          <TitleWithTips
            type="primary"
            size="medium"
            title="Base Token"
            description="TODO"
          />
        </th>
        <th>
          <TitleWithTips
            type="primary"
            size="medium"
            title="Leverage"
            description="TODO"
          />
        </th>
        <th>
          <Row alignItems="center" justifyContent="flex-end">
            <Text weight={500} size="medium" fitContent nowrap>
              Equal Shares
            </Text>
            <SizedBox width={8} />
            <Switch
              value={equalShares}
              onChange={() => setEqualShares(!equalShares)}
              size="small"
            />
          </Row>
        </th>
      </tr>
      <tr style={{ height: 12 }} />
    </thead>
    <tbody>
      <tr>
        <td>
          <AssetSelector
            asset={token.asset}
            balances={tokensToAdd}
            onUpdateAsset={replaceAssetInRange}
          />
        </td>
        <td>
          <Text>TODO</Text>
        </td>
        <td>
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
            <StyledClose />
          </Row>
        </td>
      </tr>
    </tbody>
  </table>
)

export default observer(RangeBaseTokenRow);
