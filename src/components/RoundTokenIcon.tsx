import styled from "@emotion/styled";
import React from "react";
import { parseLogoGroup } from "@src/constants/pairLogo";
import TokenLogoSlices from "@components/TokenLogoSlices";

const StyledImg = styled.img`
  width: 24px;
  height: 24px;
  border-radius: 12px;
  border: 1px solid ${({ theme }) => theme.colors.primary100};
  box-sizing: border-box;
`;

const SplitWrap = styled.div`
  position: relative;
  overflow: hidden;
  box-sizing: border-box;
  flex-shrink: 0;
  width: 24px;
  height: 24px;
  border-radius: 12px;
  border: 1px solid ${({ theme }) => theme.colors.primary100};
`;

const RoundTokenIcon: React.FC<React.ImgHTMLAttributes<HTMLImageElement>> = ({ src, alt, ...rest }) => {
  const group = parseLogoGroup(src);
  if (group) {
    return (
      <SplitWrap {...(rest as React.HTMLAttributes<HTMLDivElement>)}>
        <TokenLogoSlices logos={group} alt={alt} />
      </SplitWrap>
    );
  }
  return <StyledImg src={src} alt={alt} {...rest} />;
};

export default RoundTokenIcon;
