import styled from "@emotion/styled";
import React, { useState } from "react";
import Text from "@components/Text";
import AmountInput from "@components/AmountInput";
import BigNumberInput from "@components/BigNumberInput";
import BN from "@src/utils/BN";

interface IProps
  extends Omit<
    React.DetailedHTMLProps<
      React.InputHTMLAttributes<HTMLInputElement>,
      HTMLInputElement
    >,
    "onChange"
  > {
  amount: BN;
  maxValue?: BN;
  minValue?: BN;
  onChange: (e: BN) => void;
  error?: boolean;
}

const Root = styled.div<{
  focused?: boolean;
  error?: boolean;
  disabled?: boolean;
}>`
  position: relative;
  background: ${({ focused }) => (focused ? "#fffff" : "#f1f2fe")};
  border: 1px solid
    ${({ focused, error }) =>
      error ? "#ED827E" : focused ? "#7075E9" : "#f1f2fe"};

  :hover {
    border-color: ${({ focused, error }) =>
      error ? "#ED827E" : !focused ? "#C6C9F4" : "#7075E9"};
  }

  border-radius: 12px;
  justify-content: space-between;
  display: flex;
  padding: 8px 27px 8px 12px;
  font-size: 16px;
  line-height: 24px;
  box-sizing: border-box;
  height: 40px;
  width: 80px;

  input {
    text-align: right;
    padding: 0;
    width: 41px;
    height: 22px;
    color: ${({ focused }) => (focused ? "#363870" : "#8082c5")};
    outline: none;
    border: none;
    background-color: transparent;

    :disabled {
      cursor: not-allowed;
    }

    ::placeholder {
      color: #8082c5;
    }

    ::-webkit-outer-spin-button,
    ::-webkit-inner-spin-button {
      -webkit-appearance: none;
      margin: 0;
    }
     {
      -moz-appearance: textfield;
    }
  }
`;

const ShareTokenInput: React.FC<IProps> = ({
  amount,
  error,
  maxValue,
  minValue,
  onChange,
  ...props
}) => {
  const [focused, setFocused] = useState(false);
  return (
    <>
      <Root focused={focused} error={error} {...props}>
        <BigNumberInput
          renderInput={(props, ref) => (
            <AmountInput
              {...props}
              style={{
                fontSize: 16,
                lineHeight: 24,
              }}
              onFocus={(e) => {
                props.onFocus && props.onFocus(e);
                !props.readOnly && setFocused(true);
              }}
              onBlur={(e) => {
                props.onBlur && props.onBlur(e);
                setFocused(false);
              }}
              ref={ref}
            />
          )}
          autofocus={focused}
          decimals={1}
          value={amount}
          onChange={(v) => onChange && onChange(v)}
          placeholder="0.00"
        />
        <Text
          type="secondary"
          size="medium"
          fitContent
          style={{ position: "absolute", right: 12, top: 10 }}
        >
          %
        </Text>
      </Root>
    </>
  );
};
export default ShareTokenInput;
