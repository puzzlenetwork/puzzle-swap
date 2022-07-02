import styled from "@emotion/styled";
import { observer } from "mobx-react-lite";
import React from "react";
import SearchTab from "./SearchTab";
import SizedBox from "@components/SizedBox";
import Scrollbar from "@components/Scrollbar";
import Table from "@components/Table";
import { Row } from "@components/Flex";
import Text from "@components/Text";
import group from "@src/assets/icons/group.svg";
import { useExploreVM } from "@screens/Explore/ExploreVm";
import GridTable from "@components/GridTable";
import WithdrawTokenRow from "@screens/WithdrawLiquidity/WithdrawTokenRow";
import Divider from "@components/Divider";
import Card from "@components/Card";
import Skeleton from "react-loading-skeleton";
import Transaction from "@screens/InvestToPoolInterface/PoolHistory/Transaction";
import Loading from "@components/Loading";
import { TOKENS_LIST } from "@src/constants";

interface IProps {}

const Root = styled.div`
  display: flex;
  flex-direction: column;
`;

const TokensTable: React.FC<IProps> = () => {
  const vm = useExploreVM();
  // const columns = React.useMemo(
  //   () => [
  //     { Header: "Token name", accessor: "token" },
  //     { Header: "Price", accessor: "price" },
  //     { Header: "Change (24h)", accessor: "change" },
  //     { Header: "Volume (24h)", accessor: "volume" },
  //     { Header: "", accessor: "trade" },
  //   ],
  //   [vm]
  // );
  return (
    <Root>
      <SearchTab />
      <SizedBox height={24} />
      {/*<Scrollbar style={{ maxWidth: "calc(100vw - 32px)", borderRadius: 16 }}>*/}
      {/*  <Table style={{ minWidth: 900 }} columns={columns} data={[]} />*/}
      {/*</Scrollbar>*/}
      <Card
        style={{ padding: 0, overflow: "auto", maxWidth: "calc(100vw - 32px)" }}
      >
        <GridTable
          style={{ width: "fit-content", minWidth: "100%" }}
          desktopTemplate={"2fr 1fr 1fr"}
          mobileTemplate={"2fr 1fr 1fr"}
        >
          <div className="gridTitle">
            <div>Details</div>
            <div>Value</div>
            <div>Time</div>
          </div>

          {TOKENS_LIST.map((t) => {
            return <div>{t.name}</div>;
          })}
          <SizedBox height={16} />
          <Text
            type="secondary"
            weight={500}
            textAlign="center"
            style={{ cursor: "pointer" }}
          >
            {/*{vm.loadingHistory ? <Loading big /> : "Load more"}*/}
            Load more
          </Text>
          <SizedBox height={16} />
        </GridTable>
      </Card>
    </Root>
  );
};
export default observer(TokensTable);
