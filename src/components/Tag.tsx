import styled from "@emotion/styled";

interface IProps {
  type?: "primary" | "default" | "error";
  background?: string;
}

const Tag = styled.div<IProps>`
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  height: 24px;
  padding: 0 8px;
  box-sizing: border-box;
  font-size: 12px;
  line-height: 16px;
  color: ${({ type, theme }) => {
    switch (type) {
      case "error":
        return theme.colors.error550;
      case "primary":
        return theme.colors.white;
      default:
        return theme.colors.primary800;
    }
  }};
  background: ${({ type, background, theme }) => {
    switch (type) {
      case "error":
        return theme.colors.error100;
      case "default":
        return theme.colors.primary200;
      default:
        return background ?? theme.colors.primary100;
    }
  }};
  max-width: fit-content;
  border: ${({ type, theme }) => {
    switch (type) {
      case "error":
        return `1px solid ${theme.colors.error550}`;
      default:
        return `none`;
    }
  }};
`;

export default Tag;
