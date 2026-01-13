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
import BN from "@src/utils/BN";
import { useNavigate } from "react-router-dom";
import { useStores } from "@stores";
import { observer } from "mobx-react-lite";

interface IProps {
  token: IToken;
  fav: boolean;
  change?: BN;
  vol24?: BN;
  rate?: BN;
  handleWatchListChange: (assetId: string) => void;
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
const MobileTokenTableRow: React.FC<IProps> = observer(({ token, fav, handleWatchListChange, rate, change, vol24 }) => {
  const navigate = useNavigate();
  const { accountStore } = useStores();
  const changeColor = change?.gt(0) ? accountStore.priceColors.upAlt : accountStore.priceColors.downAlt;
  return (
    <Root className="gridRow">
      <Row alignItems="center">
        <Fav src={fav ? starred : star} onClick={() => handleWatchListChange(token.assetId)} />
        <SizedBox width={18} />
        <Row onClick={() => navigate(`/explore/token/${token.assetId}`)} style={{ cursor: "pointer" }}>
          <SquareTokenIcon src={tokenLogos[token.symbol]} size="small" />
          <SizedBox width={18} />
          <Column>
            <Text>{token.name}</Text>
            <Text type="purple300" size="small">
              {token.symbol}
            </Text>
          </Column>
        </Row>
      </Row>
      <Column justifyContent="flex-end" crossAxisSize="max">
        <Text textAlign="end">$ {rate?.gte(0.0001) ? rate?.toFormat(4) : rate?.toFormat(8)}</Text>
        {change != null && vol24 != null && !vol24.eq(0) ? (
          <Text textAlign="end" nowrap size="small" style={{ color: changeColor }}>
            {change?.toFormat(2)}%
          </Text>
        ) : (
          <Text textAlign="end" nowrap size="small">-</Text>
        )}
      </Column>
    </Root>
  );
});
export default MobileTokenTableRow;
