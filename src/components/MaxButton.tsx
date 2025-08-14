import styled from "@emotion/styled";
import React, { HTMLAttributes } from "react";

interface IProps extends HTMLAttributes<HTMLButtonElement> {}

const Root = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  ${({ theme }) => `
  color: ${theme.colors.blue500};
  border: 1px solid ${theme.colors.blue500};
`}
  box-sizing: border-box;
  border-radius: 6px;
  height: 24px;
  padding: 0 8px;
  box-shadow: none;
  background: transparent;
  margin-right: 10px;
  cursor: pointer;
`;

const MaxButton: React.FC<IProps> = ({ ...rest }) => {
  return <Root {...rest}>MAX</Root>;
};
export default MaxButton;
