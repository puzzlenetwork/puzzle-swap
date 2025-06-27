import styled from "@emotion/styled";
import React, { JSX, useState } from "react";
import Card from "@components/Card";
import Text from "@components/Text";
import SizedBox from "@components/SizedBox";
import Notification from "@components/Notification";
import Button from "@components/Button";
import { ReactComponent as Add } from "@src/assets/icons/add.svg";
import { observer } from "mobx-react-lite";
import { useCreateRangeVM } from "../../CreateRangeVm";
import TokenCompositionRow from "./TokenCompositionRow";
import TokenSelectModal from "@components/TokensSelectModal/TokenSelectModal";
import Tooltip from "@components/Tooltip";
import { ReactComponent as InfoIcon } from "@src/assets/icons/info.svg";
import { Row } from "@src/components/Flex";
import { useTheme } from "@emotion/react";
import AssetSelector from "./AssetSelector";
import RangeSelector from "./RangeSelector";
import Table from "@src/components/Table";
import BN from "@src/utils/BN";
import ShareTokenInput from "./ShareTokenInput";
import Switch from "@src/components/Switch";

interface IProps {}

const Root = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
`;
const Grid = styled.div`
  display: grid;
  row-gap: 26px;
  padding: 0 0 24px 0;
`;

const SizedBoxStyled = styled(SizedBox)`
  width: calc(100% + 48px);
  margin: 24px 0 24px -24px;
  @media (max-width: 560px) {
    width: calc(100% + 34px);
    margin: 24px 0 24px -17px;
  }
`;

const SelectsAssets: React.FC<IProps> = () => {
  const [addAssetModal, openAssetModal] = useState(false);
  const vm = useCreateRangeVM();
  const theme = useTheme();
  const minShareNotification =
    "Please note that minimal share of token should be 5 %";
  const validRangeNotification =
    "Please note that ranges for all assets should be set and valid, i.e. min price should be less than max price";
  
  return (
    <Root>
      <Text type="secondary" weight={500}>
        Select Assets
      </Text>
      <SizedBox height={8} />
      <Card style={{ width: "100%" }}>

        {!vm.isAllTokensShareMoreThanFive && (
          <>
            <Notification type="error" text={minShareNotification} />
            <SizedBox height={16} />
          </>
        )}
        {!vm.areTouchedTokensRangesValid && (
          <>
            <Notification type="error" text={validRangeNotification} />
            <SizedBox height={16} />
          </>
        )}
        <Row alignItems="center" justifyContent="start">
          <Text fitContent weight={500} nowrap>
            Base token
          </Text>
          <Tooltip
            containerStyles={{ display: "flex", alignItems: "center" }}
            content={
              <Text>
                Base token is used to provide liquidity with single asset. Also
                most of the LP rewards will be accumulated in this token.
              </Text>
            }
          >
            <InfoIcon style={{ marginLeft: 8 }} />
          </Tooltip>
          <Row alignItems="center" justifyContent="flex-end">
            <Text weight={500} fitContent nowrap>
              Equal Shares
            </Text>
            <SizedBox width={8} />
            <Switch
              value={vm.equalShares}
              onChange={() => vm.setEqualShares(!vm.equalShares)}
            />
          </Row>
        </Row>
        <SizedBox height={24} />
        {/* base token selection row */}
        {vm.rangeAssets.slice(0, 1).map(({ asset, share, locked }, index) => {
          return (
            <TokenCompositionRow
              baseToken
              key={index + "select-asset"}
              locked={locked}
              onLockClick={() => vm.updateLockedState(asset.assetId, !locked)}
              onUpdateAsset={vm.replaceAssetInRange}
              balances={vm.tokensToAdd}
              asset={asset}
              share={share}
              setShare={(v) => vm.changeAssetShareInRange(asset.assetId, v)}
              onDelete={() => vm.removeAssetFromRange(asset.assetId)}
            />
          );
        })}
        <SizedBoxStyled
          height={1}
          style={{
            background: theme.colors.primary100,
          }}
        />
        <Row alignItems="center">
          <Text size="medium" weight={500}>
            Composition
          </Text>
          <Row alignItems="center">
            <Text size="medium" weight={500} fitContent nowrap>Set Range</Text>
            <SizedBox width={80} />
            <Text size="medium" weight={500} fitContent nowrap>Max Sell-Off</Text>
            <SizedBox width={8} />
            <Text type="secondary" size="small" fitContent nowrap>(Optional)</Text>
            <SizedBox width={143} />
          </Row>
        </Row>
        <SizedBox height={24} />
        <Grid>
          {/* tokens table */}
          {vm.rangeAssets.slice(1).map(({
            asset,
            share,
            minPrice,
            maxPrice,
            maxSellOff,
            locked
          }, index) => {
            return (
              <TokenCompositionRow
                key={index + "select-asset"}
                balances={vm.balances}
                asset={asset}
                onUpdateAsset={vm.replaceAssetInRange}
                minPrice={minPrice}
                onUpdateMinPrice={(newMinPrice) => vm.updateAssetMinPrice(asset.assetId, newMinPrice)}
                maxPrice={maxPrice}
                onUpdateMaxPrice={(newMaxPrice) => vm.updateAssetMaxPrice(asset.assetId, newMaxPrice)}
                maxSellOff={maxSellOff}
                onUpdateMaxSellOff={(newMaxSellOff) => vm.updateAssetMaxSellOff(asset.assetId, newMaxSellOff)}
                share={share}
                setShare={(v) => vm.changeAssetShareInRange(asset.assetId, v)}
                locked={locked}
                onLockClick={() => vm.updateLockedState(asset.assetId, !locked)}
                onDelete={() => vm.removeAssetFromRange(asset.assetId)}
              />
            );
          })}
        </Grid>
        {vm.rangeAssets.length < 10 && (
          <Button
            fixed
            size="medium"
            kind="secondary"
            onClick={() => openAssetModal(true)}
          >
            Add an asset
            <SizedBox width={10} />
            <Add />
          </Button>
        )}
        <TokenSelectModal
          visible={addAssetModal}
          onSelect={vm.addAssetToRange}
          balances={vm.tokensToAdd}
          onClose={() => openAssetModal(!addAssetModal)}
        />
      </Card>
    </Root>
  );
};
export default observer(SelectsAssets);
