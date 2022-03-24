import styled from "@emotion/styled";
import React from "react";
import SizedBox from "@components/SizedBox";
import { observer } from "mobx-react-lite";
import ShortCreationPoolInfo from "@screens/CreateCustomPools/PoolSettingsCard/ConfirmPoolCreation/ShortCreationPoolInfo";
import PoolCreationPayment from "@screens/CreateCustomPools/PoolSettingsCard/ConfirmPoolCreation/PoolCreationPayment";

interface IProps {}

const Root = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
`;

const ConfirmPoolCreation: React.FC<IProps> = () => {
  return (
    <Root>
      <ShortCreationPoolInfo />
      <SizedBox height={24} />
      <PoolCreationPayment />
    </Root>
  );
};
export default observer(ConfirmPoolCreation);
