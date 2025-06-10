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
  const { poolsStore } = useStores();
  const theme = useTheme();
  const vm = useInvestToRangeInterfaceVM();
  const [filteredTokens, setFilteredTokens] = useState<any[]>([]);
  const [balanceSort, setValueSort] = useState(true);
  const columns = React.useMemo(
    () => [
      { Header: "Asset", accessor: "asset" },
      { Header: "Min ← Current → Max", accessor: "price" },
      {
        accessor: "balance",
        Header: () => (
          <Row style={{ cursor: "pointer" }}>
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
      { Header: "Fact / Target Share", accessor: "share" },
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
      },
    ],
    [balanceSort, theme.images.icons.group]
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
        if (a.fact_balance <= b.fact_balance) {
          return balanceSort ? 1 : -1;
        } else {
          return balanceSort ? -1 : 1;
        }
      })
      .map((a) => ({
        ...a,
        ...TOKENS_BY_ASSET_ID[a.asset_id],
      }));

    let totalValue = new BN(0);
    tokens.forEach((a) => {
      totalValue = totalValue.plus(a.balance_usd);
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
        price: (a.assetId === vm.range!.baseTokenId) ? ("$" + new BN(a.balance_usd).toFormat(2)) : (
          <Row alignItems="center">
            <Text fitContent type="secondary" size="small">${a.min_price}</Text>
            <SizedBox width={4} />
            <Text fitContent> ← ${a.current_price} → </Text>
            <SizedBox width={4} />
            <Text fitContent type="secondary" size="small">${a.max_price}</Text>
          </Row>
        ),
        balance: (
          <Row alignItems="center">
            <Text fitContent>
              {new BN(a.fact_balance).toFormat(2)} /
            </Text>
            <SizedBox width={4} />
            <Text fitContent type="secondary">
              {new BN(a.real_balance).toFormat(2)}
            </Text>
          </Row>
        ),
        share: (
          <Row alignItems="center">
            <Text fitContent>
              {new BN(a.balance_usd).div(totalValue).times(100).toFormat(2)}% /
            </Text>
            <SizedBox width={4} />
            <Text fitContent type="secondary">
              {new BN(a.share).toFormat(2)}%
            </Text>
          </Row>
        )
      }));
    setFilteredTokens(data);
  }, [balanceSort, vm.range]);
  const { width } = useWindowSize();
  return (
    <Root balanceSort={balanceSort}>
      <Text weight={500} type="secondary">
        Pool composition
      </Text>
      <SizedBox height={8} />
      <Scrollbar
        style={{
          maxWidth: "calc(100vw - 32px)",
          borderRadius: 16,
        }}
      >
        {width && (
          <Table
            fitContent={width < 402}
            columns={columns}
            data={filteredTokens}
            style={{ whiteSpace: "nowrap" }}
          />
        )}
      </Scrollbar>
      <SizedBox height={16} />
    </Root>
  );
};
export default observer(RangeComposition);
