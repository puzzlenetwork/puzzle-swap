import styled from "@emotion/styled";

type TButtonType = "primary" | "secondary" | "danger";
type TButtonSize = "medium" | "large";

const Button = styled.button<{
  kind?: TButtonType;
  size?: TButtonSize;
  fixed?: boolean;
}>`
  white-space: nowrap;
  display: flex;
  justify-content: center;
  align-items: center;
  box-sizing: border-box;
  border: 1px solid ${({ kind, theme }) =>
    kind === "secondary" ? theme.colors.primary100 : theme.colors.blue500};

  border: 1px solid;
  border-color: ${({ kind, theme }) =>
    (() => {
      switch (kind) {
        case "primary":
          return `${theme.colors.blue500}`;
        case "secondary":
          return theme.colors.primary100;
        case "danger":
          return theme.colors.error500;
        default:
          return theme.colors.blue500;
      }
    })()}


  border-radius: 12px;
  box-shadow: none;
  font-weight: 500;
  font-size: 16px;
  line-height: 24px;

  width: ${({ fixed }) => (fixed ? "100%" : "fit-content")};
  transition: 0.4s;

  ${({ kind, theme }) =>
    (() => {
      switch (kind) {
        case "primary":
          return `background: ${theme.colors?.white}; color: ${theme.colors?.white}`;
        case "secondary":
          return `background: ${theme.colors?.blue500}; color: ${theme.colors?.blue500}`;
        case "danger":
          return `background: ${theme.colors?.error500}; color:#fffff`;
        default:
          return `background: ${theme.colors?.primary800}; color: ${theme.colors?.white}`;
      }
    })()}
  ${({ size }) =>
    (() => {
      switch (size) {
        case "medium":
          return "padding: 0 20px; height: 40px;";
        case "large":
          return "padding: 0 24px; height: 56px;";
        default:
          return "padding: 0 24px; height: 56px;";
      }
    })()}
  :hover {
    cursor: pointer;
    background: ${({ kind, theme }) =>
      kind === "secondary" ? theme.colors.primary100 : "#6563dd"};
    border: 1px solid ${({ kind, theme }) =>
      kind === "secondary" ? theme.colors.primary100 : "#6563dd"};
    color: ${({ kind }) => kind === "secondary" && "#6563DD"};
  }

  :disabled {
    opacity: ${({ kind }) => (kind === "secondary" ? 0.4 : 1)};
    background: ${({ kind, theme }) =>
      kind === "secondary" ? theme.colors.white : theme.colors.primary300};

    border: 1px solid ${({ kind, theme }) =>
      kind === "secondary" ? theme.colors.primary100 : theme.colors.primary300};

    cursor: not-allowed;
  }
`;

export default Button;
