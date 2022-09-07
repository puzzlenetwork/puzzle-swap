import styled from "@emotion/styled";
import React from "react";
import { IOrder } from "@screens/TradeInterface/LimitOrdersVM";
import Text from "@components/Text";
import { Column, Row } from "@src/components/Flex";
import SizedBox from "@components/SizedBox";
import Img from "@components/Img";
import { useTheme } from "@emotion/react";
import { TOKENS_BY_ASSET_ID } from "@src/constants";
import BN from "@src/utils/BN";
import { Cell, Pie, PieChart } from "recharts";

interface IProps extends IOrder {}

const Root = styled.div`
  display: flex;
  background: ${({ theme }) => theme.colors.white};
  width: 100%;
  align-items: center;
  border: 1px solid ${({ theme }) => theme.colors.primary100};
  border-radius: 16px;
  padding: 18px;
`;

const Order: React.FC<IProps> = ({
  fulfilled0,
  fulfilled1,
  amount1,
  amount0,
  token1,
  token0,
}) => {
  const theme = useTheme();
  const t0 = TOKENS_BY_ASSET_ID[token0];
  const t1 = TOKENS_BY_ASSET_ID[token1];
  const am0 = BN.formatUnits(amount0, t0.decimals);
  const am1 = BN.formatUnits(amount1, t1.decimals);
  const f0 = BN.formatUnits(fulfilled0, t1.decimals);
  const price = am1.div(am0);
  const data = [
    { name: "all", students: am0.toNumber },
    { name: "f", students: f0.toNumber },
  ];
  return (
    <Root>
      <PieChart width={50} height={50}>
        <Pie
          data={data}
          innerRadius={10}
          outerRadius={10}
          fill="#C6C9F4"
          paddingAngle={2}
          dataKey="value"
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} />
          ))}
        </Pie>
      </PieChart>

      <Column>
        <Row alignItems="center">
          <Text size="medium" fitContent weight={500}>
            {am0.toFormat(2)} {t0.symbol}
          </Text>
          <SizedBox width={2} />
          <Img height="16px" width="16px" src={theme.images.icons.rightArrow} />
          <SizedBox width={2} />
          <Text size="medium" fitContent weight={500}>
            {am1.toFormat(2)} {t1.symbol}
          </Text>
        </Row>
        <Text type="secondary" size="small">
          Price: {price.toFormat(2)} {t1.symbol}
        </Text>
      </Column>
      <Row mainAxisSize="fit-content">
        <Text fitContent>Cancel</Text>
      </Row>
    </Root>
  );
};
export default Order;
