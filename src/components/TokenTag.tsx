import styled from "@emotion/styled";
import React, { HTMLAttributes } from "react";
import Img from "@components/Img";
import Text from "@components/Text";
import { IToken } from "@src/constants";
import BN from "@src/utils/BN";
import { parseLogoGroup } from "@src/constants/pairLogo";
import TokenLogoSlices from "@components/TokenLogoSlices";

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

const SplitWrap = styled.div<{ dimension: number }>`
  position: relative;
  overflow: hidden;
  flex-shrink: 0;
  border-radius: 50%;
  width: ${({ dimension }) => dimension}px;
  height: ${({ dimension }) => dimension}px;
`;

const TokenIcon: React.FC<{ src?: string; dimension: number }> = ({ src, dimension }) => {
  const group = parseLogoGroup(src);
  if (group) {
    return (
      <SplitWrap dimension={dimension}>
        <TokenLogoSlices logos={group} alt="token" />
      </SplitWrap>
    );
  }
  return <Img src={src} alt="token" radius="50%" width={`${dimension}px`} height={`${dimension}px`} />;
};

const TokenTag: React.FC<IProps> = ({ token, amount, size, iconRight }) => {
  const value = amount == null ? BN.ZERO : BN.formatUnits(amount, token.decimals);
  const imgSize = size === "small" ? 16 : size === "large" ? 32 : 24;
  return (
    <Root>
      {!iconRight && <TokenIcon src={token.logo} dimension={imgSize} />}
      {amount && (
        <Text style={iconRight ? { marginRight: 8 } : { marginLeft: 8 }} size={size ?? "medium"}>
          {value.toSmallFormat()}
        </Text>
      )}
      {iconRight && <TokenIcon src={token.logo} dimension={imgSize} />}
    </Root>
  );
};
export default TokenTag;
