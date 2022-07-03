import { Row } from "@src/components/Flex";
import Text from "@src/components/Text";
import React from "react";
import SizedBox from "@components/SizedBox";
import RoundTokenIcon from "@components/RoundTokenIcon";
import tokenLogos from "@src/constants/tokenLogos";
import { ROUTES, TOKENS_BY_ASSET_ID } from "@src/constants";
import BN from "@src/utils/BN";
import { Link } from "react-router-dom";

interface IProps {
  num: number;
  assetId: string;
  change: BN;
}

const TokenInfo: React.FC<IProps> = ({ num, assetId, change }) => {
  return (
    <Row justifyContent="space-between">
      <Link to={ROUTES.EXPLORE_TOKEN.replace(":assetId", assetId)}>
        <Row mainAxisSize="fit-content">
          <Text type="purple300" fitContent>
            {num}
          </Text>
          <SizedBox width={8} />
          <RoundTokenIcon
            src={tokenLogos[TOKENS_BY_ASSET_ID[assetId].symbol]}
          />
          <SizedBox width={8} />
          <Row style={{ flexWrap: "wrap" }}>
            <Text nowrap weight={500} fitContent>
              {TOKENS_BY_ASSET_ID[assetId].name}
            </Text>
            <SizedBox width={8} />
            <Text nowrap type="purple300" fitContent>
              {TOKENS_BY_ASSET_ID[assetId].symbol}
            </Text>
          </Row>
        </Row>
      </Link>
      <Text
        type={change.gt(0) ? "success" : "error"}
        weight={500}
        fitContent
        style={{ flexWrap: "wrap" }}
      >
        {change.toFormat(2)}%
      </Text>
    </Row>
  );
};
export default TokenInfo;
