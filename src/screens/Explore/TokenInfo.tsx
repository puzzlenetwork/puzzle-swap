import styled from "@emotion/styled";
import { Row } from "@src/components/Flex";
import Text from "@src/components/Text";
import React from "react";

interface IProps {
  num: number;
  assetId: string;
  change: number;
}

const Root = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
`;

const TokenInfo: React.FC<IProps> = ({ num, assetId, change }) => {
  return (
    <Root>
      <Row>
        <Text type="purple300">{num}</Text>
      </Row>
    </Root>
  );
};
export default TokenInfo;
