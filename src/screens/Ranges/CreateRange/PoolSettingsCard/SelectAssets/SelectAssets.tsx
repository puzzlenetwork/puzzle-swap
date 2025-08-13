import Button from "@components/Button";
import Card from "@components/Card";
import SizedBox from "@components/SizedBox";
import Text from "@components/Text";
import TokenSelectModal from "@components/TokensSelectModal/TokenSelectModal";
import { useTheme } from "@emotion/react";
import styled from "@emotion/styled";
import { ReactComponent as Add } from "@src/assets/icons/add.svg";
import { ReactComponent as Autostaking } from "@src/assets/icons/autostaking.svg";
import { ReactComponent as InfoIcon } from "@src/assets/icons/info.svg";
import { Row } from "@src/components/Flex";
import RoundTokenIcon from "@src/components/RoundTokenIcon";
import Table from "@src/components/Table";
import Tooltip from "@src/components/Tooltip";
import BN from "@src/utils/BN";
import { observer } from "mobx-react-lite";
import React, { useState } from "react";
import { useCreateRangeVM } from "../../CreateRangeVm";
import RangeBaseTokenRow from "./RangeBaseTokenRow";
import RangeTokenRow from "./RangeTokenRow";
import Skeleton from "react-loading-skeleton";
import Scrollbar from "@components/Scrollbar";
import Notification from "@components/Notification";

interface IProps { }

const Root = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
`;

const SizedBoxStyled = styled(SizedBox)`
  box-sizing: border-box;
  width: 100%;
  margin: 24px 0 24px -24px;
  @media (max-width: 560px) {
    margin: 24px 0;
  }
`;

const StyledTable = styled.table`
  width: 100%;
  border-collapse: collapse;

  tr {
    padding-top: 20px;
  }

  td {
    padding: 0 5px;
  }

  @media (max-width: 880px) {
    /* Switch table to block layout on small screens so cells stack and rows can wrap */
    display: block;

    thead {
      display: none; /* hide header for compact mobile layout */
    }

    tbody,
    tr,
    td {
      display: block;
      width: 100% !important; /* override any width attributes on <td> */
      box-sizing: border-box;
    }

    tr {
      padding-top: 0;
      margin: 12px 0; /* spacing between logical rows */
    }

    td {
      padding: 6px 0; /* increase vertical padding for readability */
    }
  }
