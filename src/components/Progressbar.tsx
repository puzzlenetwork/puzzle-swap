import styled from "@emotion/styled";
import React from "react";

interface IProps {
  percent: number;
  red?: boolean;
}

const Root = styled.progress`
  width: 100%;
`;

const Progressbar: React.FC<IProps> = ({ percent }) => {
  return (
    <Root>
      <div className="progress-container">
        <progress max="100" value={percent} />
      </div>
    </Root>
  );
};
export default Progressbar;
