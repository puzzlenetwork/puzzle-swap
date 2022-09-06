import styled from "@emotion/styled";
import React from "react";
import { LimitVMProvider } from "@screens/TradeInterface/Trade/Limit/LimitVM";
import { observer } from "mobx-react-lite";

interface IProps {}

const Root = styled.div`
  display: flex;
  flex-direction: column;
`;

const LimitImpl: React.FC<IProps> = observer(() => {
  return <Root>Limit</Root>;
});

const Limit = () => (
  <LimitVMProvider>
    <LimitImpl />
  </LimitVMProvider>
);

export default Limit;
