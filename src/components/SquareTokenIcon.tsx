import styled from "@emotion/styled";
import React from "react";
import { parseLogoGroup } from "@src/constants/pairLogo";
import TokenLogoSlices from "@components/TokenLogoSlices";

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
  position: relative;
  overflow: hidden;
  box-sizing: border-box;
  flex-shrink: 0;
  border: 1px solid ${({ theme }) => `${theme.colors.icon.borderColor}`};
  border-radius: ${({ size }) => (size === "small" ? "8px" : "12px")};
  ${({ size }) => sizeStyles(size)}
`;

interface SquareTokenIconProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  size?: TokenIconSize;
}

const SquareTokenIcon: React.FC<SquareTokenIconProps> = ({ src, size, alt, ...rest }) => {
  const group = parseLogoGroup(src);
  if (group) {
    return (
      <SplitWrap size={size} {...(rest as React.HTMLAttributes<HTMLDivElement>)}>
        <TokenLogoSlices logos={group} alt={alt} />
      </SplitWrap>
    );
  }
  return <StyledImg src={src} size={size} alt={alt} {...rest} />;
};

export default SquareTokenIcon;
