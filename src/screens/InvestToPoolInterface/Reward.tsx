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
import { useInvestToPoolInterfaceVM } from "./InvestToPoolInterfaceVM";
import BN from "@src/utils/BN";
import Skeleton from "react-loading-skeleton";
import dayjs from "dayjs";

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
const AvailableToClaim = styled(Row)`
  border-top: 1px solid #f1f2fe;
  padding-top: 18px;
`;
const LastClaimDate = styled(Text)`
  position: absolute;
  @media (min-width: 880px) {
    right: 24px;
  }
`;
const Reward: React.FC<IProps> = () => {
  const vm = useInvestToPoolInterfaceVM();
  const { accountStore } = useStores();
  const { address, TOKENS } = accountStore;
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
          <Row justifyContent="space-between" style={{ position: "relative" }}>
            <LastClaimDate
              type="secondary"
              textAlign="right"
              size="medium"
              style={{ position: "absolute" }}
            >
              {!vm.lastClaimDate.eq(0) && "Last claim " + format}
            </LastClaimDate>
            <Row>
              <Icon src={income} alt="income" />
              <SizedBox width={8} />
              <Column>
                <Text type="secondary" size="medium">
                  Claimed reward
                </Text>
                <Text weight={500}>
                  $
                  {vm.totalClaimedReward != null ? (
                    BN.formatUnits(
                      vm.totalClaimedReward,
                      TOKENS.USDN.decimals
                    ).toFormat(2)
                  ) : (
                    <Skeleton height={16} />
                  )}
                </Text>
              </Column>
            </Row>
          </Row>
          <AvailableToClaim>
            <Icon src={wallet} alt="wallet" />
            <SizedBox width={8} />
            <Column>
              <Text type="secondary" size="medium">
                Available to claim
              </Text>
              <Text weight={500}>${vm.totalRewardToClaim.toFixed(2)}</Text>
            </Column>
          </AvailableToClaim>
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
              {/*<SizedBox height={8} />*/}
              {/*<Button kind="secondary" fixed size="medium">*/}
              {/*  Claim as USDN*/}
              {/*</Button>*/}
            </Column>
          )}
        </Inner>
      </Card>
    </Root>
  );
};
export default observer(Reward);
