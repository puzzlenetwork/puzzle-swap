import styled from "@emotion/styled";
import React from "react";
import Layout from "@components/Layout";
import Text from "@components/Text";
import SizedBox from "@components/SizedBox";
import { ExploreVMProvider } from "./ExploreVm";
import { Observer } from "mobx-react-lite";
import BasicInformation from "@screens/Explore/BasicInformation";

interface IProps {}

const Root = styled.div<{ apySort?: boolean; liquiditySort?: boolean }>`
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

// const Subtitle = styled(Text)`
//   @media (min-width: 880px) {
//     max-width: 560px;
//   }
// `;
const ExploreImpl: React.FC<IProps> = () => {
  return (
    <Layout>
      <Observer>
        {() => (
          <Root>
            <Text weight={500} size="large">
              Explore in Puzzle Mega Pools
            </Text>
            {/*<SizedBox height={4} />*/}
            {/*<Subtitle size="medium" fitContent>*/}
            {/*  Sub-headline*/}
            {/*</Subtitle>*/}
            <SizedBox height={24} />
            <BasicInformation />
          </Root>
        )}
      </Observer>
    </Layout>
  );
};

const Explore: React.FC<IProps> = () => (
  <ExploreVMProvider>
    <ExploreImpl />
  </ExploreVMProvider>
);
export default Explore;
