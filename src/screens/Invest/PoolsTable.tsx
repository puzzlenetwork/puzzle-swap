import React, { useMemo, useState } from "react";
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
import BN from "@src/utils/BN";
import Checkbox from "@components/Checkbox";
import Tag from "@src/components/Tag";
import { useTheme } from "@emotion/react";
import { Pagination } from "@src/components/Pagination/Pagination";

const PoolsTable: React.FC = () => {
  const [lengthData, setLengthData] = useState(0);
  const { poolsStore, accountStore } = useStores();
  const vm = useInvestVM();
  const navigate = useNavigate();
  const theme = useTheme();
  const timeRange = poolsStore.volumeByTimestamp[poolsStore.volumeByTimeFilter].key
  const columns = React.useMemo(
    () => [
      { Header: "Pool name", accessor: "poolName" },
      {
        Header: () => (
          <Row style={{ cursor: "pointer" }}>
            <Text size="medium" fitContent>
              My balance
            </Text>
            <img
              src={theme.images.icons.group}
              alt="group"
              className="balance-group"
              onClick={() => {
                poolsStore.setActiveSort(2);
                poolsStore.setSortBalance(!poolsStore.sortBalance);
              }}
            />
          </Row>
        ),
        accessor: "accountBalance",
      },
      {
        Header: () => (
          <Row style={{ cursor: "pointer" }}>
            <Text size="medium" fitContent>
              Liquidity
            </Text>
            <img
              src={theme.images.icons.group}
              alt="group"
              className="liquidity-group"
              onClick={() => {
                poolsStore.setActiveSort(0);
                poolsStore.setSortLiquidity(!poolsStore.sortLiquidity);
              }}
            />
          </Row>
        ),
        accessor: "liquidity",
      },
      { Header: `Volume (${timeRange})`, accessor: "volume" },
      {
        accessor: "apy",
        Header: () => (
          <Row style={{ cursor: "pointer" }}>
            <Text size="medium" fitContent>
              APY
            </Text>
            <img
              src={theme.images.icons.group}
              alt="group"
              className="apy-group"
              onClick={() => {
                poolsStore.setActiveSort(1);
                poolsStore.setSortApy(!poolsStore.sortApy);
              }}
            />
          </Row>
        ),
      },
    ],
    [vm, theme.images.icons.group, timeRange]
  );
  const [filteredPools, setFilteredPools] = useState<any[]>([]);

  const changePage = (el: number) => {
    poolsStore.setPagination({page: el, size: 20})
  };
  useMemo(() => {
    const filteredSortedData = vm.pools
      .filter(({ domain }: { domain: string }) => domain !== "puzzle")
      .filter(({ globalLiquidity }) => globalLiquidity.gt(new BN(20)))
      .filter((pool) => {
        if (!poolsStore.showEmptyBalances) {
          const data = poolsStore.investedInPools?.find(
            (v) => pool.domain === v.pool.domain
          );
          return data?.liquidityInUsdt != null && data.liquidityInUsdt.gt(0);
        }
        return true;
      })
      .sort((a, b) => {
        if (poolsStore.activeSort === 0) {
          const aLiquidity = a.statistics?.liquidity ?? 0
          const bLiquidity = b.statistics?.liquidity ?? 0
            if (Number(aLiquidity) < Number(bLiquidity)) {
              return poolsStore.sortLiquidity ? 1 : -1;
            } else {
              return poolsStore.sortLiquidity ? -1 : 1;
            }
        } else if (poolsStore.activeSort === 2) {
          if (accountStore.address == null) return 1;
          const balanceA = poolsStore.investedInPools?.find(
            (v) => a.domain === v.pool.domain
          );
          const balanceB = poolsStore.investedInPools?.find(
            (v) => b.domain === v.pool.domain
          );
          if (balanceA == null || balanceB == null) return 1;
          if (balanceA.liquidityInUsdt.lt(balanceB.liquidityInUsdt)) {
            return poolsStore.sortBalance ? 1 : -1;
          } else {
            return poolsStore.sortBalance ? -1 : 1;
          }
        } else if (poolsStore.activeSort === 1) {
          const apy0 =
            a.statistics?.boostedApy != null
              ? new BN(a.statistics?.boostedApy).plus(a.statistics?.apr)
              : a.statistics?.apr;
          const apy1 =
            b.statistics?.boostedApy != null
              ? new BN(b.statistics?.boostedApy).plus(b.statistics?.apr)
              : b.statistics?.apr;
          if (apy0 != null && apy1 != null) {
            if (new BN(apy0).lt(apy1)) {
              return poolsStore.sortApy ? 1 : -1;
            } else if (new BN(apy0).eq(apy1)) {
              return 0;
            } else {
              return poolsStore.sortApy ? -1 : 1;
            }
          } else if (apy0 != null) {
            return -1;
          } else if (apy1 != null) {
            return 1;
          }
        }
        return 1;
      })
      .filter(({ title, tokens }) =>
        poolsStore.searchValue
          ? [title, ...tokens.map(({ symbol }) => symbol)]
              .map((v) => v?.toLowerCase())
              .some((v) => v?.includes(poolsStore.searchValue?.toLowerCase()))
          : true
      )
      .filter((pool) => {
        if (vm.poolCategoryFilter === 0) return true;
        const poolsCategories = pool.tokens.reduce(
          (acc, { category }) =>
            category != null ? [...acc, ...category] : [...acc],
          [] as string[]
        );
        const categories = poolsCategories.filter(
          (category) => tokenCategoriesEnum[vm.poolCategoryFilter] === category
        );
        return categories.length > 1;
      })
      .filter((pool) => {
        if (poolsStore.versionFilter === 0) return true;
        return (pool.version === poolsStore.versionOptions[poolsStore.versionFilter]["title"]);
      })
      // .filter(({}) => {

      // })
      .filter(({ isCustom }) => {
        if (vm.customPoolFilter === 0) return true;
        if (vm.customPoolFilter === 1) return isCustom;
        if (vm.customPoolFilter === 2) return !isCustom;
        return false;
      })
      setLengthData(filteredSortedData.length)
      const data = filteredSortedData
      .slice((poolsStore.pagination.page - 1) * poolsStore.pagination.size, poolsStore.pagination.size * poolsStore.pagination.page)
      .map((pool) => ({
        onClick: () => navigate(`/pools/${pool.domain}/invest`),
        disabled:
          pool.statistics == null && pool.owner !== accountStore.address,
        poolName: (
          <Row>
            <SquareTokenIcon src={pool.logo} alt="logo" />
            <SizedBox width={16} />
            <Column crossAxisSize="max">
              <Row alignItems="center">
                <Text fitContent style={{ whiteSpace: "nowrap" }} weight={500}>
                  {pool.title}
                </Text>
                <SizedBox width={4} />
                {pool.statistics?.boostedApy != null && new BN(pool.statistics.boostedApy).gt(0) && (
                  <Tag background={theme.colors.blue500} type="primary">
                    Boosted APY 🚀
                  </Tag>
                )}
              </Row>
              <TokenTags
                tokens={pool.assets ?? []}
                findBalanceByAssetId={accountStore.findBalanceByAssetId}
              />
            </Column>
          </Row>
        ),
        accountBalance: (() => {
          const data = poolsStore.investedInPools?.find(
            (v) => pool.domain === v.pool.domain
          );
          return data?.liquidityInUsdt != null && data.liquidityInUsdt.gt(0)
            ? `$${data.liquidityInUsdt.toFormat(2)}`
            : "";
        })(),
        liquidity: "$" + new BN(pool.statistics?.liquidity ?? 0).toBigFormat(0),
        volume: (() => {
          const volume =
            pool.stats != null
              ? new BN(pool.stats.volume).toBigFormat(0)
              : null;
          return volume != null ? `$${volume}` : "—";
        })(),
        apy: (
          <Row>
            {pool.statistics?.boostedApy != null && new BN(pool.statistics.boostedApy).gt(0) ? (
              <Row alignItems="center">
                <Text fitContent type="secondary" crossed>
                  {new BN(pool.statistics?.apr ?? 0).toFormat(2).concat("%")}
                </Text>
                <SizedBox width={2} />
                {new BN(pool.statistics?.apr ?? 0)
                  .plus(pool.statistics.boostedApy)
                  .toBigFormat(2)
                  .concat("%")}
              </Row>
            ) : (
              <>
                {new BN(pool?.statistics?.apr ?? 0)?.gt(20) ?
                <Text fitContent type="success">
                    {new BN(pool?.statistics?.apr ?? 0).toFormat(2).concat("%")}
                </Text> : new BN(pool?.statistics?.apr ?? 0).toFormat(2).concat("%")}
              </>
            )}
          </Row>
        ),
        owner: pool.owner,
      })
    );
    setFilteredPools(data);
  }, [
    theme.colors.blue500,
    vm.pools,
    poolsStore.sortLiquidity,
    poolsStore.sortApy,
    poolsStore.sortBalance,
    poolsStore.searchValue,
    vm.poolCategoryFilter,
    vm.customPoolFilter,
    poolsStore.showEmptyBalances,
    poolsStore.investedInPools,
    poolsStore.versionFilter,
    poolsStore.activeSort,
    accountStore.address,
    accountStore.findBalanceByAssetId,
    navigate,
    poolsStore.pagination
  ]);

  const myPools = filteredPools.filter(
    ({ owner }) => owner != null && accountStore.address === owner
  );

  return (
    <>
      {myPools.length > 0 && (
        <>
          <Row alignItems="center">
            <Text weight={500} type="secondary" fitContent>
              My pools ({myPools.length})
            </Text>
          </Row>
          <SizedBox height={8} />
          <Scrollbar
            style={{ maxWidth: "calc(100vw - 32px)", borderRadius: 16 }}
          >
            <Table style={{ minWidth: 900 }} columns={columns} data={myPools} />
          </Scrollbar>
          <SizedBox height={24} />
        </>
      )}
      <Row alignItems="center">
        <Text weight={500} type="secondary" fitContent nowrap>
          All pools ({vm.pools.length})
        </Text>
        {accountStore.address != null && (
          <>
            <SizedBox width={28} />
            <Checkbox
              checked={poolsStore.showEmptyBalances}
              onChange={(e) => poolsStore.setShowEmptyBalances(e)}
            />
            <SizedBox width={12} />
            <Text>Show my empty balances</Text>
          </>
        )}
      </Row>
      <SizedBox height={8} />
      {filteredPools.length > 0 ? (
        <>
          <Scrollbar style={{ maxWidth: "calc(100vw - 32px)", borderRadius: 16 }}>
            <Table
              style={{ minWidth: 900 }}
              columns={columns}
              data={filteredPools}
              withHover
            />
          </Scrollbar>
          <Pagination 
            currentPage={poolsStore.pagination.page}
            lengthData={lengthData}
            limit={20}
            onChange={changePage}
          />
        </>
      ) : (
        <PoolNotFound
          onClear={() => poolsStore.setSearchValue("")}
          searchValue={poolsStore.searchValue}
        />
      )}
    </>
  );
};
export default observer(PoolsTable);
