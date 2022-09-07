import styled from "@emotion/styled";
import React from "react";
import { CircularProgressbar } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";

interface IProps {
  percent: number;
}

const Root = styled.div`
  width: 32px;
  height: 32px;

  .CircularProgressbar .CircularProgressbar-path {
    stroke: ${({ theme }) => theme.colors.blue500};
  }

  .CircularProgressbar .CircularProgressbar-text {
    fill: ${({ theme }) => theme.colors.blue500};
  }

  .CircularProgressbar .CircularProgressbar-text {
    font-size: 25px;
    font-weight: 500;
    fill: ${({ theme }) => theme.colors.primary800};
  }
`;

const Progressbar: React.FC<IProps> = ({ percent }) => {
  return (
    <Root>
      <CircularProgressbar value={percent} text={`${percent}%`} />
    </Root>
  );
};
export default Progressbar;
