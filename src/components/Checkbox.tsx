import React from "react";
import { ReactComponent as CheckedCheckbox } from "@src/assets/icons/checked.svg";
import { ReactComponent as NoCheckedCheckbox } from "@src/assets/icons/noChecked.svg";

interface IProps {
  checked?: boolean;
  onChange: (v: boolean) => void;
}

const Checkbox: React.FC<IProps> = ({ checked, onChange }) => {
  return checked ? (
    <CheckedCheckbox
      style={{ cursor: "pointer", width: 19, height: 16 }}
      onClick={() => onChange(false)}
    />
  ) : (
    <NoCheckedCheckbox
      style={{ cursor: "pointer", width: 19, height: 16 }}
      onClick={() => onChange(true)}
    />
  );
};
export default Checkbox;
