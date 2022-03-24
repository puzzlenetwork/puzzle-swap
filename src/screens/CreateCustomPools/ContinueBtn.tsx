import React from "react";
import Button from "@components/Button";
import { useCreateCustomPoolsVM } from "@screens/CreateCustomPools/CreateCustomPoolsVm";
import { observer } from "mobx-react-lite";

const ContinueBtn: React.FC = () => {
  const vm = useCreateCustomPoolsVM();

  switch (vm.step) {
    case 0:
      return (
        <Button onClick={() => vm.setStep(1)} fixed>
          Continue
        </Button>
      );
    case 1:
      return (
        <Button onClick={() => vm.setStep(2)} fixed>
          Continue
        </Button>
      );
    case 2:
      return (
        <Button onClick={() => vm.setStep(3)} fixed>
          Continue
        </Button>
      );
    case 3:
      return (
        <Button onClick={() => console.log("hurray")} fixed>
          Continue
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
