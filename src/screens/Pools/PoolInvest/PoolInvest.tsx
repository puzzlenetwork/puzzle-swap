import styled from "@emotion/styled";
import React, { useState } from "react";
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
import LiquidityFlow from "./LiquidityFlow";
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
const CarouselRoot = styled.div`
  position: relative;
  width: 100%;
`;
const CarouselSlide = styled.div<{ visible: boolean }>`
  display: ${({ visible }) => (visible ? "block" : "none")};
  animation: ${({ visible }) => (visible ? "carouselFadeIn 0.15s ease-out" : "none")};

  @keyframes carouselFadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }
`;
const CarouselControls = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  margin-top: 12px;
`;
const Dots = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
`;
const Dot = styled.button<{ active?: boolean }>`
  width: ${({ active }) => (active ? 18 : 8)}px;
  height: 8px;
  border-radius: 4px;
  border: none;
  background: ${({ theme, active }) => (active ? theme.colors.primary300 : theme.colors.primary100)};
  cursor: pointer;
  padding: 0;
  transition: all 0.2s;

  &:hover {
    background: ${({ theme }) => theme.colors.primary300};
  }
`;
const CarouselArrow = styled.button`
  width: 24px;
  height: 24px;
  border-radius: 50%;
  border: 1px solid ${({ theme }) => theme.colors.primary100};
  background: transparent;
  color: ${({ theme }) => theme.colors.primary800};
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  line-height: 1;
  padding: 0;
  transition: all 0.2s;

  &:hover {
    border-color: ${({ theme }) => theme.colors.primary300};
    color: ${({ theme }) => theme.colors.primary300};
  }
`;
const CHART_SLIDES = ["trades", "liquidity"] as const;
type ChartSlide = (typeof CHART_SLIDES)[number];
const PoolInvestImpl: React.FC = observer(() => {
  const vm = usePoolInvestVM();
  const { poolsStore } = useStores();
  const [activeSlide, setActiveSlide] = useState<ChartSlide>("trades");
  const activeIndex = CHART_SLIDES.indexOf(activeSlide);
  const goTo = (index: number) => {
    const normalized = (index + CHART_SLIDES.length) % CHART_SLIDES.length;
    setActiveSlide(CHART_SLIDES[normalized]);
  };
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
            <CarouselRoot>
              <CarouselSlide visible={activeSlide === "trades"} key={`slide-trades-${activeIndex}`}>
                <TradesVolume />
              </CarouselSlide>
              <CarouselSlide visible={activeSlide === "liquidity"} key={`slide-liquidity-${activeIndex}`}>
                <LiquidityFlow />
              </CarouselSlide>
              <CarouselControls>
                <CarouselArrow
                  type="button"
                  onClick={() => goTo(activeIndex - 1)}
                  title="Previous chart"
                >
                  ‹
                </CarouselArrow>
                <Dots>
                  {CHART_SLIDES.map((slide, i) => (
                    <Dot
                      key={slide}
                      active={slide === activeSlide}
                      onClick={() => goTo(i)}
                      type="button"
                      title={slide === "trades" ? "Trades volume" : "Liquidity flow"}
                    />
                  ))}
                </Dots>
                <CarouselArrow
                  type="button"
                  onClick={() => goTo(activeIndex + 1)}
                  title="Next chart"
                >
                  ›
                </CarouselArrow>
              </CarouselControls>
            </CarouselRoot>
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
