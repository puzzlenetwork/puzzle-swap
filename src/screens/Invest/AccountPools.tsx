import styled from "@emotion/styled";
import React from "react";
import Text from "@components/Text";
import SizedBox from "@components/SizedBox";
import Card from "@components/Card";

interface IProps {}

const Root = styled.div`
  display: flex;
  flex-direction: column;
`;

const AccountPools: React.FC<IProps> = () => {
  return (
    <Root>
      <Text weight={500} type="secondary">
        My created pools
      </Text>
      <SizedBox height={8} />
      <Card>table</Card>
    </Root>
  );
};
export default AccountPools;
