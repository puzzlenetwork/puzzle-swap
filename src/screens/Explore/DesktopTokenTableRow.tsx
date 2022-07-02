import styled from "@emotion/styled";
import React, { useRef } from "react";
import star from "@src/assets/icons/star.svg";
import starHover from "@src/assets/icons/star-hover.svg";
import starred from "@src/assets/icons/filled-star.svg";
import starredHovered from "@src/assets/icons/filled-star-hover.svg";
import SizedBox from "@components/SizedBox";
import { IToken } from "@src/constants";
import tokenLogos from "@src/constants/tokenLogos";
import RoundTokenIcon from "@components/RoundTokenIcon";
import Text from "@components/Text";
import { Row } from "@src/components/Flex";
import Button from "@components/Button";
import { useNavigate } from "react-router-dom";
import useHover from "@src/hooks/useHover";
import BN from "@src/utils/BN";

interface IProps {
  token: IToken;
  fav: boolean;
  change?: BN;
  handleWatchListChange: (assetId: string) => void;
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
const DesktopTokenTableRow: React.FC<IProps> = ({
  token,
  fav,
  change,
  handleWatchListChange,
}) => {
  const navigate = useNavigate();
  const hoverRef = useRef(null);
  const isHover = useHover(hoverRef);
  return (
    <Root className="gridRow">
      <Row>
        <Fav
          src={
            fav
              ? isHover
                ? starredHovered
                : starred
              : isHover
              ? starHover
              : star
          }
          ref={hoverRef}
          onClick={() => handleWatchListChange(token.assetId)}
        />
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
      {change != null ? (
        <Text type={change?.gt(0) ? "success" : "error"}>
          {change.toFormat(2)} %
        </Text>
      ) : (
        <Text>no stat</Text>
      )}
      <Text>$ 12,048,217</Text>
      <Button
        onClick={() => navigate(`/trade?asset1=${token.assetId}`)}
        size="medium"
        kind="secondary"
      >
        Trade
      </Button>
    </Root>
  );
};
export default DesktopTokenTableRow;
