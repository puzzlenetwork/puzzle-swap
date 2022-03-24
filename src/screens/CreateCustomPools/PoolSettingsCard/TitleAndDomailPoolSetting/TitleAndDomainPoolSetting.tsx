import styled from "@emotion/styled";
import React from "react";
import Card from "@components/Card";
import Text from "@components/Text";
import SizedBox from "@components/SizedBox";
import Input from "@components/Input";
import { useCreateCustomPoolsVM } from "@screens/CreateCustomPools/CreateCustomPoolsVm";
import { observer } from "mobx-react-lite";
import Button from "@components/Button";
import { Row } from "@src/components/Flex";
import ShareTokenInput from "@screens/CreateCustomPools/PoolSettingsCard/SelectAssets/ShareTokenInput";
import Notification from "@src/components/Notification";
import ImageUpload from "@components/ImageUpload";

interface IProps {}

const Root = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
`;

const TitleAndDomainPoolSetting: React.FC<IProps> = () => {
  const vm = useCreateCustomPoolsVM();
  const swapFeeError = vm.swapFee > 5;
  return (
    <Root>
      <Text type="secondary" weight={500}>
        Pool Settings
      </Text>
      <SizedBox height={8} />
      <Card>
        <ImageUpload onChange={vm.setLogo} image={vm.logo} />
        <SizedBox height={16} />
        <Text type="secondary" size="medium">
          Title of the pool
        </Text>
        <SizedBox height={4} />
        <Input
          value={vm.title}
          onChange={(e) => vm.setTitle(e.target.value)}
          placeholder="Enter the title…"
        />
        <SizedBox height={16} />
        <Text type="secondary" size="medium">
          Domain of the pool
        </Text>
        <SizedBox height={4} />
        <Input
          value={vm.domain}
          onChange={(e) => vm.setDomain(e.target.value)}
          placeholder="puzzleswap.org/…"
          description="2–13 lowercase latin and number characters"
          errorText="This domain is already taken"
          error
        />
        <SizedBox height={16} />
        <Text type="secondary" size="medium">
          Swap fees
        </Text>
        <SizedBox height={8} />
        <Row>
          {Array.from({ length: 3 }).map((_, index) => (
            <Button
              key={index + "percent"}
              kind="secondary"
              onClick={() => vm.setSwapFee(index + 1)}
              size="medium"
              style={{ marginRight: 4 }}
            >
              {index + 1} %
            </Button>
          ))}
          <ShareTokenInput
            value={vm.swapFee}
            error={swapFeeError}
            onChange={(e) => vm.setSwapFee(Number(e.target.value))}
          />
        </Row>
        {swapFeeError && (
          <Notification
            style={{ marginTop: 16 }}
            type="error"
            text="Swap fees for the pool must be from 0.5% to 5%"
          />
        )}
      </Card>
    </Root>
  );
};
export default observer(TitleAndDomainPoolSetting);
