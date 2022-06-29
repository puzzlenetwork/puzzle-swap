import styled from "@emotion/styled";
import React, { useMemo, useState } from "react";
import TitleWithTips from "@components/TitleWithTips";
import SizedBox from "@components/SizedBox";
import Scrollbar from "@components/Scrollbar";
import Table from "@components/Table";
import { observer } from "mobx-react-lite";
import { useExploreVM } from "@screens/Explore/ExploreVm";
import centerEllipsis from "@src/utils/centerEllipsis";
import dayjs from "dayjs";
import Swap from "@screens/InvestToPoolInterface/PoolHistory/Swap";
import { TOKENS_BY_ASSET_ID } from "@src/constants";
import BN from "@src/utils/BN";
import { useStores } from "@stores";

interface IProps {}

const Root = styled.div`
  display: flex;
  flex-direction: column;
`;

const AggregatorHistory: React.FC<IProps> = () => {
  const vm = useExploreVM();
  const { poolsStore } = useStores();
  const [tr, setTr] = useState<any[]>([]);
  const columns = React.useMemo(
    () => [
      { Header: "Details", accessor: "details" },
      //todo rate
      // { Header: "Rate", accessor: "rate" },
      { Header: "Account", accessor: "account" },
      { Header: "Pool", accessor: "poolName" },
      { Header: "Time", accessor: "time" },
    ],
    []
  );
  useMemo(() => {
    setTr(
      vm.aggregatorTradesHistory.map((v) => {
        return {
          details: (
            <Swap
              disableIcon
              token0={TOKENS_BY_ASSET_ID[v.payment[0].assetId ?? "WAVES"]}
              amount0={BN.formatUnits(
                v.payment[0].amount,
                TOKENS_BY_ASSET_ID[v.payment[0].assetId ?? "WAVES"].decimals
              )}
              token1={TOKENS_BY_ASSET_ID[v.call.args[0].value]}
              amount1={BN.formatUnits(
                v.call.args[1].value,
                TOKENS_BY_ASSET_ID[v.call.args[0].value]?.decimals
              )}
            />
          ),
          // rate: "1 USDN = 0.018 Puzzle",
          account: centerEllipsis(v.sender, 6),
          poolName: poolsStore.pools.find(({ domain }) => v.domain === domain)
            ?.title,
          time: (dayjs(v.timestamp) as any).fromNow(),
        };
      })
    );
  }, [poolsStore.pools, vm.aggregatorTradesHistory]);
  if (tr.length === 0) return null;
  return (
    <Root>
      <TitleWithTips
        title="Aggregator trades history"
        description="Aggregator trades history"
      />
      <SizedBox height={8} />
      <Scrollbar style={{ maxWidth: "calc(100vw - 32px)", borderRadius: 16 }}>
        <Table
          style={{ minWidth: 900 }}
          columns={columns}
          data={tr}
          onLoadMore={vm.syncAggregatorTradesHistory}
        />
      </Scrollbar>
    </Root>
  );
};
export default observer(AggregatorHistory);
