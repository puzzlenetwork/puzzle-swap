import styled from "@emotion/styled";
import rangesBalanceBackground from "@src/assets/rangesBalanceBackground.svg";

const Card = styled.div<{
  maxWidth?: number;
  fitContent?: boolean;
  flexGrow?: number;
  paddingDesktop?: string;
  paddingMobile?: string;
  justifyContent?:
    | "start"
    | "flex-end"
    | "space-around"
    | "space-between"
    | "center";
  alignItems?:
    | "start"
    | "end"
    | "center"
    | "inherit"
    | "unset"
    | "flex-end"
    | "flex-start"
    | "baseline";
  flexDirection?: "column" | "row";
  type?: "white" | "dark" | "image";
  bordered?: boolean;
  paddingSize?: "default" | "small";
}>`
  display: flex;
  flex-direction: ${({ flexDirection }) => flexDirection ?? "column"};
  flex-grow: ${({ flexGrow }) => flexGrow ?? 0};
  justify-content: ${({ justifyContent }) => justifyContent ?? "default"};
  align-items: ${({ alignItems }) => alignItems ?? "default"};
  max-width: ${({ maxWidth }) => maxWidth ? `${maxWidth}px` : "100%"};
  ${({ bordered, theme }) =>
    bordered && `border: 1px solid ${theme.colors.primary100};`};
  width: ${({ fitContent }) => (fitContent ? "fit-content" : "100%")};
  border: 1px solid ${({ theme }) => `${theme.colors.primary100}`};
  border-radius: 16px;
  box-sizing: border-box;
  padding: ${({ paddingMobile }) => paddingMobile ?? "16px"};
  ${({ type, theme }) =>
    (() => {
      switch (type) {
        case "white":
          return `background: ${theme.colors.card.background};`;
        case "dark":
          return `background: ${theme.colors.blue500};`;
        case "image":
          return `background: url(${rangesBalanceBackground}) center no-repeat; background-size: cover;`;
        default:
          return `background: ${theme.colors.card.background};`;
      }
    })()};
  @media (min-width: 560px) {
    padding: ${({ paddingDesktop }) => paddingDesktop ?? "24px"};
  }
`;
export default Card;
