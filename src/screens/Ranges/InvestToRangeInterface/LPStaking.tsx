import styled from "@emotion/styled";
import React, { useState } from "react";
import { observer } from "mobx-react-lite";
import Text from "@components/Text";
import { useInvestToRangeInterfaceVM } from "./InvestToRangeInterfaceVM";
import Card from "@src/components/Card";
import { useStores } from "@stores";
import BN from "@src/utils/BN";
import arrowDownIcon from "@src/assets/icons/thingArrowDown.svg";
import { ReactComponent as InfoIcon } from "@src/assets/icons/info.svg";
import Tooltip from "@components/Tooltip";
import SizedBox from "@components/SizedBox";
import { Column, Row } from "@components/Flex";
import Button from "@components/Button";
import Divider from "@src/components/Divider";
import Switch from "@src/components/Switch";
import StakeUnstakeInput from "./StakeUnstakeInput";

interface IProps {}

const Root = styled(Card)`
  width: 100%;
  margin-top: 24px;
  padding: 0 !important;
`;

const Title = styled(Text) <{ expanded?: boolean }>`
  display: flex;
  align-items: center;
  width: calc(100% - 48px);
  margin: 16px 24px;
  transition: 0.4s;
  position: relative;
  :after {
    position: absolute;
    top: 4px;
    right: 0;
    height: 16px;
    content: url(${arrowDownIcon});
    transition: 0.4s;
    transform: rotate(${({ expanded }) => (expanded ? -180 : 0)}deg);
  }

  :hover {
    color: #7075e9;
    :after {
      transform: rotate(${({ expanded }) => (expanded ? -180 : -90)}deg);
    }
  }
`;

const Body = styled(Column)<{ expanded?: boolean }>`
  transition: 0.4s;
  overflow: hidden;
  width: 100%;
  height: ${({ expanded }) => (expanded ? "auto" : 0)};
`;

const Information = styled(Row)`
  width: calc(100% - 48px);
  padding: 16px 24px;
  padding-top: 0;
`;

const Actions = styled(Column)`
  padding: 16px 24px;
  width: calc(100% - 48px);
`;

const LPStaking: React.FC<IProps> = () => {
  const { accountStore } = useStores();
  const vm = useInvestToRangeInterfaceVM();
  const [expanded, setExpanded] = useState(false);
  if (accountStore.address == null) return null;
  const availableToStake = BN.formatUnits(
    vm.indexTokenBalance.times(vm.range!.indexTokenRate ?? BN.ZERO),
    8
  );

  return (
    <Root>
      <Title weight={500} expanded={expanded} onClick={() => setExpanded(!expanded)}>
        LP Staking
        <Tooltip
          containerStyles={{ display: "flex", alignItems: "center" }}
          content={
            <Text>
              Stake and unstake PZ Index token, which represents the value of
              your range share
            </Text>
          }
        >
          <InfoIcon style={{ marginLeft: 8 }} />
        </Tooltip>
      </Title>
      <Body expanded={expanded}>
        <Information>
          <Column crossAxisSize="max">
            <Text type="secondary" size="medium">
              Staked balance
            </Text>
            <Text nowrap>
              $
              {vm.totalProvidedLiquidityByAddress == null
                ? "0.00"
                : vm.totalProvidedLiquidityByAddress?.toFormat(2)}
            </Text>
          </Column>
          <SizedBox width={8} />
          <Column>
            <Text nowrap type="secondary" size="medium">
              Available to stake
            </Text>
            <Text>${availableToStake.toFormat(2)}</Text>
          </Column>
        </Information>

        <Divider />

        <Actions crossAxisSize="max">
          <Row>
            <Text size="medium" type="secondary">Use MAX</Text>
            <SizedBox width={16} />
            <Switch value={vm.useMaxStakeUnstakeAmount} onChange={() => {vm.setUseMaxStakeUnstakeAmount(!vm.useMaxStakeUnstakeAmount)}} />
          </Row>
          <SizedBox height={16} />
          {!vm.useMaxStakeUnstakeAmount && (
            <>
              <StakeUnstakeInput amount={vm.stakeUnstakeAmount} setAmount={vm.setStakeUnstakeAmount} />
              <SizedBox height={16} />
            </>
          )}
          <Row>
            <Button
              fixed
              kind="secondary"
              size="medium"
              disabled={vm.userIndexStaked == null || vm.userIndexStaked?.eq(0) || (vm.useMaxStakeUnstakeAmount && (vm.stakeUnstakeAmount.eq(0) || vm.stakeUnstakeAmount.gt(vm.indexTokenBalance)))}
              onClick={vm.unstakeIndex}
            >
              Unstake
            </Button>
            <SizedBox width={8} />
            <Button
              fixed
              size="medium"
              disabled={!vm.canStakeIndex}
              onClick={vm.stakeIndex}
            >
              Stake
            </Button>
          </Row>
        </Actions>
      </Body>
    </Root>
  );
};
export default observer(LPStaking);
