import styled from "@emotion/styled";
import React from "react";
import Text from "@components/Text";
import Card from "@components/Card";
import SizedBox from "@components/SizedBox";
import { Column } from "@src/components/Flex";
import { observer } from "mobx-react-lite";
import { useStakingVM } from "@screens/Staking/StakingVM";
import Skeleton from "react-loading-skeleton";
import { useStores } from "@stores";
import { Line, LineChart, Tooltip, XAxis } from "recharts";
import dayjs from "dayjs";
import BN from "@src/utils/BN";

const Root = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  padding-top: 24px;
`;

const Container = styled(Card)`
  display: grid;
  row-gap: 16px;
  @media (min-width: 880px) {
    grid-template-columns: 1fr 1fr;
    padding: 24px;
  }
`;
const Overview: React.FC = () => {
  const vm = useStakingVM();
  const { stakeStore } = useStores();

  const data = [
    { date: 123001230, value: 1000 },
    { date: 123005230, value: 1000 },
    { date: 123005230, value: 1000 },
  ];

  return (
    <Root>
      <Text weight={500} type="secondary">
        Overview
      </Text>
      <SizedBox height={8} />
      <Container>
        <Column justifyContent="space-between">
          <Text type="secondary" size="small">
            Weekly based APY
          </Text>
          <Text style={{ fontSize: 20 }}>
            {stakeStore.stats?.stakingApy != null ? (
              stakeStore.stats.stakingApy.toFormat(2).concat(" %")
            ) : (
              <Skeleton height={20} width={110} />
            )}
          </Text>
        </Column>
        <Column justifyContent="space-between">
          <Text type="secondary" size="small">
            My share in total staking
          </Text>
          <Text style={{ fontSize: 20 }}>
            {vm.shareOfTotalStake == null ? (
              <Skeleton height={20} width={110} />
            ) : vm.shareOfTotalStake.eq(0) ? (
              "0.00 %"
            ) : (
              vm.shareOfTotalStake
                .toFormat(vm.shareOfTotalStake.lte(0.01) ? 6 : 2)
                .concat(" %")
            )}
          </Text>
        </Column>
      </Container>

      {/*<LineChart width={480} height={240} data={data}>*/}
      {/*  <XAxis*/}
      {/*    tickLine={false}*/}
      {/*    dataKey="date"*/}
      {/*    tickFormatter={(date) => dayjs(date).format("MMM DD")}*/}
      {/*    style={{ fill: "#8082c5" }}*/}
      {/*  />*/}
      {/*  <Tooltip*/}
      {/*    labelFormatter={(date) => (*/}
      {/*      <Text type="secondary" size="small">*/}
      {/*        {dayjs(date).format("dddd, MMM DD")}*/}
      {/*      </Text>*/}
      {/*    )}*/}
      {/*    formatter={(value) => "$ " + new BN(`${value}`).toFormat(2)}*/}
      {/*    itemStyle={{ border: "none" }}*/}
      {/*    contentStyle={{*/}
      {/*      border: "none",*/}
      {/*      filter: "drop-shadow(0px 8px 24px rgba(54, 56, 112, 0.16))",*/}
      {/*    }}*/}
      {/*  />*/}
      {/*  <Line*/}
      {/*    dot={false}*/}
      {/*    type="monotone"*/}
      {/*    dataKey="volume"*/}
      {/*    stroke="#7075E9"*/}
      {/*    strokeWidth={2}*/}
      {/*  />*/}
      {/*</LineChart>*/}
    </Root>
  );
};
export default observer(Overview);
