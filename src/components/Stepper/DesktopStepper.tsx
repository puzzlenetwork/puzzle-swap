import styled from "@emotion/styled";
import React from "react";
import DesktopStep from "./DesktopStep";

interface IProps {
  steps: string[];
  activeStep: number;
  onStepClick: (step: number) => void;
  minStep?: number;
}

const Root = styled.div`
  display: none;
  @media (min-width: 880px) {
    display: flex;
  }
  flex-direction: column;
  transition: all 0.3s ease;
`;

const RopeContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 25px;
  height: 12px;
`;
const Rope = styled.div<{ done: boolean }>`
  width: 1px;
  height: 12px;
  background: ${({ done }) => (done ? "#F1F2FE" : "#C6C9F4")};
`;
const Stepper: React.FC<IProps> = ({
  steps,
  activeStep,
  onStepClick,
  minStep,
}) => {
  return (
    <Root>
      {steps.map((name, step, array) => {
        const state =
          step === activeStep
            ? "current"
            : step > activeStep
            ? "next"
            : "previous";
        return (
          <React.Fragment key={step + "step-step"}>
            <DesktopStep
              onClick={() => onStepClick(step)}
              title={name}
              state={state}
              index={step}
              key={step + name + "_step"}
              disabled={minStep != null ? minStep < step : false}
            />
            {step !== array.length - 1 && (
              <RopeContainer>
                <Rope done={step >= activeStep} />
              </RopeContainer>
            )}
          </React.Fragment>
        );
      })}
    </Root>
  );
};
export default Stepper;
