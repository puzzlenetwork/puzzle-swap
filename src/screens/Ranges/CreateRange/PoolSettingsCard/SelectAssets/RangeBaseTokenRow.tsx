import { Column, Row } from "@components/Flex";
import SizedBox from "@components/SizedBox";
import Switch from "@components/Switch";
import TitleWithTips from "@components/TitleWithTips";
import Text from "@components/Text";
import BN from "@src/utils/BN";
import AssetSelector from "./AssetSelector";
import ShareTokenInput from "./ShareTokenInput";
import { IRangeToken } from "../../CreateRangeVm";
import Balance from "@src/entities/Balance";
import { ReactComponent as Lock } from "@src/assets/icons/lock.svg";
import { ReactComponent as Unlock } from "@src/assets/icons/unlock.svg";
import styled from "@emotion/styled";
import { observer } from "mobx-react-lite";
import LogSliderWithImage from "@src/components/LogSliderWithImage";

const StyledTable = styled.table`
  width: 100%;
  tr {
    padding-top: 20px;

    td {
      padding: 0 5px;
    }
  }
`;

interface IParams {
  token: IRangeToken;
  tokensToAdd: Balance[];
  equalShares: boolean;
  setEqualShares: (value: boolean) => void;
  replaceAssetInRange: (assetId: string, newAsset: string) => void;
  changeAssetShareInRange: (assetId: string, share: BN) => void;
  changeAssetLeverageInRange: (assetId: string, leverage: BN) => void;
  updateLockedState: (assetId: string, locked: boolean) => void;
}

const RangeBaseTokenRow: React.FC<IParams> = ({
  equalShares,
  setEqualShares,
  token,
  tokensToAdd,
  replaceAssetInRange,
  changeAssetShareInRange,
  changeAssetLeverageInRange,
  updateLockedState
}) => (
  <StyledTable>
    <thead>
      <tr>
        <th>
          <TitleWithTips
            type="primary"
            size="medium"
            title="Base Token"
            description="This is your reference asset — all other token prices in the range are set relative to it."
          />
        </th>
        <th>
          <TitleWithTips
            type="primary"
            size="medium"
            title="Leverage"
            description="Leverage defines how much virtual balance a token has compared to its real balance in the pool."
          />
        </th>
        <th>
          <Row alignItems="center" justifyContent="flex-end">
            <Text weight={500} size="medium" fitContent nowrap>
              Equal Shares
            </Text>
            <SizedBox width={8} />
            <Switch value={equalShares} onChange={() => setEqualShares(!equalShares)} size="small" />
          </Row>
        </th>
      </tr>
      <tr style={{ height: 12 }} />
    </thead>
    <tbody>
      <tr>
        <td width="10%">
          <AssetSelector asset={token.asset} balances={tokensToAdd} onUpdateAsset={replaceAssetInRange} />
        </td>
        <td width="80%">
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
          </Row>
        </td>
      </tr>
    </tbody>
  </StyledTable>
);

export default observer(RangeBaseTokenRow);
