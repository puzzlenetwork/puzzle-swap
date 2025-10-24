import styled from "@emotion/styled";
import React from "react";
import { Observer } from "mobx-react-lite";
import Layout from "@components/Layout";
import Text from "@components/Text";
import SizedBox from "@components/SizedBox";
import { Column } from "@components/Flex";
import { StakingVMProvider } from "@screens/Stake/StakingVM";
import MyBalances from "./MyBalances";
import StakingStats from "./StakingStats";
import MintRedeem from "./MintRedeem";
import StPuzzleStats from "./StPuzzleStats";
import ReadyBanner from "./ReadyBanner";

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
  display: flex;
  flex-direction: column;
  gap: 24px;
  @media (min-width: 880px) {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 40px;
  }
`;

const LeftColumn = styled(Column)`
  width: 100%;
  gap: 24px;
`;

const RightColumn = styled(Column)`
  width: 100%;
  gap: 24px;
`;

const DesktopBanner = styled.div`
  display: none;
  
  @media (min-width: 880px) {
    display: block;
  }
`;

const MobileBanner = styled.div`
  display: block;
  margin-top: 24px;
  
  @media (min-width: 880px) {
    display: none;
  }
`;

const AdaptiveText = styled(Text)`
  @media (min-width: 880px) {
    max-width: 800px;
  }
`;

const StakingNewImpl: React.FC = () => {
  return (
    <Layout>
      <Observer>
        {() => (
          <Root>
            <Text weight={500} size="large">
              stPUZZLE
            </Text>
            <SizedBox height={8} />
            <AdaptiveText fitContent textAlign="left" type="secondary">
              Liquid staked PUZZLE. Earns same APY as a usual PUZZLE, but is presented as a token, which can be sent,
              used in liquidity pools and event bridged to other chains.
            </AdaptiveText>
            <SizedBox height={24} />
            <Body>
              <LeftColumn>
                <MyBalances />
                <MintRedeem />
                <DesktopBanner>
                  <ReadyBanner />
                </DesktopBanner>
              </LeftColumn>
              <RightColumn>
                <StakingStats />
                <StPuzzleStats />
              </RightColumn>
            </Body>
            <MobileBanner>
              <ReadyBanner />
            </MobileBanner>
          </Root>
        )}
      </Observer>
    </Layout>
  );
};

const StakingNew: React.FC = () => (
  <StakingVMProvider>
    <StakingNewImpl />
  </StakingVMProvider>
);

export default StakingNew;
