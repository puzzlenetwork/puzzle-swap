import styled from "@emotion/styled";
import AmountInput from "@components/AmountInput";
import { Row } from "@components/Flex";
import SizedBox from "@components/SizedBox";
import Text from "@components/Text";
import { observer } from "mobx-react-lite";
import React, { useState } from "react";

interface IProps {
  label: string;
  hint?: React.ReactNode;
  value: number;
  setValue: (value: number) => void;
  suffix?: string;
  min: number;
  max: number;
  error?: boolean;
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

const DcaNumberInput: React.FC<IProps> = (props) => {
  const [focused, setFocused] = useState(false);
  const [draft, setDraft] = useState<string | null>(null);

  const commit = (raw: string) => {
    const parsed = parseInt(raw.replace(/\D/g, ""), 10);
    if (Number.isNaN(parsed)) return;
    props.setValue(Math.min(props.max, Math.max(props.min, parsed)));
  };

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
        <AmountInput
          small
          value={draft ?? String(props.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => {
            setFocused(false);
            draft != null && commit(draft);
            setDraft(null);
          }}
          onChange={(e) => {
            const raw = e.target.value.replace(/\D/g, "");
            setDraft(raw);
            raw !== "" && commit(raw);
          }}
        />
        {props.suffix != null && (
          <Text size="medium" type="secondary" fitContent nowrap style={{ paddingLeft: 8 }}>
            {props.suffix}
          </Text>
        )}
      </InputContainer>
    </Root>
  );
};

export default observer(DcaNumberInput);
