import styled from "@emotion/styled";
import { Column, Row } from "@src/components/Flex";
import Text from "@src/components/Text";
import React from "react";
import Input from "@components/Input";
import SizedBox from "@components/SizedBox";
import { TOKENS_BY_ASSET_ID } from "@src/constants";
import { useLimitOrdersVM } from "@screens/TradeInterface/LimitOrdersVM";
import { observer } from "mobx-react-lite";
import { useStores } from "@stores";

interface IProps {}

const Root = styled.div`
  display: flex;
  flex-direction: column;
`;
const Note = styled.div`
  padding: 16px;
  gap: 4px;

  border: 1px solid ${({ theme }) => theme.colors.primary100};
  border-radius: 12px;
`;

const TextButton = styled(Text)<{ active?: boolean }>`
  width: fit-content;
  font-size: 14px;
  line-height: 20px;
  cursor: pointer;
  font-weight: ${({ active }) => (active ? 500 : 400)};
  color: ${({ theme, active }) =>
    active ? theme.colors?.primary800 : theme.colors?.primary650};
`;
const Prices: React.FC<IProps> = () => {
  const vm = useLimitOrdersVM();
  const { poolsStore } = useStores();
  const percents = [25, 50, 75, 100];
  return (
    <Root>
      <Column crossAxisSize="max">
        <Row>
          <TextButton
            onClick={() => vm.setPriceSettings(0)}
            active={vm.priceSettings === 0}
          >
            Custom price
          </TextButton>
          <SizedBox width={12} />
          <TextButton
            onClick={() => vm.setPriceSettings(1)}
            active={vm.priceSettings === 1}
          >
            Market price
          </TextButton>
        </Row>
        <SizedBox height={4} />
        <Input
          prefix={
            <Text fitContent type="secondary" size="medium">
              {TOKENS_BY_ASSET_ID[vm.assetId0].symbol}&nbsp;
            </Text>
          }
          suffix={
            <Text fitContent type="secondary" size="medium">
              ${poolsStore.usdnRate(vm.assetId0)?.toFormat(2)}
            </Text>
          }
        />
      </Column>
      <SizedBox height={16} />
      <Column crossAxisSize="max">
        <Row>
          <TextButton
            onClick={() => vm.setPaymentSettings(0)}
            active={vm.paymentSettings === 0}
          >
            I want to pay
          </TextButton>
          <SizedBox width={12} />
          <TextButton
            onClick={() => vm.setPaymentSettings(1)}
            active={vm.paymentSettings === 1}
          >
            I want to get
          </TextButton>
        </Row>
        <SizedBox height={4} />
        <Input
          prefix={
            <Text fitContent type="secondary" size="medium">
              {TOKENS_BY_ASSET_ID[vm.assetId1].symbol}&nbsp;
            </Text>
          }
          suffix={
            <Text fitContent type="secondary" size="medium">
              ${poolsStore.usdnRate(vm.assetId1)?.toFormat(2)}
            </Text>
          }
        />
        <SizedBox height={4} />
        {vm.paymentSettings === 0 && (
          <Row>
            {percents.map((v) => (
              <Text
                key={v}
                fitContent
                type="blue500"
                size="small"
                style={{ paddingRight: 12, cursor: "pointer" }}
              >
                {v}%{" "}
              </Text>
            ))}
          </Row>
        )}
      </Column>
      <SizedBox height={16} />
      <Note>
        <Text size="strange">You’ll get 0 PUZZLE</Text>
        <SizedBox height={4} />
        <Text type="secondary" size="medium">
          Transaction fee 0.005 WAVES
        </Text>
      </Note>
    </Root>
  );
};
export default observer(Prices);
