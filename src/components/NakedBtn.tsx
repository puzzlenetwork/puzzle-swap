import styled from "@emotion/styled";
import React, { HTMLAttributes } from "react";

interface IProps extends HTMLAttributes<HTMLDivElement> {
  prefix?: string;
  suffix?: string;
}

const Root = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  font-weight: 400;
  font-size: 16px;
  line-height: 24px;
  color: #ffffff;
  cursor: pointer;
  white-space: nowrap;
`;
const Icon = styled.img`
  height: 16px;
  width: 16px;
`;
const NakedBtn: React.FC<IProps> = ({ suffix, prefix, children, ...rest }) => {
  return (
    <Root {...rest}>
      {suffix && <Icon src={suffix} alt="suffix" style={{ marginRight: 4 }} />}
      <span>{children}</span>
      {prefix && <Icon src={prefix} alt="prefix" style={{ marginLeft: 4 }} />}
    </Root>
  );
};
export default NakedBtn;
