import styled from "@emotion/styled";

export const ScrollbarRoot = styled.span`
  .ps__rail-x,
  .ps__rail-y {
    z-index: 999;

    & > .ps__thumb-y {
      background-color: ${({ theme }) => theme.colors.primary100};
      width: 6px !important;

      &:hover {
        background-color: ${({ theme }) => theme.colors.primary100};
      }
    }

    & > .ps__thumb-x {
      background-color: ${({ theme }) => theme.colors.primary100};
      height: 6px !important;

      &:hover {
        background-color: ${({ theme }) => theme.colors.primary100};
      }
    }

    &:hover,
    &:focus,
    &.ps--clicking {
      background-color: transparent !important;

      & > .ps__thumb-y,
      & > .ps__thumb-x {
        background-color: ${({ theme }) => theme.colors.primary100};
      }
    }
  }
`;
