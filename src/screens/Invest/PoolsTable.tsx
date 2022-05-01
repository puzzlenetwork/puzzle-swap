import { observer } from "mobx-react-lite";
import React, { useState } from "react";
import GridTable from "@components/GridTable";
import { Row } from "@components/Flex";
import Text from "@components/Text";
import group from "@src/assets/icons/group.svg";
import InvestPoolRow from "@screens/Invest/InvestPoolRow";
import PoolNotFound from "@screens/Invest/PoolNotFound";
import Card from "@components/Card";
import { useStores } from "@src/stores";
import { useInvestVM } from "@screens/Invest/InvestVm";
import SizedBox from "@components/SizedBox";
import Checkbox from "@components/Checkbox";

const PoolsTable: React.FC = () => {
  const { poolsStore, accountStore } = useStores();
  const [activeSort, setActiveSort] = useState<0 | 1>(1);
  const [v, setV] = useState(false);
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
    .filter(({ domain }) => domain !== "puzzle")
    .filter(({ name, tokens }) =>
      vm.searchValue
        ? [name, ...tokens.map(({ symbol }) => symbol)]
            .map((v) => v.toLowerCase())
            .some((v) => v.includes(vm.searchValue.toLowerCase()))
        : true
    );

  return (
    <>
      <Row alignItems="center">
        <Text weight={500} type="secondary" fitContent>
          All pools ({data.length})
        </Text>
        {accountStore.address != null && (
          <>
            <SizedBox width={28} />
            <Checkbox
              label="Show my empty balances"
              checked={v}
              onChange={(v) => setV(v)}
            />
          </>
        )}
      </Row>
      <SizedBox height={8} />
      <Card
        style={{
          padding: 0,
          justifyContent: "center",
          maxWidth: "calc(100vw - 32px)",
          overflow: "auto",
        }}
      >
        {filteredPools.length > 0 ? (
          <GridTable
            style={{ width: "fit-content", minWidth: "100%" }}
            desktopTemplate="3fr 1fr 1fr 1fr 1fr"
            mobileTemplate="3fr 1fr 1fr 1fr 1fr"
          >
            <div className="gridTitle">
              <div>Pool name</div>
              <div>My balance</div>
              <Row>
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
              <div>Volume (30d)</div>
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
            </div>
            {filteredPools.map((pool, i) => (
              <InvestPoolRow
                key={i}
                pool={pool as any}
                stats={
                  poolsStore.poolsStats
                    ? poolsStore.poolsStats[pool.domain]
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
    </>
  );
};
export default observer(PoolsTable);
