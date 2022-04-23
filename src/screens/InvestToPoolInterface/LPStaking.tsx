import styled from "@emotion/styled";
import React from "react";
import { observer } from "mobx-react-lite";
import { Column } from "@components/Flex";
import Text from "@components/Text";
import SizedBox from "@components/SizedBox";
import Button from "@components/Button";
import { useInvestToPoolInterfaceVM } from "@screens/InvestToPoolInterface/InvestToPoolInterfaceVM";
import { Link } from "react-router-dom";
import Card from "@src/components/Card";
import { useStores } from "@stores";

interface IProps {}

const Root = styled(Column)`
  width: 100%;

  a {
    width: 100%;
  }
`;
const LPStaking: React.FC<IProps> = () => {
  const { accountStore } = useStores();
  const vm = useInvestToPoolInterfaceVM();
  if (accountStore.address == null) return null;
  return (
    <Root>
      <SizedBox height={24} />
      <Text style={{ width: "100%" }} weight={500} type="secondary">
        LP Staking
      </Text>
      <SizedBox height={8} />
      <Card flexDirection="row">
        <Column crossAxisSize="max">
          <Text type="secondary" size="medium">
            Staked balance
          </Text>
          <SizedBox height={4} />
          <Text nowrap>$ 99,999.99</Text>
          <SizedBox height={16} />
          <Link to={`/${vm.pool.id}/withdraw`}>
            <Button fixed size="medium" kind="secondary">
              Unstake
            </Button>
          </Link>
        </Column>
        <SizedBox width={8} />
        <Column crossAxisSize="max">
          <Text nowrap type="secondary" size="medium">
            Available to stake
          </Text>
          <SizedBox height={4} />
          <Text>$ 99,999.99</Text>
          <SizedBox height={16} />
          <Link to={`/${vm.pool.id}/addLiquidity`}>
            <Button fixed size="medium">
              Stake
            </Button>
          </Link>
        </Column>
      </Card>
    </Root>
  );
};
export default observer(LPStaking);
