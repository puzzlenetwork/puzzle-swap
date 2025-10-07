import React, { HTMLAttributes } from "react";
import styled from "@emotion/styled";
import { Row } from "@components/Flex";

interface IProps extends Omit<HTMLAttributes<HTMLDivElement>, "onChange"> {
  value: string;
  onChange: (value: string) => void;
}

const Root = styled(Row)`
  padding: 4px;
  box-sizing: border-box;
  background: ${({ theme }) => theme.colors.primary100};
  border-radius: 8px;
`;

const intervalButtons = [
  { title: "1h", value: "1h" },
  { title: "4h", value: "4h" },
  { title: "6h", value: "6h" },
  { title: "12h", value: "12h" },
  { title: "1d", value: "1d" },
  { title: "1w", value: "1w" },
];

const ChartIntervalButton = styled.div<{ selected?: boolean }>`
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 8px;
  box-sizing: border-box;
  height: 24px;
  background: ${({ selected, theme }) => (selected ? theme.colors.white : "transparent")};
  border-radius: 6px;
  box-shadow: ${({ selected }) => (selected ? "0px 8px 24px rgba(54, 56, 112, 0.16)" : "none")};
  font-weight: 500;
  font-size: 14px;
  line-height: 20px;
  flex: 1;
  color: ${({ selected, theme }) => (selected ? theme.colors.blue500 : theme.colors.primary650)};
  transition: 0.4s;

  @media (min-width: 880px) {
    margin-top: 0;
  }
`;

const ChartIntervalButtons: React.FC<IProps> = ({ value: selected, onChange, ...rest }) => (
  <Root {...rest}>
    {intervalButtons.map(({ title, value }) => (
      <ChartIntervalButton key={value} selected={selected === value} onClick={() => onChange(value)}>
        {title}
      </ChartIntervalButton>
    ))}
  </Root>
);

export default ChartIntervalButtons;
