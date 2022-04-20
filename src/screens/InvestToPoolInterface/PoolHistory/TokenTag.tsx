import styled from "@emotion/styled";
import React from "react";
import Img from "@components/Img";
import Text from "@components/Text";
import SizedBox from "@components/SizedBox";
import { IToken } from "@src/constants";
import BN from "@src/utils/BN";

interface IProps {
  token: IToken;
  amount: BN;
}

const Root = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  padding: 4px 8px;
  background: #f1f2fe;
  border-radius: 8px;
`;

const TokenTag: React.FC<IProps> = ({ token, amount }) => {
  const value = BN.formatUnits(amount, token.decimals);
  return (
    <Root>
      <Img src={token.logo} alt="token" radius="50%" />
      <SizedBox width={8} />
      <Text size="medium">{value.toFormat(value.gte(0.01) ? 2 : 4)}</Text>
    </Root>
  );
};
export default TokenTag;
