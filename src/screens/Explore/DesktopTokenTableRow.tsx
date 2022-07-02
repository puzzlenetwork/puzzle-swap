import styled from "@emotion/styled";
import React from "react";
import star from "@src/assets/icons/star.svg";
import starred from "@src/assets/icons/filled-star.svg";
import SizedBox from "@components/SizedBox";
import { IToken } from "@src/constants";
import tokenLogos from "@src/constants/tokenLogos";
import RoundTokenIcon from "@components/RoundTokenIcon";
import Text from "@components/Text";
import { Row } from "@src/components/Flex";
import Button from "@components/Button";
import { useNavigate } from "react-router-dom";

interface IProps {
  token: IToken;
  fav: boolean;
}

const Root = styled.div`
  display: flex;

  align-items: center;
`;
const Fav = styled.img`
  width: 24px;
  height: 24px;
  cursor: pointer;
`;
const DesktopTokenTableRow: React.FC<IProps> = ({ token, fav }) => {
  const navigate = useNavigate();
  return (
    <Root className="gridRow">
      <Row>
        <Fav src={fav ? starred : star} />
        <SizedBox width={18} />
        <RoundTokenIcon src={tokenLogos[token.symbol]} />
        <SizedBox width={18} />
        <Text nowrap weight={500} fitContent>
          {token.name}
        </Text>
        <SizedBox width={18} />
        <Text nowrap type="purple650" fitContent>
          {token.symbol}
        </Text>
      </Row>
      <Text>$ 1</Text>
      <Text>+ 1 %</Text>
      <Text>$ 12,048,217</Text>
      <Button onClick={() => navigate(`/trade`)} size="medium" kind="secondary">
        Trade
      </Button>
    </Root>
  );
};
export default DesktopTokenTableRow;
