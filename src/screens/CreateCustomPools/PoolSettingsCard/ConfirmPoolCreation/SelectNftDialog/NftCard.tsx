import styled from "@emotion/styled";
import React from "react";

interface IProps {
  image: string;
  name: string;
}

const Root = styled.div<{ image: string }>`
  ${({ image }) =>
    image != null
      ? `background-image: url(${image});`
      : `background: #C6C9F4;`};
  background-size: cover;
  background-position: center;
  border-radius: 12px;
  width: 152px;
  height: 152px;
  position: relative;
`;
const Tag = styled.div`
  padding: 4px 8px;
  background: #363870;
  border-radius: 6px;
  color: #ffffff;
  position: absolute;
  bottom: 4px;
  left: 8px;
`;
const NftCard: React.FC<IProps> = ({ image, name }) => {
  return (
    <Root image={image}>
      <Tag>{name}</Tag>
    </Root>
  );
};
export default NftCard;
