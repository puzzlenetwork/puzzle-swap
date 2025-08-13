import React from "react";
import { useCreateRangeVM } from "../CreateRangeVm";
import { observer } from "mobx-react-lite";
import SelectAssets from "./SelectAssets";
import styled from "@emotion/styled";
import ContinueBtn from "../ContinueBtn";
import SizedBox from "@components/SizedBox";
import AddLiquidityToRange from "./AddLiquidityToRange";
import DialogNotification from "@components/Dialog/DialogNotification";
import SetRangeTitle from "./SetRangeTitle";

interface IProps {}

const Root = styled.div`
  display: flex;
  flex-direction: column;
`;

const DesktopContinueBtn = styled.div`
  display: none;
  @media (min-width: 880px) {
    display: flex;
  }
`;
const RangeSettingsCard: React.FC<IProps> = () => {
  const vm = useCreateRangeVM();
  const currentStep = () => {
    switch (vm.step) {
      case 0:
        return <SelectAssets />;
      case 1:
        return <SetRangeTitle />;
      case 2:
        return <AddLiquidityToRange />;
      default:
        return null;
    }
  };
  return (
    <Root>
      {currentStep()}
      <SizedBox height={24} />
      <DesktopContinueBtn>
        <ContinueBtn />
      </DesktopContinueBtn>
      <DialogNotification
        onClose={() => vm.setNotificationParams(null)}
        title={vm.notificationParams?.title ?? ""}
        description={vm.notificationParams?.description}
        buttonsDirection={vm.notificationParams?.buttonsDirection}
        type={vm.notificationParams?.type}
        buttons={vm.notificationParams?.buttons}
        style={{ maxWidth: 360 }}
        visible={vm.notificationParams != null}
        icon={vm.notificationParams?.icon}
      />
    </Root>
  );
};
export default observer(RangeSettingsCard);
