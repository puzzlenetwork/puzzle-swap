import styled from "@emotion/styled";
import React from "react";
import { parsePairLogo } from "@src/constants/pairLogo";

type TokenIconSize = "default" | "small";

const sizeStyles = (size?: TokenIconSize) =>
  size === "small" ? "width: 40px; height: 40px;" : "width: 56px; height: 56px;";

const StyledImg = styled.img<{ size?: TokenIconSize }>`
  border: 1px solid ${({ theme }) => `${theme.colors.icon.borderColor}`};
  border-radius: ${({ size }) => (size === "small" ? "8px" : "12px")};
  box-sizing: border-box;
  box-shadow: none;
  color: transparent;
  object-fit: cover;
  ${({ size }) => sizeStyles(size)}
`;

const SplitWrap = styled.div<{ size?: TokenIconSize }>`
  display: flex;
  overflow: hidden;
  box-sizing: border-box;
  flex-shrink: 0;
  border: 1px solid ${({ theme }) => `${theme.colors.icon.borderColor}`};
  border-radius: ${({ size }) => (size === "small" ? "8px" : "12px")};
  ${({ size }) => sizeStyles(size)}
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

interface SquareTokenIconProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  size?: TokenIconSize;
}

const SquareTokenIcon: React.FC<SquareTokenIconProps> = ({ src, size, alt, ...rest }) => {
  const pair = parsePairLogo(src);
  if (pair) {
    return (
      <SplitWrap size={size} {...(rest as React.HTMLAttributes<HTMLDivElement>)}>
        <Half>
          <HalfImg align="left" src={pair.left} alt={alt} />
        </Half>
        <Half>
          <HalfImg align="right" src={pair.right} alt={alt} />
        </Half>
      </SplitWrap>
    );
  }
  return <StyledImg src={src} size={size} alt={alt} {...rest} />;
};

export default SquareTokenIcon;
