import React from "react";
import { Column, Row } from "@components/Flex";
import SizedBox from "@components/SizedBox";
import Text from "@components/Text";
import { observer } from "mobx-react-lite";
import BN from "@src/utils/BN";
import SquareTokenIcon from "@components/SquareTokenIcon";
import styled from "@emotion/styled";

interface IProps {
  availableAmount: BN;
  depositPrefix?: string;
  depositAmount: BN;
  percent: number;
  symbol: string;
  logo: string;
}

const Root = styled.div<{ warning: boolean }>``;
const AddTokenRow: React.FC<IProps> = ({ availableAmount, depositAmount, percent, symbol, logo, depositPrefix }) => {
  const isLowMoney = availableAmount.eq(0);
  return (
    <Root className="gridRow" warning={isLowMoney}>
      <Row alignItems="center" mainAxisSize="fit-content">
        <SquareTokenIcon size="small" src={logo} alt="logo" />
        <SizedBox width={8} />
        <Column>
          <Text fitContent size="medium" className="text">
            {symbol}
          </Text>
          <Text fitContent type="secondary" size="small" className="text">
            <span>Share: </span>
            <span style={{ paddingLeft: 1 }}>{percent} %</span>
          </Text>
        </Column>
      </Row>
      <Column style={{ width: "100%", textAlign: "end" }}>
        <Text nowrap className="text">
          {depositPrefix}
          {depositAmount.toFormat(4)}
        </Text>
        <Text type="secondary" size="small" className="text">
          Available: {availableAmount.toFormat(4)}
        </Text>
      </Column>
    </Root>
  );
};
export default observer(AddTokenRow);
