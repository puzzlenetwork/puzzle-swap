import styled from "@emotion/styled";
import React from "react";

interface IProps {
  percent: number;
  red?: boolean;
}

const Root = styled.div<{ red?: boolean }>`
  width: 100%;
  height: 8px;
  background: ${({ theme, red }) =>
    red ? theme.colors.error100 : theme.colors.primary100};
  border-radius: 4px;

  .progress {
    border-radius: 4px;
    height: 8px;
    background: ${({ theme }) => theme.colors.blue500};
  }
`;

const Progressbar: React.FC<IProps> = ({ percent, red }) => {
  return (
    <Root red={red}>
      <div className="progress" style={{ width: `${percent}%` }} />
    </Root>
  );
};
export default Progressbar;
