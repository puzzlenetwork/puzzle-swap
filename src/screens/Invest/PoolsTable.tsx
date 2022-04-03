import { observer } from "mobx-react-lite";
import React, { useState } from "react";
import GridTable from "@components/GridTable";
import { AdaptiveRow } from "@components/Flex";
import Text from "@components/Text";
import group from "@src/assets/icons/group.svg";
import InvestPoolRow from "@screens/Invest/InvestPoolRow";
import PoolNotFound from "@screens/Invest/PoolNotFound";
import Card from "@components/Card";
import { useStores } from "@src/stores";
import { useInvestVM } from "@screens/Invest/InvestVm";

const PoolsTable: React.FC = () => {
  const { poolsStore, accountStore } = useStores();
  const [activeSort, setActiveSort] = useState<0 | 1>(1);
  const vm = useInvestVM();
  const data = poolsStore.poolDataWithApy;
  const filteredPools = data
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
    .filter(({ id }) =>
      Object.keys(accountStore.ROUTES.invest).some((key) => key === id)
    )
    .filter(({ name, tokens }) =>
      vm.searchValue
        ? [name, ...tokens.map(({ symbol }) => symbol)]
            .map((v) => v.toLowerCase())
            .some((v) => v.includes(vm.searchValue.toLowerCase()))
        : true
    );

  return (
    <Card style={{ padding: 0, minHeight: 280, justifyContent: "center" }}>
      {filteredPools.length > 0 ? (
        <GridTable mobileTemplate="3fr 1fr">
          <div className="gridTitle">
            <div>Pool name</div>
            <AdaptiveRow>
              <div className="desktop">
                <Text size="medium">Liquidity</Text>
                <img
                  src={group}
                  alt="group"
                  className="liquidity-group"
                  onClick={() => {
                    setActiveSort(0);
                    vm.setSortLiquidity(!vm.sortLiquidity);
                  }}
                />
              </div>
              <div className="mobile" style={{ cursor: "pointer" }}>
                <Text size="medium">APY</Text>
                <img
                  src={group}
                  alt="group"
                  className="apy-group"
                  onClick={() => {
                    setActiveSort(1);
                    vm.setSortApy(!vm.sortApy);
                  }}
                />
              </div>
            </AdaptiveRow>
            <AdaptiveRow>
              <div className="desktop" style={{ cursor: "pointer" }}>
                <Text size="medium">APY</Text>
                <img
                  src={group}
                  alt="group"
                  className="apy-group"
                  onClick={() => {
                    setActiveSort(1);
                    vm.setSortApy(!vm.sortApy);
                  }}
                />
              </div>
            </AdaptiveRow>
          </div>
          {filteredPools.map((pool, i) => (
            <InvestPoolRow
              key={i}
              pool={pool as any}
              stats={
                poolsStore.poolsStats
                  ? poolsStore.poolsStats[pool.id]
                  : undefined
              }
            />
          ))}
        </GridTable>
      ) : (
        <PoolNotFound
          onClear={() => vm.setSearchValue("")}
          searchValue={vm.searchValue}
        />
      )}
    </Card>
  );
};
export default observer(PoolsTable);
