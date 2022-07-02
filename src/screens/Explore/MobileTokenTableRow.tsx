import styled from "@emotion/styled";
import React from "react";
import star from "@src/assets/icons/star.svg";
import starred from "@src/assets/icons/filled-star.svg";
import SizedBox from "@components/SizedBox";
import SquareTokenIcon from "@components/SquareTokenIcon";
import { IToken } from "@src/constants";
import tokenLogos from "@src/constants/tokenLogos";
import { Column, Row } from "@src/components/Flex";
import Text from "@components/Text";

interface IProps {
  token: IToken;
  fav: boolean;
}

const Root = styled.div`
  display: flex;
  margin-bottom: 8px;
  align-items: center;
  padding: 0 16px;
`;
const Fav = styled.img`
  width: 24px;
  height: 24px;
  cursor: pointer;
`;
const MobileTokenTableRow: React.FC<IProps> = ({ token, fav }) => {
  return (
    <Root className="gridRow">
      <Row alignItems="center">
        <Fav src={fav ? starred : star} />
        <SizedBox width={18} />
        <Row>
          <SquareTokenIcon src={tokenLogos[token.symbol]} size="small" />
          <SizedBox width={18} />
          <Column>
            <Text>{token.name}</Text>
            <Text type="purple650" size="small">
              {token.symbol}
            </Text>
          </Column>
        </Row>
      </Row>
      <Column justifyContent="flex-end">
        <Text>$ 1</Text>
        <Text nowrap type="success" size="small">
          + 0%
        </Text>
      </Column>
    </Root>
  );
};
export default MobileTokenTableRow;
