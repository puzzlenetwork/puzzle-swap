import styled from "@emotion/styled";
import React, { useState } from "react";
import Text from "@components/Text";
import { observer } from "mobx-react-lite";
import BN from "@src/utils/BN";
import BigNumberInput from "@components/BigNumberInput";
import AmountInput from "@components/AmountInput";
import { TOKENS_BY_ASSET_ID } from "@src/constants";

interface IProps {
  assetId: string;
  decimals: number;
  amount: BN;
  setAmount?: (amount: BN) => void;
  usdnEquivalent?: string;
  error?: boolean;
  disabled?: boolean;
}

const Root = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
`;

const InputContainer = styled.div<{
  focused?: boolean;
  error?: boolean;
  invalid?: boolean;
  readOnly?: boolean;
}>`
  background: ${({ focused, theme }) =>
    focused ? "#fffff" : theme.colors.primary100};
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  padding: 16px;
  height: 48px;
  border-radius: 12px;
  width: 100%;
  position: relative;
  cursor: ${({ readOnly }) => (readOnly ? "not-allowed" : "unset")};

  box-sizing: border-box;

  input {
    cursor: ${({ readOnly }) => (readOnly ? "not-allowed" : "unset")};
  }

  border: 1px solid
    ${({ focused, readOnly, error, theme }) =>
      error
        ? theme.colors.error500
        : focused && !readOnly
        ? theme.colors.blue500
        : theme.colors.primary100};

  :hover {
    border-color: ${({ readOnly, focused, error, theme }) =>
      error
        ? theme.colors.error500
        : !readOnly && !focused
        ? theme.colors.primary300
        : focused ?? theme.colors.blue500};
  }
`;
const LimitTokenInput: React.FC<IProps> = (props) => {
  const [focused, setFocused] = useState(false);

  return (
    <Root>
      <InputContainer
        focused={focused}
        readOnly={!props.setAmount}
        error={props.error}
      >
        <Text
          fitContent
          type={focused ? "primary" : "secondary"}
          style={{ paddingRight: 2, fontSize: 16 }}
        >
          {TOKENS_BY_ASSET_ID[props.assetId].symbol}
        </Text>
        <BigNumberInput
          renderInput={(props, ref) => (
            <AmountInput
              {...props}
              onFocus={(e) => {
                props.onFocus && props.onFocus(e);
                !props.readOnly && setFocused(true);
              }}
              onBlur={(e) => {
                props.onBlur && props.onBlur(e);
                setFocused(false);
              }}
              ref={ref}
              disabled={props.disabled}
              small
            />
          )}
          autofocus={focused}
          decimals={props.decimals}
          value={props.amount}
          onChange={(v) => props.setAmount && props.setAmount(v)}
          placeholder="0.00"
          readOnly={!props.setAmount}
        />

        <Text
          style={{ whiteSpace: "nowrap" }}
          type="secondary"
          size="small"
          fitContent
        >
          {props.usdnEquivalent}
        </Text>
      </InputContainer>
    </Root>
  );
};
export default observer(LimitTokenInput);
