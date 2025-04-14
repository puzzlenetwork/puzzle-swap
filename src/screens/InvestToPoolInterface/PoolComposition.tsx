import styled from "@emotion/styled";
import React, { useMemo, useState } from "react";
import Text from "@components/Text";
import SizedBox from "@components/SizedBox";
import { Column, Row } from "@components/Flex";
import { useInvestToPoolInterfaceVM } from "@screens/InvestToPoolInterface/InvestToPoolInterfaceVM";
import { observer } from "mobx-react-lite";
import Table from "@components/Table";
import Scrollbar from "@src/components/Scrollbar";
import useWindowSize from "@src/hooks/useWindowSize";
import { useTheme } from "@emotion/react";
import Tooltip from "@src/components/Tooltip";
import { ReactComponent as InfoIcon } from "@src/assets/icons/info.svg";

interface IProps {}

const Root = styled.div<{ valueSort?: boolean }>`
  display: flex;
  flex-direction: column;
  padding-top: 24px;

  .value-group {
    width: 20px;
    height: 20px;
    transform: ${({ valueSort }) => (valueSort ? "scale(1)" : "scale(1, -1)")};
  }
`;

const Icon = styled.img`
  width: 24px;
  height: 24px;
  border-radius: 12px;
  border: 1px solid #f1f2fe;
`;

const PoolComposition: React.FC<IProps> = () => {
  const theme = useTheme();
  const vm = useInvestToPoolInterfaceVM();
  const [filteredTokens, setFilteredTokens] = useState<any[]>([]);
  const [valueSort, setValueSort] = useState(true);
  const columns = React.useMemo(
    () => [
      { Header: "Asset", accessor: "asset" },
      { Header: "Balance", accessor: "balance" },
      {
        accessor: "value",
        Header: () => (
          <Row style={{ cursor: "pointer" }}>
            <Text size="medium" fitContent>
              Value
            </Text>
            <img
              style={{ paddingLeft: 7 }}
              src={theme.images.icons.group}
              alt="group"
              className="value-group"
              onClick={() => setValueSort(!valueSort)}
            />
          </Row>
        ),
      },
      {
        Header: (
          <Tooltip
            config={{
              trigger: "hover",
            }}
            content={
              <Column>
                <Text size="small">
                  Target Share is the set percentage of each token{" "}
                </Text>
                <Text size="small">defined when the pool was created.</Text>
              </Column>
            }
          >
            <Row>
              Target Share <InfoIcon style={{ marginLeft: 4 }} />
            </Row>
          </Tooltip>
        ),
        accessor: "weight",
      },
      {
        Header: (
          <Tooltip
            config={{
              trigger: "hover",
            }}
            content={
              <Column>
                <Text size="small">
                  Current Share is the actual percentage of the token
                </Text>
                <Text size="small">
                  {" "}
                  in the pool right now. It may slightly differ if prices
                </Text>
                <Text size="small">
                  {" "}
                  have not yet been balanced by arbitrage.
                </Text>
              </Column>
            }
          >
            <Row>
              Current Share <InfoIcon style={{ marginLeft: 4 }} />
            </Row>
          </Tooltip>
        ),
        accessor: "realWeight",
      },
    ],
    [valueSort, theme.images.icons.group]
  );
  useMemo(() => {
    let totalValue = 0;
    for (const b of vm.poolCompositionValues) {
      totalValue += b.value.toNumber();
    }

    const data = vm.poolCompositionValues
      .sort((a, b) => {
        if (a.value.lt(b.value)) {
          return valueSort ? 1 : -1;
        } else {
          return valueSort ? -1 : 1;
        }
      })
      .map((a) => ({
        onClick: null,
        asset: (
          <Row alignItems="center" mainAxisSize="fit-content">
            <Icon src={a.logo} alt="logo" />
            <SizedBox width={8} />
            <Text fitContent>{a.symbol}</Text>
          </Row>
        ),
        weight: `${a.share}%`,
        balance: `${a.parsedBalance.toFormat(4)}`,
        value: `$ ${a.value.toFormat(2)}`,
        realWeight: `${a.value.div(totalValue).times(100).toFormat(2)}%`,
      }));
    setFilteredTokens(data);
  }, [valueSort, vm.poolCompositionValues]);
  const { width } = useWindowSize();
  return (
    <Root valueSort={valueSort}>
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
export default observer(PoolComposition);
