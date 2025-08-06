import AmountInput from "@src/components/AmountInput";
import BigNumberInput from "@src/components/BigNumberInput";
import BN from "@src/utils/BN";
import styled from "@emotion/styled";
import { useState } from "react";
import Text from "@src/components/Text";

interface IProps
  extends Omit<React.DetailedHTMLProps<React.InputHTMLAttributes<HTMLInputElement>, HTMLInputElement>, "onChange"> {
  amount: BN;
  decimals: number;
  placeholder?: string;
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
  background: ${({ focused, theme }) => (focused ? theme.colors.white : theme.colors.primary100)};
  border: 1px solid
    ${({ focused, error, theme }) =>
      error ? theme.colors.error500 : focused ? theme.colors.blue500 : theme.colors.primary100};

  :hover {
    border-color: ${({ focused, error, theme }) =>
      error ? theme.colors.error500 : !focused ? theme.colors.primary650 : theme.colors.blue500};
  }

  border-radius: 12px;
  display: flex;
  padding: 12px 16px;
  box-sizing: border-box;
  height: 48px;
  width: 100%;

  input {
    padding: 0;
    width: 100%;
    height: 24px;
    font-size: 20px;
    line-height: 24px;
    color: ${({ focused, theme }) => (focused ? theme.colors.primary800 : theme.colors.primary650)};
    outline: none;
    border: none;
    background-color: transparent;

    :disabled {
      cursor: not-allowed;
    }

    ::placeholder {
      color: ${({ theme }) => theme.colors.primary650};
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

const PriceLimitInput: React.FC<IProps> = ({
  amount,
  decimals,
  error,
  placeholder,
  maxValue,
  minValue,
  onChange,
  ...props
}) => {
  const [focused, setFocused] = useState(false);

  return (
    <Root {...props} focused={focused} error={error}>
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
          />
        )}
        autofocus={focused}
        decimals={decimals}
        value={amount}
        onChange={(v) => onChange && onChange(v)}
        placeholder={placeholder ?? "0.00"}
      />
    </Root>
  );
};

export default PriceLimitInput;
