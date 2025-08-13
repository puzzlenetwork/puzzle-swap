import styled from "@emotion/styled";
import React from "react";
import { Observer } from "mobx-react-lite";
import Layout from "@components/Layout";
import { CreateRangeVMProvider } from "./CreateRangeVm";
import GoBack from "@components/GoBack";
import Text from "@components/Text";
import SizedBox from "@components/SizedBox";
import RangeSettingsCard from "./RangeSettingsCard";
import SummaryCard from "./SummaryCard";
import CreateRangesStepper from "./CreateRangesStepper";
import ContinueBtn from "./ContinueBtn";
import { ROUTES } from "@src/constants";

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
`;
const Grid = styled.div`
  display: grid;
  row-gap: 24px;
  @media (min-width: 880px) {
    grid-template-columns: 1fr 2fr 1fr;
    row-gap: 0;
    column-gap: 40px;
  }
`;
const Subtitle = styled(Text)`
  @media (min-width: 880px) {
    max-width: 560px;
  }
`;
const MobileContinueBtn = styled.div`
  display: flex;
  @media (min-width: 880px) {
    background: rgba(255, 192, 203, 0.81);
    display: none;
  }
`;
const CreateRangeImpl: React.FC = () => {
  return (
    <Layout>
      <Observer>
        {() => (
          <Root>
            <GoBack link={ROUTES.RANGES} text="Back to Ranges" />
            <SizedBox height={24} />
            <Text weight={500} size="large">
              Create Range
            </Text>
            <SizedBox height={8} />
            <Subtitle size="medium">
              Create a custom Range with any token combination and optimize your liquidity distribution. As the Range
              owner, you’ll also earn a share of all fees generated within it.
            </Subtitle>
            <SizedBox height={24} />
            <Grid>
              <CreateRangesStepper />
              <RangeSettingsCard />
              <SummaryCard />
              <MobileContinueBtn>
                <ContinueBtn />
              </MobileContinueBtn>
            </Grid>
          </Root>
        )}
      </Observer>
    </Layout>
  );
};

const CreateCustomPools: React.FC = () => (
  <CreateRangeVMProvider>
    <CreateRangeImpl />
  </CreateRangeVMProvider>
);
export default CreateCustomPools;
