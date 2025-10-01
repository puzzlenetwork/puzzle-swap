import React from "react";
import styled from "@emotion/styled";
import { Row } from "@components/Flex";
import Text from "@components/Text";

interface IProps {
  chartType: "standard" | "tradingview";
  onToggle: (type: "standard" | "tradingview") => void;
}

const Root = styled.div`
  display: flex;
  border: 1px solid ${({ theme }) => theme.colors.primary100};
  border-radius: 8px;
  overflow: hidden;
  background: ${({ theme }) => theme.colors.white};
`;

const Button = styled.div<{ active: boolean }>`
  padding: 8px 16px;
  cursor: pointer;
  background: ${({ active, theme }) => (active ? theme.colors.primary100 : "transparent")};
  transition: background 0.2s;
  width: 100%;
  text-align: center;
  &:hover {
    background: ${({ active, theme }) => (active ? theme.colors.primary100 : theme.colors.primary50)};
  }
`;

const ChartTypeSwitcher: React.FC<IProps> = ({ chartType, onToggle }) => {
  return (
    <Root>
      <Button active={chartType === "standard"} onClick={() => onToggle("standard")}>
        <Text size="small" weight={chartType === "standard" ? 500 : 400}>
          Standard
        </Text>
      </Button>
      <Button active={chartType === "tradingview"} onClick={() => onToggle("tradingview")}>
        <Text size="small" weight={chartType === "tradingview" ? 500 : 400}>
          TradingView
        </Text>
      </Button>
    </Root>
  );
};

export default ChartTypeSwitcher;