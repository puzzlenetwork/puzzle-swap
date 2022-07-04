import styled from "@emotion/styled";
import React, { useState } from "react";
import Text from "@components/Text";
import { useExploreTokenVM } from "@screens/ExploreToken/ExploreTokenVm";
import SizedBox from "@components/SizedBox";
import TextButton from "@components/TextButton";
import SmoothCollapse from "react-smooth-collapse";

interface IProps {}

const Root = styled.div`
  display: flex;
  flex-direction: column;
  transition: 0.4s;
  overflow: hidden;
`;
const Gradient = styled.div`
  display: flex;
  bottom: 0;
  left: 0;
  top: 40%;
  width: 100%;
  position: absolute;
  background: linear-gradient(180deg, rgba(248, 248, 255, 0) 0%, #f8f8ff 100%);
  z-index: 10;
`;
const Body = styled(SmoothCollapse)`
  position: relative;
  font-weight: 400;
  font-size: 16px;
  line-height: 24px;
  color: #363870;
  white-space: pre-wrap;
`;
const AboutToken: React.FC<IProps> = () => {
  const vm = useExploreTokenVM();
  const [opened, setOpened] = useState(false);
  return (
    <Root>
      <SizedBox height={40} />
      <Text weight={500} size="big">
        About {vm.asset.name}
      </Text>
      <SizedBox height={16} />
      <Text
        type="secondary"
        style={{
          whiteSpace: "pre-wrap",
          position: "relative",
        }}
      >
        {vm.tokenLifeData[0]}
        {!opened && <Gradient />}
      </Text>
      <Body expanded={opened}>
        <Text type="secondary" style={{ whiteSpace: "pre-wrap" }}>
          {vm.tokenLifeData[1]}
        </Text>
        <Text type="secondary" style={{ whiteSpace: "pre-wrap" }}>
          {vm.about != null && vm.about !== "" ? `\n${vm.about}` : ""}
        </Text>
      </Body>
      <SizedBox height={16} />
      <TextButton
        kind="secondary"
        weight={500}
        onClick={() => setOpened(!opened)}
      >
        {!opened ? "Read more..." : "Hide.."}
      </TextButton>
    </Root>
  );
};
export default AboutToken;
