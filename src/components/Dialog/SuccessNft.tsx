import styled from "@emotion/styled";
import React from "react";
import malibu from "@src/assets/icons/nftFrame.svg";
import frame from "@src/assets/icons/greenFrame.svg";

interface IProps {
  image: string;
}

const Frame = styled.div`
  background-image: url(${malibu});
  background-size: cover;
  background-position: center;
  box-sizing: border-box;
  box-shadow: none;
  color: transparent;
  width: 120px;
  height: 120px;
  position: relative;
`;
const Nft = styled.img`
  position: absolute;
  top: 12%;
  left: 5%;
  width: 72px;
  height: 72px;
  z-index: 2;
`;
const Green = styled.div`
  background-image: url(${frame});
  background-size: cover;
  background-position: center;
  position: absolute;
  top: 12%;
  left: 5%;
  width: 120px;
  height: 120px;
  z-index: 3;
`;
const SuccessNft: React.FC<IProps> = ({ image }) => {
  console.log(image);
  return (
    <Frame>
      <Green>
        <Nft src={image} alt="nft" />
      </Green>
    </Frame>
  );
};
export default SuccessNft;
