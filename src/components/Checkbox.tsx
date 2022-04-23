import styled from "@emotion/styled";
import React from "react";
import Text from "./Text";
import SizedBox from "@components/SizedBox";
import checkedIcon from "@src/assets/icons/checked.svg";
import no from "@src/assets/icons/noChecked.svg";

interface IProps {
  label?: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}

const Root = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  user-select: none;
`;
const Check = styled.img`
  cursor: pointer;
  align-items: center;
  justify-content: center;
`;
const Checkbox: React.FC<IProps> = ({ label, checked, onChange }) => {
  return (
    <Root>
      <Check
        src={checked ? checkedIcon : no}
        alt="checked"
        onClick={() => onChange(!checked)}
      />
      <SizedBox width={12} />
      <Text size="medium"> {label}</Text>
    </Root>
  );
};
export default Checkbox;
