
import React, { ChangeEvent } from "react";
import styled from "@emotion/styled";
import { scalePow } from "d3-scale";
import Slider from "rc-slider";

interface IParams {
  value: number;
  min: number;
  max: number;
  imageUrl?: string;
  onChange: (v: number) => void;
}

const base = 2;
const domainMin = 1;
const domainMax = 500;

const SliderWrapper = styled.div`
  width: 100%;

  .rc-slider-track {
    color: #000000;

    &::after {
      content: "";
      display: block;
      position: absolute;
      width: 100%;
      height: 100%;
      border-radius: 10px 0 0 10px;
      backdrop-filter: blur(6px);
    }
  }
`

const LogSliderWithImage: React.FC<IParams> = ({ value, min, max, imageUrl, onChange }) => {
  const scale = scalePow()
    .exponent(Math.log(base) / Math.log(2))
    .domain([domainMin, domainMax])
    .range([min, max]);
  const handleChange = (v: number | number[]) => {
    const value = scale(v as number);
    onChange(value);
  }
  return (
    <SliderWrapper>
      <Slider
        dotStyle={{ border: "3px solid #F1F2FE", backgroundColor: "#111331ff" }}
        activeDotStyle={{ backgroundColor: "#7075E9", borderColor: "#7075E9" }}
        style={{
          padding: 0,
          height: 20,
          border: "1px solid #F1F2FE",
          borderRadius: 10,
        }}
        styles={{
          track: {
            backgroundImage: `url(${imageUrl})`,
            backgroundPosition: "center",
            backgroundSize: "cover",
            colorInterpolation: "sRGB",
            backgroundColor: imageUrl ? "rgba(38, 38, 38, 0)" : "#7075E9",
            height: 18,
            borderRadius: "10px 0 0 10px",
          },
          rail: {
            backgroundColor: "transparent",
            height: 18,
            borderRadius: "10px",
          },
          handle: {
            border: "3px solid #7075E9",
            boxShadow: "0px 1px 3px 1px #00000026, 0 1px 2px #0000004D",
            width: 12,
            height: 20,
            marginTop: -1,
            borderRadius: 10,
            opacity: 1,
          },
        }}
        min={domainMin}
        max={domainMax}
        value={scale.invert(value)}
        onChange={handleChange}
      />
    </SliderWrapper>
  );
};
export default LogSliderWithImage;
