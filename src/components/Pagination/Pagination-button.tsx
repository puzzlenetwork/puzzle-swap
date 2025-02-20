import React, { ButtonHTMLAttributes } from "react";
import styled from "@emotion/styled";

import Button from "@components/Button";

export interface PaginationButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {}

export const PaginationButton = ({ ...props }: PaginationButtonProps) => {
  return <ButtonStyled {...props} />;
};

const ButtonStyled = styled(Button)`
  border: none !important;
  border-radius: 8px;
  height: 20px !important;
  width: 20px !important;
  padding: 4px !important;
  box-sizing: content-box;
  color: white;
  background: ${({ theme }) => theme.colors.primary300};

  &:disabled {
    background: ${({ theme }) => theme.colors.blue500};
  }

  &:hover {
    border: none
  }
`;
