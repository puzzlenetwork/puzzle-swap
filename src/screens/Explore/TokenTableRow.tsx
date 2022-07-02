import styled from "@emotion/styled";
import React from "react";
import star from "@src/assets/icons/star.svg";
import starred from "@src/assets/icons/filled-star.svg";
import SizedBox from "@components/SizedBox";
import SquareTokenIcon from "@components/SquareTokenIcon";
import { IToken } from "@src/constants";
import tokenLogos from "@src/constants/tokenLogos";

interface IProps {
  token: IToken;
  fav: boolean;
}

const Root = styled.div`
  display: flex;
  margin-bottom: 20px;
  @media (min-width: 880px) {
    margin-bottom: 20px;
  }
`;
const Fav = styled.img`
  width: 24px;
  height: 24px;
  cursor: pointer;
`;
const TokenTableRow: React.FC<IProps> = ({ token, fav }) => {
  return (
    <Root>
      <Fav src={fav ? starred : star} />
      <SizedBox width={18} />
      <SquareTokenIcon src={tokenLogos[token.symbol]} />
      <SizedBox width={18} />
    </Root>
  );
};
export default TokenTableRow;
