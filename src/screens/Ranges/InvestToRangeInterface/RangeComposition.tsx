import styled from "@emotion/styled";
import React, { useMemo, useState } from "react";
import Text from "@components/Text";
import SizedBox from "@components/SizedBox";
import { Column, Row } from "@components/Flex";
import { useInvestToRangeInterfaceVM } from "./InvestToRangeInterfaceVM";
import { observer } from "mobx-react-lite";
import Table from "@components/Table";
import Scrollbar from "@src/components/Scrollbar";
import useWindowSize from "@src/hooks/useWindowSize";
import { useTheme } from "@emotion/react";
import Tooltip from "@src/components/Tooltip";
import { ReactComponent as InfoIcon } from "@src/assets/icons/info.svg";
import { TOKENS_BY_ASSET_ID } from "@src/constants";
import { useStores } from "@src/stores";
import BN from "@src/utils/BN";
import Checkbox from "@src/components/Checkbox";
import { set } from "lodash";
import Select from "@src/components/Select";

interface IProps {}

const Root = styled.div<{ balanceSort?: boolean }>`
  display: flex;
  flex-direction: column;
  padding-top: 24px;

  .value-group {
    width: 20px;
    height: 20px;
    transform: ${({ balanceSort }) => (balanceSort ? "scale(1)" : "scale(1, -1)")};
  }
`;

const Icon = styled.img`
  width: 24px;
  height: 24px;
  border-radius: 12px;
  border: 1px solid #f1f2fe;
`;

const RangeComposition: React.FC<IProps> = () => {
  const theme = useTheme();
  const vm = useInvestToRangeInterfaceVM();
  const { width: screenWidth } = useWindowSize();
  const [filteredTokens, setFilteredTokens] = useState<any[]>([]);
  const [balanceSort, setValueSort] = useState(true);
  const [showSellOff, setShowSellOff] = useState(false);
  const columns = React.useMemo(
    () => [
      { Header: "Asset", accessor: "asset" },
      {
        accessor: "price",
        Header: () => (
          <Row alignItems="center" justifyContent="flex-end">Min ← Current → Max Price</Row>
        ),
      },
      {
        accessor: "balance",
        Header: () => (
          <Row style={{ cursor: "pointer" }} justifyContent="center">
            <Text size="medium" fitContent>
              Fact / Virtual Balance
            </Text>
            <img
              style={{ paddingLeft: 7 }}
              src={theme.images.icons.group}
              alt="group"
              className="value-group"
              onClick={() => setValueSort(!balanceSort)}
            />
          </Row>
        ),
      },
      {
        accessor: "share",
        Header: () => (
          <Row alignItems="center" justifyContent="flex-end">Fact / Target Share</Row>
        ),
      },
      {
        Header: (
          <Tooltip
            config={{
              trigger: "hover",
            }}
            content={
              <Text size="small">Sell-Off is...</Text>
            }
          >
            <Row>
              Sell-Off (100 Min) <InfoIcon style={{ marginLeft: 4 }} />
            </Row>
          </Tooltip>
        ),
        accessor: "selloff",
        columnVisibility: showSellOff,
      },
    ],
    [balanceSort, theme.images.icons.group, showSellOff]
  );
  useMemo(() => {
    const tokens = vm.range!.assets
      .slice()
      .sort((a, b) => {
        // // Stick base token to the top
        // if (a.asset_id === vm.range!.baseTokenId) {
        //   return -1;
        // }
        // if (b.asset_id === vm.range!.baseTokenId) {
        //   return 1;
        // }
        if (a.factBalance.lte(b.factBalance)) {
          return balanceSort ? 1 : -1;
        } else {
          return balanceSort ? -1 : 1;
        }
      })
      .map((a) => ({
        ...a,
        ...TOKENS_BY_ASSET_ID[a.assetId],
      }));

    let totalValue = BN.ZERO;
    tokens.forEach((a) => {
      totalValue = totalValue.plus(a.balanceUsd);
    })

    const data = tokens
      .map((a) => ({
        onClick: null,
        asset: (
          <Row alignItems="center" mainAxisSize="fit-content">
            <Icon src={a.logo} alt="logo" />
            <SizedBox width={8} />
            <Text fitContent>{a.symbol}</Text>
          </Row>
        ),
        price: (a.assetId === vm.range!.baseTokenId) ? (
          <Row alignItems="center" justifyContent="flex-end">{"$" + a.balanceUsd.toFormat(2)}</Row>
        ) : (
          <Row alignItems="center" justifyContent="flex-end">
            <Text fitContent type="secondary" size="small">${a.minPrice.toSmallFormat()}</Text>
            <SizedBox width={4} />
            <Text fitContent> ← ${a.currentPrice.toSmallFormat()} → </Text>
            <SizedBox width={4} />
            <Text fitContent type="secondary" size="small">${a.maxPrice.toSmallFormat()}</Text>
          </Row>
        ),
        balance: (
          <Row alignItems="center" justifyContent="center">
            <Text fitContent>
              {a.factBalance.toSmallFormat()} /
            </Text>
            <SizedBox width={4} />
            <Text fitContent type="secondary">
              {a.balance.toSmallFormat()}
            </Text>
          </Row>
        ),
        share: (
          <Row alignItems="center" justifyContent="flex-end">
            <Text fitContent>
              {a.balanceUsd.div(totalValue).times(100).toFormat(2)}% /
            </Text>
            <SizedBox width={4} />
            <Text fitContent type="secondary">
              {a.share.toFormat(2)}%
            </Text>
          </Row>
        )
      }));
    setFilteredTokens(data);
  }, [balanceSort, vm.range]);
  const { width } = useWindowSize();
  return (
    <Root balanceSort={balanceSort}>
      <Row alignItems="center">
        <Text weight={500} type="secondary">
          Range composition
        </Text>
        <Row alignItems="center" mainAxisSize="fit-content">
          <Text fitContent nowrap>Show Sell-Off</Text>
          <SizedBox width={8} />
          <Checkbox onChange={() => setShowSellOff(!showSellOff)} checked={showSellOff} />
          <SizedBox width={20} />
          <Text fitContent nowrap>Show Asset Prices in</Text>
          <SizedBox width={8} />
          <Select
            kind="text"
            textSize="medium"
            options={[
              {
                key: "usd",
                title: "USD",
              },
              ...vm.range!.assets.map((asset) => ({
                key: asset.assetId,
                title: asset.name,
              }))
            ]}
            onSelect={({ key }) => { }}
            selected={{
              key: "usd",
              title: "USD",
            }}
          />
        </Row>
      </Row>
      <SizedBox height={8} />
      <Scrollbar
        style={{
          maxWidth: screenWidth && screenWidth > 1160 ? "750px" : (screenWidth && screenWidth > 880 ? "calc(((100vw - 32px - 40px) / 3) * 2)" : "calc(100vw - 32px)"),
          borderRadius: 16,
        }}
      >
        {width && (
          <Table
            fitContent={width < 402}
            columns={columns}
            data={filteredTokens}
            style={{ whiteSpace: "nowrap" }}
            initialState={{
              hiddenColumns: [!showSellOff && "selloff"],
            }}
          />
        )}
      </Scrollbar>
      <SizedBox height={16} />
    </Root>
  );
};
export default observer(RangeComposition);
