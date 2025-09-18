import styled from "@emotion/styled";
import React from "react";
import { Row } from "@components/Flex";
import arrow from "@src/assets/icons/backArrow.svg";
import SizedBox from "@components/SizedBox";
import { Link } from "react-router-dom";
import Text from "@components/Text";

interface IProps {
  link: string;
  text: string;
}

const Root = styled(Row)`
  cursor: pointer;

  img {
    width: 16px;
    height: 16px;
  }
`;

const GoBack: React.FC<IProps> = ({ link, text }) => {
  return (
    <Link to={link} style={{ display: "block", width: "100%" }}>
      <Root alignItems="center" mainAxisSize="fit-content">
        <img src={arrow} alt="back" />
        <SizedBox width={8} />
        <Text weight={500} type="blue500" fitContent>
          {text}
        </Text>
      </Root>
    </Link>
  );
};
export default GoBack;
