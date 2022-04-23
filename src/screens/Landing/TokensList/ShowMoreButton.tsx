import styled from "@emotion/styled";
import React from "react";
import TextButton from "@components/TextButton";

interface IProps {
  onClick: () => void;
}

const Root = styled.tr`
  cursor: pointer;
`;

const ShowMoreButton: React.FC<IProps> = ({ onClick, children }) => {
  return (
    <Root onClick={onClick}>
      <td colSpan={3} style={{ width: "unset" }}>
        <TextButton>{children}</TextButton>
      </td>
    </Root>
  );
};
export default ShowMoreButton;
