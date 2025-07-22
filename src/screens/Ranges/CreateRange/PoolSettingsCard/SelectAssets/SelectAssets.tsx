import styled from "@emotion/styled";
import React, { useMemo, useState } from "react";
import Card from "@components/Card";
import Text from "@components/Text";
import SizedBox from "@components/SizedBox";
import Button from "@components/Button";
import { ReactComponent as Add } from "@src/assets/icons/add.svg";
import { observer } from "mobx-react-lite";
import { useCreateRangeVM } from "../../CreateRangeVm";
import TokenSelectModal from "@components/TokensSelectModal/TokenSelectModal";
import { useTheme } from "@emotion/react";
import RangeBaseTokenRow from "./RangeBaseTokenRow";
import RangeTokenRow from "./RangeTokenRow";
import Table from "@src/components/Table";
import { Row } from "@src/components/Flex";
import RoundTokenIcon from "@src/components/RoundTokenIcon";
import BN from "@src/utils/BN";
import { ReactComponent as Autostaking } from "@src/assets/icons/autostaking.svg";

interface IProps {}

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
    margin: 24px 0 24px -17px;
  }
`;

const StyledTable = styled.table`
  width: 100%;
  tr {
    padding-top: 20px;

    td {
      padding: 0 5px;
    }
  }
`;

const SelectsAssets: React.FC<IProps> = () => {
  const [addAssetModal, openAssetModal] = useState(false);
  const vm = useCreateRangeVM();
  const theme = useTheme();

  const cols = [
    { Header: "Token", accessor: "token" },
    { Header: "Min ← Current → Max Price", accessor: "price" },
    { Header: "Max Sell-Off", accessor: "maxSellOff" },
    { Header: "Share", accessor: "share" },
  ];

  const data = vm.rangeAssets.map((asset, index) => {
    console.log(`
Asset: ${asset.asset.symbol}
Min Price: ${asset.minPrice ? BN.formatUnits(asset.minPrice, asset.asset.decimals).toSmallFormat() : "-"}
Max Price: ${asset.maxPrice ? BN.formatUnits(asset.maxPrice, asset.asset.decimals).toSmallFormat() : "-"}
`)
    return {
      token: (
        <Row mainAxisSize="fit-content" key={asset.asset.symbol}>
          <RoundTokenIcon
            src={asset.asset.logo}
          />
          <SizedBox width={8} />
          <Text type="primary" weight={500} size="medium" fitContent>
            {asset.asset.symbol}
          </Text>
          {asset.apr && (
            <>
              <SizedBox width={8} />
              <Text type="success" size="medium" weight={500} fitContent>
                {asset.apr.toFixed(2)}%
              </Text>
              <SizedBox width={6} />
              <Autostaking width={20} height={20} />
            </>
          )}
        </Row>
      ),
      price: (
        <Text type="primary" weight={500} size="medium">
          {index === 0 ? "Base" :
            (
              (asset.minPrice ? `${BN.formatUnits(asset.minPrice, asset.asset.decimals).toFixed(2)} ← ` : "")
              + (asset.initialPrice ? BN.formatUnits(asset.initialPrice, asset.asset.decimals).toFixed(2) : "-")
              + (asset.maxPrice ? ` → ${BN.formatUnits(asset.maxPrice, asset.asset.decimals).toFixed(2)}` : "-")
            )
          }
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
    }
  });

  return (
    <Root>
      <Text type="secondary" weight={500}>
        Tokens and Weights
      </Text>
      <SizedBox height={8} />
      <Card style={{ width: "100%" }}>
        <RangeBaseTokenRow
          equalShares={vm.equalShares}
          setEqualShares={vm.setEqualShares}
          token={vm.rangeAssets[0]}
          tokensToAdd={vm.tokensToAdd}
          replaceAssetInRange={vm.replaceAssetInRange}
          changeAssetLeverageInRange={vm.updateAssetLeverage}
          changeAssetShareInRange={vm.changeAssetShareInRange}
          updateLockedState={vm.updateLockedState}
        />
        
        <SizedBox height={12} />
        <SizedBoxStyled
          height={1}
          style={{
            background: theme.colors.primary100,
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
                />
              );
            })}
          </tbody>
        </StyledTable>

        <SizedBox height={24} />

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
      <SizedBox height={24} />
      <Text type="secondary" weight={500}>
        Preview
      </Text>
      <SizedBox height={8} />
      <Card style={{ width: "100%" }}>
        <Table
          columns={cols}
          data={data}
        />
      </Card>
    </Root>
  );
};
export default observer(SelectsAssets);
