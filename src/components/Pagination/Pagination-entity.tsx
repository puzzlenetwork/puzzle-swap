import React from "react";
import { ButtonHTMLAttributes } from "react";
import styled from "@emotion/styled";

import Button from "@components/Button";

export interface PaginationButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  selected?: boolean;
}

export const PaginationEntity = ({ selected, disabled, ...props }: PaginationButtonProps) => {
  return <ButtonStyled {...props} disabled={disabled || selected} />;
};

const ButtonStyled = styled(Button)`
  border: none !important;
  border-radius: 8px;
  height: 20px !important;
  min-width: 20px !important;
  padding: 4px !important;
  box-sizing: content-box;
  background: ${({ theme }) => theme.colors.primary300};

  &:disabled {
    background: ${({ theme }) => theme.colors.blue500};
  }
`;
