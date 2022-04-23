import styled from "@emotion/styled";
import React from "react";
import TextButton from "@components/TextButton";
import { ReactComponent as CloseIcon } from "@src/assets/icons/close.svg";

interface IProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {}

const Root = styled(TextButton)`
  width: 100%;
  justify-content: flex-start;
  path {
    fill: #7075e9;
  }
`;

const ResetAllButton: React.FC<IProps> = ({ ...rest }) => (
  <Root {...rest}>
    <CloseIcon />
    &nbsp; Reset all
  </Root>
);
export default ResetAllButton;
