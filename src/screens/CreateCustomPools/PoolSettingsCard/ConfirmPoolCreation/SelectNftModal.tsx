import styled from "@emotion/styled";
import Dialog from "@src/components/Dialog";
import React from "react";
import { IDialogPropTypes } from "rc-dialog/lib/IDialogPropTypes";

export interface IProps extends IDialogPropTypes {}

const Root = styled.div`
  display: flex;
  flex-direction: column;
`;

const SelectNftModal: React.FC<IProps> = ({ ...rest }) => {
  return <Dialog {...rest}>hello</Dialog>;
};
export default SelectNftModal;
