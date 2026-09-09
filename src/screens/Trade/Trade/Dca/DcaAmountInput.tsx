import styled from "@emotion/styled";
import AmountInput from "@components/AmountInput";
import BigNumberInput from "@components/BigNumberInput";
import { Row } from "@components/Flex";
import MaxButton from "@components/MaxButton";
import SizedBox from "@components/SizedBox";
import Text from "@components/Text";
import BN from "@src/utils/BN";
import { observer } from "mobx-react-lite";
import React, { useState } from "react";

interface IProps {
  label: string;
  hint?: React.ReactNode;
  decimals: number;
  amount: BN;
  setAmount: (amount: BN) => void;
  suffix?: string;
  placeholder?: string;
  error?: boolean;
  onMaxClick?: () => void;
  disabled?: boolean;
}

const Root = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
`;

const InputContainer = styled.div<{ focused?: boolean; error?: boolean }>`
  background: ${({ theme }) => theme.colors.primary100};
  display: flex;
  flex-direction: row;
  align-items: center;
  padding: 0 16px;
  height: 48px;
  border-radius: 12px;
  width: 100%;
  box-sizing: border-box;
  border: 1px solid
    ${({ focused, error, theme }) =>
      error ? theme.colors.error500 : focused ? theme.colors.blue500 : theme.colors.primary100};
  transition: 0.2s;

  :hover {
    border-color: ${({ focused, error, theme }) =>
      error ? theme.colors.error500 : focused ? theme.colors.blue500 : theme.colors.primary300};
  }
`;

const DcaAmountInput: React.FC<IProps> = (props) => {
  const [focused, setFocused] = useState(false);
  return (
    <Root>
      <Row justifyContent="space-between" alignItems="center">
        <Text size="medium" type="secondary" fitContent nowrap>
          {props.label}
        </Text>
        {props.hint != null && (
          <Text size="small" type="secondary" fitContent nowrap style={{ textAlign: "right" }}>
            {props.hint}
          </Text>
        )}
      </Row>
      <SizedBox height={4} />
      <InputContainer focused={focused} error={props.error}>
        <BigNumberInput
          renderInput={(inputProps, ref) => (
            <AmountInput
              {...inputProps}
              small
              ref={ref}
              onFocus={() => !props.disabled && setFocused(true)}
              onBlur={() => setFocused(false)}
            />
          )}
          autofocus={false}
          decimals={props.decimals}
          value={props.amount}
          onChange={props.setAmount}
          placeholder={props.placeholder ?? "0.00"}
          readOnly={props.disabled}
          disabled={props.disabled}
        />
        {props.suffix != null && (
          <Text size="medium" type="secondary" fitContent nowrap style={{ paddingLeft: 8 }}>
            {props.suffix}
          </Text>
        )}
        {props.onMaxClick != null && (
          <>
            <SizedBox width={8} />
            <MaxButton onClick={props.onMaxClick} />
          </>
        )}
      </InputContainer>
    </Root>
  );
};

export default observer(DcaAmountInput);
