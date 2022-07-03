import styled from "@emotion/styled";
import React from "react";
import { useExploreTokenVM } from "@screens/ExploreToken/ExploreTokenVm";
import { observer } from "mobx-react-lite";
import Scrollbar from "@components/Scrollbar";
import Table from "@components/Table";
import { Row } from "@components/Flex";
import Text from "@components/Text";
import SizedBox from "@components/SizedBox";

interface IProps {}

const Root = styled.div`
  display: flex;
  flex-direction: column;
`;

const PoolsWithToken: React.FC<IProps> = () => {
  const vm = useExploreTokenVM();
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
              // src={group}
              alt="group"
              className="liquidity-group"
              // onClick={() => {
              //   setActiveSort(0);
              //   vm.setSortLiquidity(!vm.sortLiquidity);
              // }}
            />
          </Row>
        ),
        accessor: "liquidity",
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
        <Table columns={columns} data={[]} />
      </Scrollbar>
    </Root>
  );
};
export default observer(PoolsWithToken);
