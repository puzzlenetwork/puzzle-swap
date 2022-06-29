import styled from "@emotion/styled";
import React, { useMemo, useState } from "react";
import TitleWithTips from "@components/TitleWithTips";
import { observer } from "mobx-react-lite";
import SizedBox from "@components/SizedBox";
import Scrollbar from "@components/Scrollbar";
import Table from "@components/Table";
import { useStores } from "@stores";
import { useExploreVM } from "@screens/Explore/ExploreVm";
import centerEllipsis from "@src/utils/centerEllipsis";
import dayjs from "dayjs";

interface IProps {}

const Root = styled.div`
  display: flex;
  flex-direction: column;
`;

const MegaPoolsHistory: React.FC<IProps> = () => {
  const vm = useExploreVM();
  const [tr, setTr] = useState<any[]>([]);
  const { poolsStore } = useStores();

  useMemo(() => {
    const data = vm.megaPolsInvestHistory.map((v) => ({
      details: "",
      poolName: poolsStore.pools.find(({ domain }) => v.domain === domain)
        ?.title,
      value: "$1,999.99",
      account: centerEllipsis(v.sender, 6),
      time: (dayjs(v.timestamp) as any).fromNow(),
    }));
    setTr(data);
  }, [poolsStore.pools, vm.megaPolsInvestHistory]);
  const columns = React.useMemo(
    () => [
      { Header: "Details", accessor: "details" },
      { Header: "Pool", accessor: "poolName" },
      { Header: "Value", accessor: "value" },
      { Header: "Account", accessor: "account" },
      { Header: "Time", accessor: "time" },
    ],
    []
  );
  if (tr.length === 0) return null;
  return (
    <Root>
      <TitleWithTips
        title="Megapools invest history"
        description="Megapools invest history"
      />
      <SizedBox height={8} />
      <Scrollbar style={{ maxWidth: "calc(100vw - 32px)", borderRadius: 16 }}>
        <Table
          style={{ minWidth: 900 }}
          columns={columns}
          data={tr}
          onLoadMore={() => null}
        />
      </Scrollbar>
    </Root>
  );
};
export default observer(MegaPoolsHistory);
