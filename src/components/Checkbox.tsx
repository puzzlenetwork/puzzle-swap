import styled from "@emotion/styled";
import React from "react";
import mark from "@src/assets/icons/checkbox-mark.svg";

interface IProps {
  checked?: boolean;
  onChange: (v: boolean) => void;
}

const Root = styled.span`
  input[type="checkbox"] {
    display: none;
  }

  input[type="checkbox"] + span {
    transition: 0.4s;
    display: inline-block;
    position: relative;
    width: 16px;
    height: 16px;
    vertical-align: middle;
    background: #ffffff;
    border: 1px solid #f1f2fe;
    border-radius: 4px;
    cursor: pointer;
  }

  input[type="checkbox"]:checked + span {
    background: #7075e9;
    border: 1px solid #6563dd;
    content: url(${mark});
  }
`;

const Checkbox: React.FC<IProps> = ({ checked, onChange }) => {
  return (
    <Root onClick={() => onChange(!checked)}>
      <input type="checkbox" checked={checked} readOnly />
      <span />
    </Root>
  );
};
export default Checkbox;
