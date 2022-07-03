import styled from "@emotion/styled";
import React, { useMemo, useState } from "react";
import { useExploreTokenVM } from "@screens/ExploreToken/ExploreTokenVm";
import { observer } from "mobx-react-lite";
import group from "@src/assets/icons/group.svg";
import Scrollbar from "@components/Scrollbar";
import Table from "@components/Table";
import { Column, Row } from "@components/Flex";
import Text from "@components/Text";
import SizedBox from "@components/SizedBox";
import { useStores } from "@stores";
import SquareTokenIcon from "@components/SquareTokenIcon";
import TokenTags from "@screens/Invest/TokenTags";
import { useNavigate } from "react-router-dom";

interface IProps {}

const Root = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
`;

const PoolsWithToken: React.FC<IProps> = () => {
  const vm = useExploreTokenVM();
  const { poolsStore, accountStore } = useStores();
  const navigate = useNavigate();
  const [pools, setPools] = useState<any>([]);
  useMemo(() => {
    setPools(
      poolsStore.pools
        .filter(({ tokens }) =>
          tokens.map((t) => t.assetId).includes(vm.asset.assetId)
        )
        .map((pool) => ({
          onClick: () => {
            navigate(`/pools/${pool.domain}/invest`);
          },
          poolName: (
            <Row>
              <SquareTokenIcon src={pool.logo} alt="logo" />
              <SizedBox width={8} />
              <Column crossAxisSize="max">
                <Row alignItems="center">
                  <Text
                    fitContent
                    style={{ whiteSpace: "nowrap" }}
                    weight={500}
                  >
                    {pool.title}
                  </Text>
                </Row>
                <TokenTags
                  tokens={pool.tokens}
                  findBalanceByAssetId={accountStore.findBalanceByAssetId}
                />
              </Column>
            </Row>
          ),
          apy: "100%",
          value: "$ " + pool.globalLiquidity.toFormat(2),
        }))
    );
  }, [poolsStore.pools, vm.asset.assetId]);
  const columns = React.useMemo(
    () => [
      {
        Header: "Pool name",
        accessor: "poolName",
      },
      {
        Header: "Pool value",
        accessor: "value",
      },
      {
        Header: () => (
          <Row style={{ cursor: "pointer" }}>
            <Text size="medium" fitContent>
              APY
            </Text>
            <img src={group} alt="group" className="liquidity-group" />
          </Row>
        ),
        accessor: "apy",
      },
    ],
    []
  );
  return (
    <Root>
      <SizedBox height={40} />
      <Text weight={500} size="big">
        Pools with {vm.asset.name}
      </Text>
      <SizedBox height={16} />
      <Scrollbar style={{ maxWidth: "calc(100vw - 32px)", borderRadius: 16 }}>
        <Table columns={columns} data={pools} style={{ width: "100%" }} />
      </Scrollbar>
    </Root>
  );
};
export default observer(PoolsWithToken);
