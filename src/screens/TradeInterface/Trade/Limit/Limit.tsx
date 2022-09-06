import styled from "@emotion/styled";
import React from "react";
import { LimitVMProvider } from "@screens/TradeInterface/Trade/Limit/LimitVM";
import { observer } from "mobx-react-lite";
import Card from "@components/Card";
import SettingsHeader from "@screens/TradeInterface/Trade/SettingsHeader";
import Settings from "@screens/TradeInterface/Trade/Swap/Settings";
import SizedBox from "@components/SizedBox";
import Text from "@components/Text";

interface IProps {}

const Root = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
  padding: 0 16px;
  width: 100%;
  max-width: 560px;
`;

const LimitImpl: React.FC<IProps> = observer(() => {
  return (
    <Root>
      <Card
        style={{ position: "relative" }}
        paddingDesktop="16px 24px"
        paddingMobile="16px"
      >
        <SettingsHeader />
        <Settings />
        <Text>Limit</Text>
      </Card>
      <SizedBox height={16} />
    </Root>
  );
});

const Limit = () => (
  <LimitVMProvider>
    <LimitImpl />
  </LimitVMProvider>
);

export default Limit;
