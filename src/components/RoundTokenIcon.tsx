import styled from "@emotion/styled";
import React from "react";
import { parsePairLogo } from "@src/constants/pairLogo";

const StyledImg = styled.img`
  width: 24px;
  height: 24px;
  border-radius: 12px;
  border: 1px solid ${({ theme }) => theme.colors.primary100};
  box-sizing: border-box;
`;

const SplitWrap = styled.div`
  display: flex;
  overflow: hidden;
  box-sizing: border-box;
  flex-shrink: 0;
  width: 24px;
  height: 24px;
  border-radius: 12px;
  border: 1px solid ${({ theme }) => theme.colors.primary100};
`;

const Half = styled.div`
  position: relative;
  width: 50%;
  height: 100%;
  overflow: hidden;
`;

const HalfImg = styled.img<{ align: "left" | "right" }>`
  position: absolute;
  top: 0;
  height: 100%;
  width: 200%;
  object-fit: cover;
  ${({ align }) => (align === "left" ? "left: 0;" : "right: 0;")}
`;

const RoundTokenIcon: React.FC<React.ImgHTMLAttributes<HTMLImageElement>> = ({ src, alt, ...rest }) => {
  const pair = parsePairLogo(src);
  if (pair) {
    return (
      <SplitWrap {...(rest as React.HTMLAttributes<HTMLDivElement>)}>
        <Half>
          <HalfImg align="left" src={pair.left} alt={alt} />
        </Half>
        <Half>
          <HalfImg align="right" src={pair.right} alt={alt} />
        </Half>
      </SplitWrap>
    );
  }
  return <StyledImg src={src} alt={alt} {...rest} />;
};

export default RoundTokenIcon;
