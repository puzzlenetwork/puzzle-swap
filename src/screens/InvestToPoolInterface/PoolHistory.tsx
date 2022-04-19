import styled from "@emotion/styled";
import React from "react";
import Text from "@components/Text";
import Card from "@components/Card";
import SizedBox from "@components/SizedBox";
import GridTable from "@components/GridTable";
import { observer } from "mobx-react-lite";

interface IProps {}

const Root = styled.div`
  display: flex;
  flex-direction: column;
  padding-top: 24px;
`;

const PoolHistory: React.FC<IProps> = () => {
  return (
    <Root>
      <Text weight={500} type="secondary">
        Pool history
      </Text>
      <SizedBox height={8} />
      <Card style={{ padding: 0 }}>
        <GridTable desktopTemplate={"1fr 1fr 1fr"} mobileTemplate={"1fr 1fr"}>
          <div className="gridTitle">
            <div>Details</div>
            <div>Value</div>
            {/*todo make clickable*/}
            <div>Time</div>
          </div>
        </GridTable>
        <SizedBox height={16} />
      </Card>
    </Root>
  );
};
export default observer(PoolHistory);
