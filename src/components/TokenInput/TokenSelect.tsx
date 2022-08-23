import styled from "@emotion/styled";
import React, { HTMLAttributes } from "react";
import SizedBox from "@components/SizedBox";
import { Row, Column } from "@components/Flex";
import { ReactComponent as ArrowDownIcon } from "@src/assets/icons/arrowDown.svg";
import { IToken } from "@src/constants";
import SquareTokenIcon from "@components/SquareTokenIcon";

interface IProps extends HTMLAttributes<HTMLDivElement> {
  token?: IToken;
  balance?: string;
  selectable?: boolean;
}

const Root = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  min-width: 200px;
`;

const TokenName = styled.div`
  font-weight: 500;
  font-size: 16px;
  line-height: 24px;
  color: ${({ theme }) => theme.colors.primary800};
`;

const Balance = styled.div`
  font-size: 14px;
  line-height: 20px;
  color: #8082c5;
`;

const TokenSelect: React.FC<IProps> = ({
  token,
  selectable,
  balance,
  ...rest
}) => {
  return (
    <Root {...rest}>
      <Row alignItems="center">
        <SquareTokenIcon src={token?.logo} />
        <SizedBox width={8} />
        <Column justifyContent="center">
          <TokenName>{token?.symbol}</TokenName>
          <Balance>{balance ?? "—"}</Balance>
        </Column>
      </Row>
      {selectable && <ArrowDownIcon />}
    </Root>
  );
};
export default TokenSelect;
