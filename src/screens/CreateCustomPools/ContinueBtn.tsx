import React from "react";
import Button from "@components/Button";
import { useCreateCustomPoolsVM } from "@screens/CreateCustomPools/CreateCustomPoolsVm";
import { observer } from "mobx-react-lite";
import BN from "@src/utils/BN";

const ContinueBtn: React.FC = () => {
  const vm = useCreateCustomPoolsVM();

  switch (vm.step) {
    case 0:
      const totalShare = vm.poolsAssets.reduce(
        (acc, v) => acc.plus(v.share),
        BN.ZERO
      );
      const correct0 = vm.poolsAssets.length > 1 && totalShare.eq(1000);
      return (
        <Button onClick={() => vm.setStep(1)} fixed disabled={!correct0}>
          {vm.poolsAssets.length === 1
            ? "Select assets"
            : totalShare.eq(1000)
            ? "Continue"
            : "Total share should be 100%"}
        </Button>
      );
    case 1:
      const correct1 =
        vm.domain.length > 1 && vm.logo != null && !vm.poolSettingError;
      return (
        <Button onClick={() => vm.setStep(2)} fixed disabled={!correct1}>
          {correct1 ? "Continue" : "Fill in all fields"}
        </Button>
      );
    case 2:
      return (
        <Button onClick={() => vm.setStep(3)} fixed>
          Continue
        </Button>
      );
    case 3:
      const correct3 = !vm.providedPercentOfPool.eq(0);
      return (
        <Button onClick={vm.provideLiquidityToPool} fixed disabled={!correct3}>
          {correct3 ? "Continue" : "Enter amount to provide"}
        </Button>
      );
    default:
      return (
        <Button disabled fixed>
          Continue
        </Button>
      );
  }
};
export default observer(ContinueBtn);
