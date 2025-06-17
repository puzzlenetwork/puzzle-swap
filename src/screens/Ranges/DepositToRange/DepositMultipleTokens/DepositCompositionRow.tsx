import React from "react";
import { Column, Row } from "@components/Flex";
import SizedBox from "@components/SizedBox";
import Text from "@components/Text";
import { observer } from "mobx-react-lite";
import BN from "@src/utils/BN";
import SquareTokenIcon from "@components/SquareTokenIcon";
import styled from "@emotion/styled";

interface IProps {
  availableAmount?: BN | null;
  depositAmount: BN | null;
  share: BN;
  name: string;
  logo: string;
}

const Root = styled.div<{ warning: boolean }>`
  .text {
    color: ${({ warning }) => warning && "#ed827e"};
  }
`;
const DepositCompositionRow: React.FC<IProps> = ({
  availableAmount,
  depositAmount,
  share,
  name,
  logo,
}) => {
  const available = availableAmount ? availableAmount.toFormat(4) : "-";
  const deposit = depositAmount
    ? depositAmount.isNaN()
      ? "-"
      : depositAmount.toFormat(4)
    : "-";
  const isLowMoney = availableAmount != null && availableAmount.eq(0);
  return (
    <Root className="gridRow" warning={isLowMoney}>
      <Row alignItems="center" mainAxisSize="fit-content">
        <SquareTokenIcon size="small" src={logo} alt="logo" />
        <SizedBox width={8} />
        <Column>
          <Text fitContent size="medium" className="text">
            {name}
          </Text>
          <Text fitContent type="secondary" size="small" className="text">
            <span>Share: </span>
            <span
              style={{
                color: isLowMoney ? "#ed827e" : "#363870",
                paddingLeft: 1,
              }}
            >
              {share.toFormat(2)} %
            </span>
          </Text>
        </Column>
      </Row>
      <Column style={{ width: "100%", textAlign: "end" }}>
        <Text nowrap className="text">
          {deposit}
        </Text>
        <Text type="secondary" size="small" className="text">
          Available: {available}
        </Text>
      </Column>
    </Root>
  );
};
export default observer(DepositCompositionRow);
