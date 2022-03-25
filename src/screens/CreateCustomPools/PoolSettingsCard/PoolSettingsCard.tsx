import React from "react";
import { useCreateCustomPoolsVM } from "@screens/CreateCustomPools/CreateCustomPoolsVm";
import { observer } from "mobx-react-lite";
import SelectAssets from "./SelectAssets";
import ConfirmPoolCreation from "./ConfirmPoolCreation";
import TitleAndDomainPoolSetting from "./TitleAndDomailPoolSetting";
import styled from "@emotion/styled";
import ContinueBtn from "@screens/CreateCustomPools/ContinueBtn";
import SizedBox from "@components/SizedBox";

interface IProps {}

const Root = styled.div`
  display: flex;
  flex-direction: column;
`;
const DisplayContinueBtn = styled.div`
  display: none;
  @media (min-width: 1056px) {
    display: flex;
  }
`;
const PoolSettingsCard: React.FC<IProps> = () => {
  const vm = useCreateCustomPoolsVM();
  const currentStep = () => {
    switch (vm.step) {
      case 0:
        return <SelectAssets />;
      case 1:
        return <TitleAndDomainPoolSetting />;
      case 2:
        return <ConfirmPoolCreation />;
      default:
        return null;
    }
  };
  return (
    <Root>
      {currentStep()}
      <SizedBox height={24} />
      <DisplayContinueBtn>
        <ContinueBtn />
      </DisplayContinueBtn>
    </Root>
  );
};
export default observer(PoolSettingsCard);
