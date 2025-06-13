import styled from "@emotion/styled";
import AmountInput from "@src/components/AmountInput";
import BigNumberInput from "@src/components/BigNumberInput";
import MaxButton from "@src/components/MaxButton";
import BN from "@src/utils/BN";
import _ from "lodash";
import { useCallback, useEffect, useState } from "react";

interface IProps {
  amount: BN;
  setAmount?: (amount: BN) => void;

  onMaxClick?: () => void;
}

const Root = styled.div`
  display: flex;
  flex-direction: column;

  width: 100%;
`;

const InputContainer = styled.div<{
  focused?: boolean;
  invalid?: boolean;
  readOnly?: boolean;
}>`
  background: ${({ focused, theme }) =>
    focused ? theme.colors.white : theme.colors.primary100};
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  padding: 8px 12px;
  border-radius: 12px;
  width: 100%;
  position: relative;
  cursor: ${({ readOnly }) => (readOnly ? "not-allowed" : "unset")};

  box-sizing: border-box;

  input {
    cursor: ${({ readOnly }) => (readOnly ? "not-allowed" : "unset")};
  }

  border: 1px solid
    ${({ focused, readOnly, theme }) =>
      focused && !readOnly ? theme.colors.blue500 : theme.colors.primary100};

  :hover {
    border-color: ${({ readOnly, focused, theme }) =>
      !readOnly && !focused
        ? theme.colors.primary650
        : focused ?? theme.colors.blue500};
  }
`;

const StakeUnstakeInput: React.FC<IProps> = (props) => {
  const [focused, setFocused] = useState(false);

  const [amount, setAmount] = useState<BN>(props.amount);

  useEffect(() => {
    props.amount && setAmount(props.amount);
  }, [props.amount]);

  const handleChangeAmount = (v: BN) => {
    setAmount(v);
    debounce(v);
  };
  //eslint-disable-next-line react-hooks/exhaustive-deps
  const debounce = useCallback(
    _.debounce((value: BN) => {
      props.setAmount && props.setAmount(value);
    }, 500),
    []
  );

  return (
    <Root>
      <InputContainer focused={focused} readOnly={!props.setAmount}>
        <BigNumberInput
          renderInput={(props, ref) => (
            <AmountInput
              small
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
          decimals={0}
          value={amount}
          onChange={handleChangeAmount}
          placeholder="Enter the amount"
          readOnly={!props.setAmount}
        />
        {props.onMaxClick && (
          <MaxButton
            style={{ border: "none", marginRight: 0 }}
            onClick={() => {
              setFocused(true);
              props.onMaxClick && props.onMaxClick();
            }}
          />
        )}
      </InputContainer>
    </Root>
  )
}

export default StakeUnstakeInput;
