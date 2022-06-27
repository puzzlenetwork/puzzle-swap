import styled from "@emotion/styled";
import React, { useMemo, useState } from "react";
import TitleWithTips from "@components/TitleWithTips";
import { observer } from "mobx-react-lite";
import SizedBox from "@components/SizedBox";
import Scrollbar from "@components/Scrollbar";
import Table from "@components/Table";

interface IProps {}

const Root = styled.div`
  display: flex;
  flex-direction: column;
`;

const MegaPoolsHistory: React.FC<IProps> = () => {
  const [tr, setTr] = useState<any[]>([]);
  useMemo(() => {
    const data = Array.from({ length: 5 }).map(() => ({
      details: "",
      poolName: "Puzzle Pool",
      value: "$1,999.99",
      account: "3P4…97K",
      time: "1 min ago",
    }));
    setTr(data);
  }, []);
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
