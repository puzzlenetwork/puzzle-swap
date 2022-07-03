import styled from "@emotion/styled";
import React from "react";
import Text from "@components/Text";
import { useExploreTokenVM } from "@screens/ExploreToken/ExploreTokenVm";

interface IProps {}

const Root = styled.div`
  display: flex;
  flex-direction: column;
`;

const AboutToken: React.FC<IProps> = () => {
  const vm = useExploreTokenVM();
  return (
    <Root>
      <Text>About {vm.asset.name}</Text>
    </Root>
  );
};
export default AboutToken;
