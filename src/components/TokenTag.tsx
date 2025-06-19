import styled from "@emotion/styled";
import React, { HTMLAttributes } from "react";
import Img from "@components/Img";
import Text from "@components/Text";
import { IToken } from "@src/constants";
import BN from "@src/utils/BN";

interface IProps extends HTMLAttributes<HTMLDivElement> {
  token: IToken;
  amount?: BN;
  size?: "small" | "medium" | "large";
  iconRight?: boolean;
}

const Root = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  padding: 4px 8px;
  background: ${({ theme }) => theme.colors.primary100};
  border-radius: 8px;
`;

const TokenTag: React.FC<IProps> = ({ token, amount, size, iconRight }) => {
  const value =
    amount == null ? BN.ZERO : BN.formatUnits(amount, token.decimals);
  let imgSize = 24;
  if (size === "small") {
    imgSize = 16;
  } else if (size === "large") {
    imgSize = 32;
  }
  return (
    <Root>
      {!iconRight && <Img src={token.logo} alt="token" radius="50%" width={`${imgSize}px`} height={`${imgSize}px`} />}
      {amount && (
        <Text style={iconRight ? { marginRight: 8 } : { marginLeft: 8 }} size={size ?? "medium"}>
          {value.toSmallFormat()}
        </Text>
      )}
      {iconRight && <Img src={token.logo} alt="token" radius="50%" width={`${imgSize}px`} height={`${imgSize}px`} />}
    </Root>
  );
};
export default TokenTag;
