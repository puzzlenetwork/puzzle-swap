import styled from "@emotion/styled";
import React, { useState } from "react";
import { Column, Row } from "@src/components/Flex";
import Text from "@src/components/Text";
import share from "@src/assets/icons/share.svg";
import more from "@src/assets/icons/dots.svg";
import SizedBox from "@components/SizedBox";
import Dialog from "@components/Dialog";

interface IProps {}

const Root = styled.div`
  display: flex;
  flex-direction: column;
  padding: 11px;
`;
const Icon = styled.img`
  width: 24px;
  height: 24px;
`;
const MorePoolInformation: React.FC<IProps> = () => {
  const [isOpenedDetails, setOpenedDetails] = useState(false);
  const [isOpenedShare, setOpenedShare] = useState(false);
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
      <Row
        justifyContent="center"
        alignItems="center"
        style={{ cursor: "pointer" }}
        onClick={() => setOpenedDetails(true)}
      >
        <Icon src={more} alt="pic" />
        <SizedBox width={11} />
        <Text>More information</Text>
      </Row>
      <Dialog
        style={{ maxWidth: 360 }}
        bodyStyle={{ minHeight: 440 }}
        title={isOpenedDetails ? "Pool information" : "Share"}
        onClose={() => {
          setOpenedDetails(false);
          setOpenedShare(false);
        }}
        visible={isOpenedDetails || isOpenedShare}
      >
        <Column crossAxisSize="max" style={{ maxHeight: 352 }}>
          data
        </Column>
      </Dialog>
    </Root>
  );
};
export default MorePoolInformation;