`;

const SelectsAssets: React.FC<IProps> = () => {
  const [addAssetModal, openAssetModal] = useState(false);
  const vm = useCreateRangeVM();
  const theme = useTheme();

  const cols = [
    {
      Header: () => (
        <Text size="medium" type="secondary" nowrap>
          Token
        </Text>
      ),
      accessor: "token"
    },
    {
      Header: () => (
        <Tooltip content={"Given in base token"} config={{ placement: "top" }}>
          <Row alignItems="center" mainAxisSize="fit-content">
            <Text size="medium" type="secondary" nowrap>
              Min ← Current → Max Price
            </Text>
            <SizedBox width={4} />
            <InfoIcon />
          </Row>
        </Tooltip>
      ),
      accessor: "price"
    },
    {
      Header: () => (
        <Text size="medium" type="secondary" nowrap>
          Max Sell-Off
        </Text>
      ),
      accessor: "maxSellOff"
    },
    {
      Header: () => (
        <Text size="medium" type="secondary" nowrap>
          Share
        </Text>
      ),
      accessor: "share"
    }
  ];

  const data = vm.rangeAssets.map((asset, index) => {
    return {
      token: (
        <Row mainAxisSize="fit-content" key={asset.asset.symbol}>
          <RoundTokenIcon src={asset.asset.logo} />
          <SizedBox width={8} />
          <Text type="primary" weight={500} size="medium" fitContent>
            {asset.asset.symbol}
          </Text>
          {asset.apr && (
            <Tooltip content="Some tokens keep earning yield even while inside a range.">
              <Row mainAxisSize="fit-content">
                <SizedBox width={8} />
                <Text type="success" size="medium" weight={500} fitContent>
                  {asset.apr.toFixed(2)}%
                </Text>
                <SizedBox width={6} />
                <Autostaking width={20} height={20} />
              </Row>
            </Tooltip>
          )}
        </Row>
      ),
      price: index === 0 ? (
        <Text type="primary" weight={500} size="medium">
          Base
        </Text>
      ) : !asset.priceLoaded ? (
        <Skeleton height={18} width={128} />
      ) : (
        <Text type="primary" weight={500} size="medium">
          {(asset.minPrice
            ? `${BN.formatUnits(asset.minPrice, asset.asset.decimals).toAdaptiveFormat(true)} ← `
            : "") +
            (asset.initialPrice
              ? BN.formatUnits(asset.initialPrice, asset.asset.decimals).toAdaptiveFormat(true)
              : "-") +
            (asset.maxPrice
              ? asset.leverage?.lte(1) || !asset.maxPrice.isFinite()
                ? " → ∞"
                : ` → ${BN.formatUnits(asset.maxPrice, asset.asset.decimals).toAdaptiveFormat(true)}`
              : "-")}
        </Text>
      ),
      maxSellOff: (
        <Text type="primary" weight={500} size="medium">
          {asset.maxSellOff ? `${asset.maxSellOff.toNumber()}%` : "-"}
        </Text>
      ),
      share: (
        <Text type="primary" weight={500} size="medium">
          {asset.share ? `${BN.formatUnits(asset.share, 1).toNumber()}%` : "-"}
        </Text>
      )
    };
  });

  return (
    <Root>
      <Text type="secondary" weight={500}>
        Tokens and Weights
      </Text>
      <SizedBox height={8} />
      <Card style={{ width: "100%" }}>
        <Notification
          type="info"
          text={`After choosing the leverage take a look at the Preview table to check out the Min <-> Max price change, as Leverage impacts it directly.`}
        />
        <SizedBox height={24} />
        <RangeBaseTokenRow
          equalShares={vm.equalShares}
          setEqualShares={vm.setEqualShares}
          token={vm.rangeAssets[0]}
          tokensToAdd={vm.tokensToAdd}
          replaceAssetInRange={vm.replaceAssetInRange}
          changeAssetLeverageInRange={vm.updateAssetLeverage}
          changeAssetShareInRange={vm.changeAssetShareInRange}
          updateLockedState={vm.updateLockedState}
          shareError={vm.totalTokenShare.gt(1000) && vm.rangeAssets[0].share.gt(0) && !vm.rangeAssets[0].locked}
        />

        <SizedBoxStyled
          height={1}
          style={{
            background: theme.colors.primary100
          }}
        />

        <StyledTable>
          <thead>
            <tr>
              <th>
                <Text weight={500} size="medium" fitContent nowrap>
                  Token
                </Text>
              </th>
            </tr>
          </thead>
          <tbody>
            {vm.rangeAssets.slice(1).map((asset, index) => {
              return (
                <RangeTokenRow
                  key={index + "range-token-row"}
                  token={asset}
                  tokensToAdd={vm.tokensToAdd}
                  replaceAssetInRange={vm.replaceAssetInRange}
                  changeAssetLeverageInRange={vm.updateAssetLeverage}
                  changeAssetShareInRange={vm.changeAssetShareInRange}
                  changeAssetMaxSellOffInRange={vm.updateAssetMaxSellOff}
                  updateLockedState={vm.updateLockedState}
                  changeAssetInitialPriceInRange={vm.updateAssetInitialPrice}
                  deleteAssetFromRange={vm.removeAssetFromRange}
                  baseTokenSymbol={vm.rangeAssets[0].asset.symbol}
                  isLast={index === vm.rangeAssets.length - 2}
                  shareError={vm.totalTokenShare.gt(1000) && asset.share.gt(0) && !asset.locked}
                />
              );
            })}
          </tbody>
        </StyledTable>

        <SizedBox height={24} />

        {vm.rangeAssets.length < 10 && (
          <Button fixed size="medium" kind="secondary" onClick={() => openAssetModal(true)}>
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
      <SizedBox height={24} />
      <Text type="secondary" weight={500}>
        Preview
      </Text>
      <SizedBox height={8} />
      <Card style={{ width: "100%", padding: 0, overflow: "hidden" }}>
        <Scrollbar style={{ maxWidth: "calc(100vw - 32px)", borderRadius: 16 }}>
          <Table columns={cols} data={data} />
        </Scrollbar>
      </Card>
    </Root>
  );
};
export default observer(SelectsAssets);
