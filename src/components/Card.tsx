import styled from "@emotion/styled";

const Card = styled.div<{
  maxWidth?: number;
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
  type?: "white" | "dark";
  bordered?: boolean;
}>`
  display: flex;
  flex-direction: ${({ flexDirection }) => flexDirection ?? "column"};
  justify-content: ${({ justifyContent }) => justifyContent ?? "default"};
  align-items: ${({ alignItems }) => alignItems ?? "default"};
  max-width: ${({ maxWidth }) => `${maxWidth}px` ?? "100%"};
  ${({ bordered }) => bordered && `border: 1px solid #F1F2FE;`};
  width: 100%;
  border: 1px solid #f1f2fe;
  border-radius: 16px;
  box-sizing: border-box;
  padding: ${({ paddingMobile }) => paddingMobile ?? "16px"};
  ${({ type }) =>
    (() => {
      switch (type) {
        case "white":
          return "background: #ffffff;";
        case "dark":
          return "background: #7075E9;";
        default:
          return "background: #ffffff;";
      }
    })()};
  @media (min-width: 560px) {
    padding: ${({ paddingDesktop }) => paddingDesktop ?? "24px"};
  }
`;
export default Card;

//import React, { HTMLAttributes } from "react";
// import styled from "@emotion/styled";
//
// type TJustifyContent =
//   | "start"
//   | "flex-end"
//   | "space-around"
//   | "space-between"
//   | "center";
// type TAlightItems =
//   | "start"
//   | "end"
//   | "center"
//   | "inherit"
//   | "unset"
//   | "flex-end"
//   | "flex-start"
//   | "baseline";
//
// interface IProps extends HTMLAttributes<HTMLDivElement> {
//   maxWidth?: number;
//   paddingDesktop?: string;
//   paddingMobile?: string;
//   justifyContent?: TJustifyContent;
//   alignItems?: TAlightItems;
//   flexDirection?: "column" | "row";
//   type?: "white" | "dark";
//   bordered?: boolean;
//   header?: JSX.Element;
//   footer?: JSX.Element;
// }
//
// const Root = styled.div<{
//   maxWidth?: number;
//   paddingDesktop?: string;
//   paddingMobile?: string;
//   justifyContent?: TJustifyContent;
//   alignItems?: TAlightItems;
//   flexDirection?: "column" | "row";
//   type?: "white" | "dark";
//   bordered?: boolean;
// }>`
//   display: flex;
//   flex-direction: ${({ flexDirection }) => flexDirection ?? "column"};
//   justify-content: ${({ justifyContent }) => justifyContent ?? "default"};
//   align-items: ${({ alignItems }) => alignItems ?? "default"};
//   max-width: ${({ maxWidth }) => `${maxWidth}px` ?? "100%"};
//   ${({ bordered }) => bordered && `border: 1px solid #F1F2FE;`};
//   width: 100%;
//   border: 1px solid #f1f2fe;
//   border-radius: 16px;
//   box-sizing: border-box;
//   padding: ${({ paddingMobile }) => paddingMobile ?? "16px"};
//   ${({ type }) =>
//     (() => {
//       switch (type) {
//         case "white":
//           return "background: #ffffff;";
//         case "dark":
//           return "background: #7075E9;";
//         default:
//           return "background: #ffffff;";
//       }
//     })()};
//   @media (min-width: 560px) {
//     padding: ${({ paddingDesktop }) => paddingDesktop ?? "24px"};
//   }
// `;
// const Header = styled.div`
//   display: flex;
// `;
//
// const Card: React.FC<IProps> = ({ children, ...rest }) => {
//   return (
//     <Root>
//       {rest.header != null && <Header>{rest.header}</Header>}
//       {children}
//       {rest.footer != null && rest.footer}
//     </Root>
//   );
// };
// export default Card;
