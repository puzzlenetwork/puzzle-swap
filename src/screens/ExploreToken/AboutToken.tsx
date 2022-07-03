import styled from "@emotion/styled";
import React, { useState } from "react";
import Text from "@components/Text";
import { useExploreTokenVM } from "@screens/ExploreToken/ExploreTokenVm";
import SizedBox from "@components/SizedBox";
import TextButton from "@components/TextButton";

interface IProps {}

const Root = styled.div`
  display: flex;
  flex-direction: column;
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
const Container = styled.div`
  position: relative;
  transition: 0.4s;
`;
const AboutToken: React.FC<IProps> = () => {
  const vm = useExploreTokenVM();
  const [opened, setOpend] = useState(false);
  const text = vm.about;
  return (
    <Root>
      <SizedBox height={40} />
      <Text weight={500} size="big">
        About {vm.asset.name}
      </Text>
      <SizedBox height={16} />
      <Container>
        <Text type="secondary" style={{ whiteSpace: "pre-wrap" }}>
          {opened ? text : text.slice(0, text.length / 3)}
        </Text>
        {!opened && <Gradient />}
      </Container>
      <SizedBox height={16} />
      <TextButton
        kind="secondary"
        weight={500}
        onClick={() => setOpend(!opened)}
      >
        {!opened ? "Read more..." : "Hide"}
      </TextButton>
    </Root>
  );
};
export default AboutToken;
