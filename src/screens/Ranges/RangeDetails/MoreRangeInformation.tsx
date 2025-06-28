import styled from "@emotion/styled";
import React from "react";
import { Row } from "@src/components/Flex";
import Text from "@src/components/Text";
import share from "@src/assets/icons/share.svg";
import more from "@src/assets/icons/dots.svg";
import SizedBox from "@components/SizedBox";
import { Link } from "react-router-dom";

interface IProps {
  setOpenedShare: (state: boolean) => void;
}

const Root = styled.div`
  display: flex;
  flex-direction: column;
  padding: 11px;
`;
const Icon = styled.img`
  width: 24px;
  height: 24px;
`;
const MoreRangeInformation: React.FC<IProps> = ({
  setOpenedShare,
}) => {
  return (
    <Root>
      <Row
        justifyContent="center"
        alignItems="center"
        style={{ cursor: "pointer" }}
        onClick={() => setOpenedShare(true)}
      >
        <Icon src={share} alt="pic" />
        <SizedBox width={11} />
        <Text>Share on social media</Text>
      </Row>
      <SizedBox height={20} />
      <Link to="https://stage2.puzzle.name/ranged/" target="_blank">
        <Row
          justifyContent="center"
          alignItems="center"
          style={{ cursor: "pointer" }}
        >
          <Icon src={more} alt="pic" />
          <SizedBox width={11} />
          <Text>More information</Text>
        </Row>
      </Link>
    </Root>
  );
};
export default MoreRangeInformation;
