import styled from "@emotion/styled";
import React from "react";
import { useStores } from "@stores";
import Text from "@components/Text";
import SizedBox from "@components/SizedBox";
import Card from "@components/Card";
import { observer } from "mobx-react-lite";
import { Column, Row } from "@components/Flex";
import income from "@src/assets/icons/income.svg";
import wallet from "@src/assets/icons/wallet.svg";
import Button from "@components/Button";
import Loading from "@components/Loading";
import { useInvestToRangeInterfaceVM } from "./RangeDetailsVM";
import BN from "@src/utils/BN";
import Skeleton from "react-loading-skeleton";
import dayjs from "dayjs";
import { TOKENS_BY_ASSET_ID, TOKENS_BY_SYMBOL } from "@src/constants";
import Divider from "@src/components/Divider";

interface IProps {}

const Root = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  padding-top: 24px;
`;
const Inner = styled.div`
  display: grid;
  flex-direction: column;
  grid-template-columns: 1fr;
  row-gap: 16px;
`;
const Icon = styled.img`
  border-radius: 8px;
  height: 40px;
  width: 40px;
`;

const Reward: React.FC<IProps> = () => {
  const vm = useInvestToRangeInterfaceVM();
  const { accountStore } = useStores();
  const { address } = accountStore;
  if (address == null) return null;
  const date = dayjs(vm.lastClaimDate?.toNumber() ?? 0);
  const format = date.format("D MMM YYYY");
  return (
    <Root>
      <Text weight={500} type="secondary">
        Reward
      </Text>
      <SizedBox height={8} />
      <Card>
        <Inner>
          <Row>
            <Icon src={income} alt="income" />
            <SizedBox width={8} />
            <Column crossAxisSize="max">
              <Row justifyContent="space-between">
                <Text size="medium" style={{ flex: 1 }}>Claimed</Text>
                <Text size="medium" style={{ flex: 2, textAlign: "right" }}>
                  {!vm.lastClaimDate.eq(0) && "Last claim " + format}
                </Text>
              </Row>
              <Text weight={500}>
                {`$${vm.totalClaimedReward}`}
              </Text>
            </Column>
          </Row>
          <Divider />
          <Row>
            <Icon src={wallet} alt="wallet" />
            <SizedBox width={8} />
            <Column>
              <Text size="medium" nowrap>Available to claim</Text>
              <Text weight={500}>
                {`$${vm.totalRewardToClaim.toFixed(2)}`}
              </Text>
            </Column>
          </Row>
          {vm.loading ? (
            <Button fixed size="medium" disabled>
              In progress
              <Loading />
            </Button>
          ) : (
            <Column crossAxisSize="max">
              {!vm.loading ? (
                <Button
                  fixed
                  size="medium"
                  onClick={vm.claimRewards}
                  disabled={!vm.canClaimRewards}
                >
                  Claim reward
                </Button>
              ) : (
                <Button size="medium" disabled fixed>
                  Claiming
                  <Loading />
                </Button>
              )}
            </Column>
          )}
        </Inner>
      </Card>
    </Root>
  );
};
export default observer(Reward);
