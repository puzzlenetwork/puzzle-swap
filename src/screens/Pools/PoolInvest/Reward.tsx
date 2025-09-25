import Button from "@components/Button";
import Card from "@components/Card";
import { Column, Row } from "@components/Flex";
import Loading from "@components/Loading";
import SizedBox from "@components/SizedBox";
import Text from "@components/Text";
import styled from "@emotion/styled";
import income from "@src/assets/icons/income.svg";
import wallet from "@src/assets/icons/wallet.svg";
import { TOKENS_BY_ASSET_ID, TOKENS_BY_SYMBOL } from "@src/constants";
import BN from "@src/utils/BN";
import { useStores } from "@stores";
import dayjs from "dayjs";
import { observer } from "mobx-react-lite";
import React from "react";
import Skeleton from "react-loading-skeleton";
import { usePoolInvestVM } from "./PoolInvestVM";

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
  border-top: 1px solid ${({ theme }) => theme.colors.primary100};
  padding-top: 18px;
`;

const Title = styled(Text)`
  font-size: 14px;
  line-height: 20px;

  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
`;

const Reward: React.FC<IProps> = () => {
  const vm = usePoolInvestVM();
  const { accountStore } = useStores();
  const { address } = accountStore;
  if (address == null) return null;
  const date = dayjs(vm.lastClaimDate?.toNumber() ?? 0);
  const format = date.format("D MMM YYYY");
  // TODO: fix this
  // const totalClaimed = BN.formatUnits(vm.totalClaimedReward ?? BN.ZERO, TOKENS_BY_SYMBOL.XTN.decimals).toFormat(2);
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
                <Title style={{ flex: 1 }}>Claimed</Title>
                <Title style={{ flex: 2, textAlign: "right" }}>
                  {!vm.lastClaimDate.eq(0) && "Last claim " + format}
                </Title>
              </Row>
              <Text weight={500}>
                {vm.totalClaimedReward != null ? (
                  vm.claimedRewardList?.length > 0 ? (
                    vm.claimedRewardList?.map((item: any) => (
                      <Text textAlign="left" type="secondary" size="small">
                        {new BN(item["amount"] / 10 ** TOKENS_BY_ASSET_ID[item["assetId"]].decimals).toFormat(2)}{" "}
                        {TOKENS_BY_ASSET_ID[item["assetId"]].symbol}
                      </Text>
                    ))
                  ) : (
                    <div>$0.00</div>
                  )
                ) : (
                  <Skeleton height={16} width="50%" />
                )}
              </Text>
            </Column>
          </Row>
          <AvailableToClaim>
            <Icon src={wallet} alt="wallet" />
            <SizedBox width={8} />
            <Column>
              <Title>Available to claim</Title>
              <Text weight={500}>
                {vm.totalRewardToClaim != null ? `$${vm.totalRewardToClaim.toFixed(2)}` : <Skeleton height={16} />}
              </Text>
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
                <Button fixed size="medium" onClick={vm.claimRewards} disabled={!vm.canClaimRewards}>
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
