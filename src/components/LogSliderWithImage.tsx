
import React, { useState, useEffect, useMemo, JSX } from "react";
import styled from "@emotion/styled";
import { scalePow } from "d3-scale";
import Slider from "rc-slider";
import Tooltip from "@components/Tooltip";
import Text from "@components/Text";

interface IParams {
  value: number;
  min: number;
  max: number;
  imageUrl?: string;
  onChange: (v: number) => void;
  minTooltipContent?: string | JSX.Element;
  maxTooltipContent?: string | JSX.Element;
}

const base = 2;
const domainMin = 1;
const domainMax = 500;

const SliderWrapper = styled.div`
  width: 100%;
  position: relative;

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
`;

const TooltipContainer = styled.div<{ position: number }>`
  position: absolute;
  top: -20px;
  left: ${({ position }) => position}%;
  transform: translateX(calc(-50% - 1px));
  z-index: 10;
  pointer-events: none;
`;

const TooltipTriggerArea = styled.div`
  position: relative;
  padding: 4px 8px;
  pointer-events: auto;
`;

const LogSliderWithImage: React.FC<IParams> = ({ 
  value, 
  min, 
  max, 
  imageUrl, 
  onChange, 
  minTooltipContent, 
  maxTooltipContent 
}) => {
  const scale = scalePow()
    .exponent(3)
    .domain([domainMin, domainMax])
    .range([min, max]);
    
  const [currentSliderValue, setCurrentSliderValue] = useState(() => scale.invert(value));
  const [showAutoTooltip, setShowAutoTooltip] = useState(false);
  const [autoTooltipTimeoutId, setAutoTooltipTimeoutId] = useState<NodeJS.Timeout | null>(null);
  const [previousSliderValue, setPreviousSliderValue] = useState(() => scale.invert(value));
  const [isHandleHovered, setIsHandleHovered] = useState(false);
  
  // Update slider value when prop changes
  useEffect(() => {
    setCurrentSliderValue(scale.invert(value));
  }, [value, scale]);

  // Auto-trigger tooltip for edge cases
  useEffect(() => {
    const isAtMinEdge = currentSliderValue === domainMin;
    const isAtMaxEdge = currentSliderValue === domainMax;
    const hasMinTooltip = isAtMinEdge && minTooltipContent;
    const hasMaxTooltip = isAtMaxEdge && maxTooltipContent;
    
    // Only trigger if we just reached the edge (not on initial load)
    const justReachedEdge = (
      (isAtMinEdge && previousSliderValue !== domainMin) ||
      (isAtMaxEdge && previousSliderValue !== domainMax)
    );
    
    if ((hasMinTooltip || hasMaxTooltip) && justReachedEdge) {
      // Clear any existing timeout
      if (autoTooltipTimeoutId) {
        clearTimeout(autoTooltipTimeoutId);
      }
      
      // Show tooltip immediately
      setShowAutoTooltip(true);
      
      // Set timeout to hide tooltip after 5 seconds
      const timeoutId = setTimeout(() => {
        setShowAutoTooltip(false);
      }, 2000);
      
      setAutoTooltipTimeoutId(timeoutId);
    } else if (!isAtMinEdge && !isAtMaxEdge) {
      // Hide tooltip if not at exact edge
      setShowAutoTooltip(false);
      if (autoTooltipTimeoutId) {
        clearTimeout(autoTooltipTimeoutId);
        setAutoTooltipTimeoutId(null);
      }
    }
    
    // Update previous value
    setPreviousSliderValue(currentSliderValue);
  }, [currentSliderValue, minTooltipContent, maxTooltipContent, autoTooltipTimeoutId, previousSliderValue]);
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (autoTooltipTimeoutId) {
        clearTimeout(autoTooltipTimeoutId);
      }
    };
  }, [autoTooltipTimeoutId]);
    
  const handleChange = (v: number | number[]) => {
    const sliderValue = v as number;
    const scaledValue = scale(sliderValue);
    setCurrentSliderValue(sliderValue);
    onChange(scaledValue);
  };
  
  const getTooltipPosition = () => {
    const percentage = ((currentSliderValue - domainMin) / (domainMax - domainMin)) * 100;
    return Math.max(0, Math.min(100, percentage));
  };
  
  const getDisplayValue = () => {
    if (currentSliderValue === domainMin) return "1x";
    if (currentSliderValue === domainMax) return "∞";
    return `${Math.round(currentSliderValue)}x`;
  };
  
  const getSpecialTooltipContent = useMemo(
    () => {
      if (currentSliderValue === domainMin) return minTooltipContent;
      if (currentSliderValue === domainMax) return maxTooltipContent;
      return null;
    },
    [currentSliderValue, minTooltipContent, maxTooltipContent]
  );

  const shouldShowTooltip = useMemo(() => {
    return showAutoTooltip && !!getSpecialTooltipContent;
  }, [showAutoTooltip, getSpecialTooltipContent]);

  const handleMouseEnter = () => {
    setIsHandleHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHandleHovered(false);
  };

  return (
    <SliderWrapper className="slider-wrapper">
      {/* Tooltip above the handle */}
      <TooltipContainer position={getTooltipPosition()}>
        <Tooltip 
          config={{ placement: "top", trigger: "hover", visible: (!!getSpecialTooltipContent && (shouldShowTooltip || isHandleHovered)) }} 
          content={getSpecialTooltipContent || ""}
        >
          <TooltipTriggerArea onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
            <Text size="small" weight={500} fitContent>
              {getDisplayValue()}
            </Text>
          </TooltipTriggerArea>
        </Tooltip>
      </TooltipContainer>
      
      <div onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
        <Slider
          dotStyle={{ border: "3px solid #F1F2FE", backgroundColor: "#111331ff" }}
          activeDotStyle={{ backgroundColor: "#7075E9", borderColor: "#7075E9" }}
          style={{
            padding: 0,
            height: 20,
            border: "1px solid #F1F2FE",
            borderRadius: 10,
          }}
          handleStyle={{
            border: "3px solid #7075E9",
            boxShadow: "0px 1px 3px 1px #00000026, 0 1px 2px #0000004D",
            width: 12,
            height: 20,
            marginTop: -1,
            borderRadius: 10,
            opacity: 1,
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
              cursor: "grab",
            },
          }}
          min={domainMin}
          max={domainMax}
          value={currentSliderValue}
          onChange={handleChange}
        />
      </div>
    </SliderWrapper>
  );
};
export default LogSliderWithImage;
