import styled from "@emotion/styled";
import { Column, Row } from "@src/components/Flex";
import Text from "@src/components/Text";
import React from "react";
import SizedBox from "@components/SizedBox";
import { useLimitOrdersVM } from "@screens/TradeInterface/LimitOrdersVM";
import { observer } from "mobx-react-lite";
import LimitTokenInput from "./LimitTokenInput";
import { useStores } from "@stores";
import { ReactComponent as SwapIcon } from "@src/assets/icons/limitOrdersSwap.svg";

interface IProps {}

const Root = styled.div`
  display: flex;
  flex-direction: column;
`;

const TextButton = styled(Text)`
  width: fit-content;
  font-size: 14px;
  line-height: 20px;
  cursor: pointer;
  font-weight: 500;
  transition: 0.4s;
  color: ${({ theme }) => theme.colors?.blue500};

  :hover {
    color: ${({ theme }) => theme.colors?.primary800};
  }
`;

const StyledSwapIcon = styled(SwapIcon)`
  cursor: pointer;

  path {
    transition: 0.4s;
  }

  :hover {
    path {
      fill: ${({ theme }) => theme.colors?.primary800};
      stroke: ${({ theme }) => theme.colors?.primary800};
    }
  }
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
  const { accountStore } = useStores();
  const percents = [25, 50, 75, 100];

  return (
    <Root>
      <Column crossAxisSize="max">
        <Row alignItems="center">
          <Text size="medium" type="secondary" fitContent>
            Amount {vm.amountSettings}
          </Text>
          <SizedBox width={8} />
          <StyledSwapIcon onClick={vm.toggleAmountSettings} />
        </Row>
        <SizedBox height={4} />
        <LimitTokenInput
          prefix={vm.amountSettings === 0 ? vm.token0.symbol : vm.token1.symbol}
          decimals={
            vm.amountSettings === 0 ? vm.token0.decimals : vm.token1.decimals
          }
          amount={vm.amount}
          setAmount={(v) => vm.setAmount(v, true)}
          usdnEquivalent={vm.amountDollEq}
          error={vm.amountError}
        />
        <SizedBox height={4} />
        {accountStore.address != null && (
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
      <Column crossAxisSize="max">
        <Row alignItems="center" justifyContent="space-between">
          <Row alignItems="center">
            <Text size="medium" type="secondary" fitContent>
              Price {vm.priceSettings}
            </Text>
            <SizedBox width={8} />
            <StyledSwapIcon onClick={vm.togglePriceSettings} />
          </Row>
          <TextButton nowrap onClick={vm.getMarketPrice}>
            Set market price
          </TextButton>
        </Row>
        <SizedBox height={4} />
        <LimitTokenInput
          placeholder={vm.loading ? "..." : "0.00"}
          prefix={vm.priceSettings === 0 ? vm.token1.symbol : vm.token0.symbol}
          decimals={
            vm.priceSettings === 0 ? vm.token1.decimals : vm.token0.decimals
          }
          amount={vm.price}
          setAmount={(v) => vm.setPrice(v, true)}
          usdnEquivalent={vm.priceDollEq}
          error={false}
          loading={vm.marketPriceLoading}
        />
      </Column>
      <SizedBox height={16} />

      <Column crossAxisSize="max">
        <Text size="medium" type="secondary" fitContent>
          Total
        </Text>
        <SizedBox height={4} />
        <LimitTokenInput
          prefix={vm.amountSettings === 0 ? vm.token1.symbol : vm.token0.symbol}
          decimals={
            vm.amountSettings === 0 ? vm.token1.decimals : vm.token0.decimals
          }
          amount={vm.total}
          usdnEquivalent={vm.totalDollEq}
          error={vm.totalError}
          setAmount={(v) => vm.setTotal(v, true)}
          loading={vm.marketPriceLoading}
        />
      </Column>
    </Root>
  );
};
export default observer(Prices);
