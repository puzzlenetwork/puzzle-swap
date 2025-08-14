import RCSlider from "rc-slider";
import React from "react";
import { SliderProps } from "rc-slider/lib/Slider";
import styled from "@emotion/styled";
import { useTheme, Theme } from "@emotion/react";

const Root = styled.div`
  .rc-slider-dot {
    border: 3px solid ${({ theme }) => theme.colors.primary100};
    background-color: ${({ theme }) => theme.colors.primary100};
  }
  .rc-slider-mark-text {
    display: none;
  }
`;

const Slider: React.FC<SliderProps> = (props) => {
  const theme = useTheme() as Theme;

  return (
    <Root>
      <RCSlider
        dotStyle={{ border: `3px solid ${theme.colors.primary100}`, backgroundColor: theme.colors.primary100 }}
        activeDotStyle={{ backgroundColor: theme.colors.blue500, borderColor: theme.colors.blue500 }}
        styles={{
          track: { backgroundColor: theme.colors.blue500 },
          rail: { backgroundColor: theme.colors.primary100 },
          handle: {
            border: `3px solid ${theme.colors.blue500}`,
            boxShadow: "0px 4px 16px rgba(112, 117, 233, 0.32)",
            width: 16,
            height: 16,
            marginTop: -6
          }
        }}
        {...props}
      />
    </Root>
  );
};
export default Slider;
