import SizedBox from "@components/SizedBox";
import Button from "@components/Button";
import React from "react";
import useWindowSize from "@src/hooks/useWindowSize";
import styled from "@emotion/styled";

interface IProps {
  icon: JSX.Element;
  onClick?: () => void;
}

const Root = styled.div`
  cursor: pointer;

  path {
    stroke: #7075e9;
  }
`;

const IconButtonAdaptive: React.FC<IProps> = ({ icon, onClick, children }) => {
  const { width } = useWindowSize();
  return (
    <Root onClick={onClick}>
      {(width ?? 0) >= 880 ? (
        <Button size="medium" kind="secondary">
          {icon}
          <SizedBox width={10} />
          {children}
        </Button>
      ) : (
        icon
      )}
    </Root>
  );
};
export default IconButtonAdaptive;
