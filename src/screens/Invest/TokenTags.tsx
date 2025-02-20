import styled from "@emotion/styled";
import React from "react";
import Tag from "@components/Tag";
import Text from "@components/Text";
import { IAssetBalance } from "@src/entities/Balance";
import { IToken } from "@src/constants";
import { Row } from "@components/Flex";
import { useTheme } from "@emotion/react";
import { IAssetsPoolInfo } from "@src/entities/Pool";

interface IProps {
  tokens: IAssetsPoolInfo[];
  findBalanceByAssetId: (assetId: string) => IAssetBalance | null | undefined;
}

const Root = styled(Row)`
  padding-top: 8px;
  flex-wrap: wrap;
  margin: -2px;

  & > * {
    margin: 2px;
  }
`;
const TokenTags: React.FC<IProps> = ({ tokens, findBalanceByAssetId }) => {
  const needToHide = tokens.length > 4;
  const tokensToDisplay = needToHide ? tokens.slice(0, 4) : tokens;
  const moreHiddenAmount = tokens.length - 4;
 
  return (
    <Root>
      {tokensToDisplay.map(({ name, asset_id, share }, i) => {
        const assetBalance = findBalanceByAssetId(asset_id);
        const isActive =
          assetBalance && assetBalance.balance && assetBalance.balance.gt(0);
        return (
          <Tag
            key={asset_id + String(i)}
            background={isActive ? undefined : undefined}
          >
            {name} {share} %
          </Tag>
        );
      })}
      {needToHide && moreHiddenAmount > 0 && (
        <Text type="blue500" weight={500} fitContent>
          +{moreHiddenAmount} more
        </Text>
      )}
    </Root>
  );
};
export default TokenTags;
