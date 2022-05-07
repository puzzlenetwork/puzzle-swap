import React, { useState } from "react";
import { Column, Row } from "@components/Flex";
import Text from "@components/Text";
import PoolNotFound from "@screens/Invest/PoolNotFound";
import { useStores } from "@src/stores";
import { useInvestVM } from "@screens/Invest/InvestVm";
import SizedBox from "@components/SizedBox";
import { tokenCategoriesEnum } from "@components/TokensSelectModal/TokenSelectModal";
import Table from "@src/components/Table";
import TokenTags from "@screens/Invest/TokenTags";
import SquareTokenIcon from "@components/SquareTokenIcon";
import Scrollbar from "@components/Scrollbar";
import { observer } from "mobx-react-lite";
import { useNavigate } from "react-router-dom";
import group from "@src/assets/icons/group.svg";

const PoolsTable: React.FC = () => {
  const { poolsStore, accountStore } = useStores();
  const [activeSort, setActiveSort] = useState<0 | 1>(1);
  const vm = useInvestVM();
  const data = vm.pools;
  const navigate = useNavigate();

  const columns = React.useMemo(
    () => [
      { Header: "Pool name", accessor: "poolName" },
      { Header: "My balance", accessor: "accountBalance" },
      {
        Header: () => (
          <Row style={{ cursor: "pointer" }}>
            <Text size="medium" fitContent>
              Liquidity
            </Text>
            <img
              src={group}
              alt="group"
              className="liquidity-group"
              onClick={() => {
                setActiveSort(0);
                vm.setSortLiquidity(!vm.sortLiquidity);
              }}
            />
          </Row>
        ),
        accessor: "liquidity",
      },
      { Header: "Volume (30d)", accessor: "volume" },
      {
        accessor: "apy",
        Header: () => (
          <Row style={{ cursor: "pointer" }}>
            <Text size="medium" fitContent>
              APY
            </Text>
            <img
              src={group}
              alt="group"
              className="apy-group"
              onClick={() => {
                setActiveSort(1);
                vm.setSortApy(!vm.sortApy);
              }}
            />
          </Row>
        ),
      },
    ],
    [vm]
  );

  const filteredPools = data
    .filter(({ domain }) => domain !== "puzzle")
    .sort((a, b) => {
      if (activeSort === 0) {
        if (a.globalLiquidity != null && b.globalLiquidity != null) {
          if (a.globalLiquidity.lt(b.globalLiquidity)) {
            return vm.sortLiquidity ? 1 : -1;
          } else {
            return vm.sortLiquidity ? -1 : 1;
          }
        }
      } else if (activeSort === 1) {
        if (a.apy != null && b.apy != null) {
          if (a.apy.lt(b.apy)) {
            return vm.sortApy ? 1 : -1;
          } else {
            return vm.sortApy ? -1 : 1;
          }
        }
      }
      return 1;
    })
    .filter(({ title, tokens }) =>
      vm.searchValue
        ? [title, ...tokens.map(({ symbol }) => symbol)]
            .map((v) => v.toLowerCase())
            .some((v) => v.includes(vm.searchValue.toLowerCase()))
        : true
    )
    .filter((pool) => {
      if (vm.poolCategoryFilter === 0) return true;
      return pool.tokens
        .reduce(
          (acc, { category }) =>
            category != null ? [...acc, ...category] : [...acc],
          [] as string[]
        )
        .includes(tokenCategoriesEnum[vm.poolCategoryFilter]);
    })
    .map((pool) => ({
      onClick: () => navigate(`/pools/${pool.domain}/invest`),
      poolName: (
        <Row>
          <SquareTokenIcon src={pool.logo} alt="logo" />
          <SizedBox width={8} />
          <Column crossAxisSize="max">
            <Row alignItems="center">
              <Text fitContent style={{ whiteSpace: "nowrap" }} weight={500}>
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
      accountBalance: (() => {
        const accountBalance = poolsStore.accountPoolsLiquidity?.find(
          (o) => pool.domain === o.pool.domain
        )?.liquidityInUsdn;
        return accountBalance != null && accountBalance.gt(0)
          ? `$${accountBalance.toFormat(2)}`
          : "—";
      })(),
      liquidity: pool.globalLiquidity.toFormat(2),
      volume: (() => {
        const volume =
          poolsStore.poolsStats &&
          poolsStore.poolsStats[pool.domain].monthly_volume != null
            ? poolsStore.poolsStats[pool.domain].monthly_volume.toFormat(2)
            : null;
        return volume != null ? `$ ${volume}` : "—";
      })(),
      apy: poolsStore.poolsStats
        ? poolsStore.poolsStats[pool.domain]?.apy.toFormat(2).concat(" %")
        : undefined,
    }));

  return (
    <>
      <Row alignItems="center">
        <Text weight={500} type="secondary" fitContent>
          All pools ({data.length})
        </Text>
      </Row>
      <SizedBox height={8} />
      {filteredPools.length > 0 ? (
        <Scrollbar style={{ maxWidth: "calc(100vw - 32px)", borderRadius: 16 }}>
          <Table
            style={{ minWidth: 900 }}
            columns={columns}
            data={filteredPools}
          />
        </Scrollbar>
      ) : (
        <PoolNotFound
          onClear={() => vm.setSearchValue("")}
          searchValue={vm.searchValue}
        />
      )}
    </>
  );
};
export default observer(PoolsTable);
