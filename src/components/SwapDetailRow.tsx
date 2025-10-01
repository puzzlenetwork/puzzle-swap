import styled from "@emotion/styled";
import React, { HTMLAttributes, ReactNode } from "react";
import Text from "@components/Text";

interface IProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  title: string | ReactNode;
}

const Root = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 8px 0;
`;

const Title = styled(Text)`
  width: auto;
`;

const SwapDetailRow: React.FC<IProps> = ({ title, children, ...rest }) => (
  <Root {...rest}>
    {typeof title === "string" ? <Title type="secondary">{title}</Title> : title}
    {children}
  </Root>
);
export default SwapDetailRow;
