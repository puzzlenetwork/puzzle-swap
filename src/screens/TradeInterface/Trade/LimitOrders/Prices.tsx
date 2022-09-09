import styled from "@emotion/styled";
import { Column, Row } from "@src/components/Flex";
import Text from "@src/components/Text";
import React from "react";
import SizedBox from "@components/SizedBox";
import { useLimitOrdersVM } from "@screens/TradeInterface/LimitOrdersVM";
import { observer } from "mobx-react-lite";
import LimitTokenInput from "./LimitTokenInput";
import { TOKENS_BY_ASSET_ID } from "@src/constants";
import BN from "@src/utils/BN";

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
const Percents = styled(Row)`
  & > * {
    :hover {
      color: ${({ theme }) => theme.colors.primary800};
    }
  }
`;
const Prices: React.FC<IProps> = () => {
  const vm = useLimitOrdersVM();
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
            onClick={() => {
              vm.makePriceFromMarket();
              vm.setPriceSettings(1);
            }}
            active={vm.priceSettings === 1}
          >
            Market price
          </TextButton>
        </Row>
        <SizedBox height={4} />
        <LimitTokenInput
          placeholder={vm.priceSettings === 1 && vm.loading ? "..." : "0.00"}
          prefix={TOKENS_BY_ASSET_ID[vm.assetId0].symbol}
          assetId={vm.token0.assetId}
          decimals={vm.token0.decimals}
          amount={vm.price}
          setAmount={vm.setPrice}
          usdnEquivalent={vm.dollEq0}
          error={false}
          disabled={vm.priceSettings === 1}
          loading={vm.marketPriceLoading}
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
        <LimitTokenInput
          prefix={
            TOKENS_BY_ASSET_ID[
              vm.paymentSettings === 0 ? vm.assetId1 : vm.assetId0
            ].symbol
          }
          assetId={vm.token1.assetId}
          decimals={vm.token1.decimals}
          amount={vm.payment}
          setAmount={vm.setPayment}
          usdnEquivalent={vm.dollEq1}
          error={vm.paymentError0}
        />
        <SizedBox height={4} />
        {vm.paymentSettings === 0 && (
          <Percents>
            {percents.map((v) => (
              <Text
                key={v}
                fitContent
                type="blue500"
                size="small"
                style={{ paddingRight: 12, cursor: "pointer" }}
                onClick={() => vm.onPercentClick(v)}
              >
                {v}%{" "}
              </Text>
            ))}
          </Percents>
        )}
      </Column>
      <SizedBox height={16} />
      <Note>
        <Text
          size="big"
          type={
            vm.paymentSettings === 1 && vm.paymentError1 ? "error" : "primary"
          }
        >
          {vm.paymentSettings === 0
            ? `You’ll get ${BN.formatUnits(
                vm.finalAmount,
                vm.token0.decimals
              ).toFormat(2)} ${vm.token0.symbol}`
            : `You’ll pay ${BN.formatUnits(
                vm.finalAmount,
                vm.token1.decimals
              ).toFormat(2)} ${vm.token1.symbol}`}
        </Text>
        <SizedBox height={4} />
        <Text type="secondary" size="medium">
          Transaction fee 0.005 WAVES
        </Text>
      </Note>
    </Root>
  );
};
export default observer(Prices);
