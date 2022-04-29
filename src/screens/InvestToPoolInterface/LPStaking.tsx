import styled from "@emotion/styled";
import React from "react";
import { observer } from "mobx-react-lite";
import { Column } from "@components/Flex";
import Text from "@components/Text";
import SizedBox from "@components/SizedBox";
import Button from "@components/Button";
import { useInvestToPoolInterfaceVM } from "@screens/InvestToPoolInterface/InvestToPoolInterfaceVM";
import Card from "@src/components/Card";
import { useStores } from "@stores";
import BN from "@src/utils/BN";

interface IProps {}

const Root = styled(Column)`
  width: 100%;
`;
const LPStaking: React.FC<IProps> = () => {
  const { accountStore } = useStores();
  const vm = useInvestToPoolInterfaceVM();
  if (accountStore.address == null) return null;
  //todo replace with dollar equivalent
  const availableToStake = BN.formatUnits(vm.indexTokenBalance, 2);
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
          <Text nowrap>
            $
            {vm.accountLiquidity == null
              ? "0.00"
              : vm.accountLiquidity?.toFormat(2)}
          </Text>
          <SizedBox height={16} />
          <Button
            fixed
            size="medium"
            disabled={vm.userIndexStaked == null || vm.userIndexStaked?.eq(0)}
            onClick={vm.unstakeIndex}
          >
            Unstake
          </Button>
        </Column>
        <SizedBox width={8} />
        <Column crossAxisSize="max">
          <Text nowrap type="secondary" size="medium">
            Available to stake
          </Text>
          <SizedBox height={4} />
          <Text>{availableToStake.toFormat(2)}</Text>
          <SizedBox height={16} />
          <Button
            fixed
            size="medium"
            disabled={!vm.canStakeIndex}
            onClick={vm.stakeIndex}
          >
            Stake
          </Button>
        </Column>
      </Card>
    </Root>
  );
};
export default observer(LPStaking);
