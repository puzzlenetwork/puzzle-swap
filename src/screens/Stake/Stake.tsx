import styled from "@emotion/styled";
import React from "react";
import { Observer } from "mobx-react-lite";
import Layout from "@components/Layout";
import { StakingVMProvider } from "./StakingVM";
import Text from "@components/Text";
import SizedBox from "@components/SizedBox";
import Reward from "./Reward";
import UltrastakeBanner from "./UltrastakeBanner";
import Overview from "@screens/Stake/Overview";
import MyBalances from "@screens/Stake/MyBalances";
import StakeUnstake from "./StakeUnstake";
import { Column } from "@components/Flex";

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
  margin-top: 40px;
  text-align: left;
  @media (min-width: 880px) {
    margin-top: 56px;
  }
`;

const Body = styled.div`
  width: 100%;
  display: grid;
  @media (min-width: 880px) {
    grid-template-columns: auto 45ch;
    column-gap: 40px;
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
const AdaptiveText = styled(Text)`
  @media (min-width: 880px) {
    max-width: 450px;
  }
`;

const StakeImpl: React.FC = () => {
  return (
    <Layout>
      <Observer>
        {() => (
          <Root>
            <Text weight={500} size="large">
              PUZZLE Staking
            </Text>
            <SizedBox height={8} />
            <AdaptiveText fitContent textAlign="left" type="secondary">
              For every swap on the exchange, 40% of the swap fees are used to buy PUZZLE and distribute it to the
              staking balances.
            </AdaptiveText>
            <Body>
              <MainBlock>
                <RightBlockMobile>
                  <Reward />
                  <UltrastakeBanner />
                </RightBlockMobile>
                <Overview />
                <MyBalances />
                <StakeUnstake />
              </MainBlock>
              <RightBlock>
                <Reward />
                <UltrastakeBanner />
              </RightBlock>
            </Body>
          </Root>
        )}
      </Observer>
    </Layout>
  );
};

const Stake: React.FC = () => (
  <StakingVMProvider>
    <StakeImpl />
  </StakingVMProvider>
);
export default Stake;
