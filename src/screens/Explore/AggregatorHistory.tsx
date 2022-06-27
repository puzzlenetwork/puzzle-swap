import styled from "@emotion/styled";
import React, { useMemo, useState } from "react";
import TitleWithTips from "@components/TitleWithTips";
import SizedBox from "@components/SizedBox";
import Scrollbar from "@components/Scrollbar";
import Table from "@components/Table";
import { observer } from "mobx-react-lite";

interface IProps {}

const Root = styled.div`
  display: flex;
  flex-direction: column;
`;

const AggregatorHistory: React.FC<IProps> = () => {
  const [tr, setTr] = useState<any[]>([]);
  const columns = React.useMemo(
    () => [
      { Header: "Details", accessor: "details" },
      { Header: "Rate", accessor: "rate" },
      { Header: "Account", accessor: "account" },
      { Header: "Pool", accessor: "poolName" },
      { Header: "Time", accessor: "time" },
    ],
    []
  );
  useMemo(() => {
    const data = Array.from({ length: 5 }).map(() => ({
      details: "",
      rate: "1 USDN = 0.018 Puzzle",
      account: "3P4…97K",
      poolName: "Puzzle Pool",
      time: "1 min ago",
    }));
    setTr(data);
  }, []);
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
          onLoadMore={() => null}
        />
      </Scrollbar>
    </Root>
  );
};
export default observer(AggregatorHistory);
