import styled from "@emotion/styled";
import React from "react";
import { observer } from "mobx-react-lite";
import Layout from "@components/Layout";
import {
  PoolInvestVMProvider,
  usePoolInvestVM
} from "./PoolInvestVM";
import SizedBox from "@components/SizedBox";
import PoolInformation from "./PoolInformation";
import { Column } from "@src/components/Flex";
import TradesVolume from "./TradesVolume";
import PoolComposition from "./PoolComposition";
import GoBack from "@components/GoBack";
import MainPoolInfo from "./MainPoolInfo";
import LPStaking from "./LPStaking";
import MyPoolBalance from "./MyPoolBalance";
import Reward from "./Reward";
import PoolHistory from "./PoolHistory";
import { Navigate, useParams } from "react-router-dom";
import Loading from "@components/Loading";
import { ROUTES } from "@src/constants";
import { useStores } from "@stores";
import Boosting from "./Boosting";
import RebalancingNotification from "@components/RebalancingNotification";

const Root = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  box-sizing: border-box;
  padding: 0 16px;
  width: 100%;
  min-height: 100%;
  max-width: calc(1160px + 32px);
  margin-bottom: 24px;
  margin-top: 56px;
  text-align: left;

  @media (min-width: 880px) {
    margin-top: 56px;
  }
`;
const MainBlock = styled.div`
  width: 100%;
`;
const RightBlockMobile = styled(Column)`
  width: 100%;
  @media (min-width: 880px) {
    display: none;
  }
`;
const RightBlock = styled(Column)`
  width: 100%;
  display: none;
  @media (min-width: 880px) {
    display: flex;
  }
`;
const Body = styled.div`
  width: 100%;
  display: grid;
  @media (min-width: 880px) {
    grid-template-columns: 2fr 1fr;
    column-gap: 40px;
  }
`;
const PoolInvestImpl: React.FC = observer(() => {
  const vm = usePoolInvestVM();
  const { poolsStore } = useStores();
  if (poolsStore.customPools.length === 0 && vm.pool == null) {
    return <Loading />;
  }
  if (poolsStore.customPools.length > 0 && vm.pool == null) {
    return <Navigate to={ROUTES.NOT_FOUND} />;
  }
  return (
    <Layout>
      <Root>
        <GoBack link={ROUTES.POOLS} text="Back to Pools list" />
        <SizedBox height={24} />
        <MainPoolInfo />
        <Boosting />
        <PoolInformation />
        <Body>
          <MainBlock>
            <RightBlockMobile>
              {vm.pool?.isRebalancing && (
                <RebalancingNotification
                  timeRemaining={vm.pool?.rebalanceTimeRemaining}
                  progress={vm.pool?.rebalanceProgress}
                />
              )}
              <Reward />
              <MyPoolBalance />
              <LPStaking />
            </RightBlockMobile>
            <TradesVolume />
            <PoolComposition />
            <PoolHistory />
          </MainBlock>
          <RightBlock>
            {vm.pool?.isRebalancing && (
              <RebalancingNotification
                timeRemaining={vm.pool?.rebalanceTimeRemaining}
                progress={vm.pool?.rebalanceProgress}
              />
            )}
            <Reward />
            <MyPoolBalance />
            <LPStaking />
          </RightBlock>
        </Body>
      </Root>
    </Layout>
  );
});

const PoolInvest: React.FC = () => {
  const { poolDomain } = useParams<{ poolDomain: string }>();
  return (
    <PoolInvestVMProvider poolDomain={poolDomain ?? ""}>
      <PoolInvestImpl />
    </PoolInvestVMProvider>
  );
};

export default PoolInvest;
