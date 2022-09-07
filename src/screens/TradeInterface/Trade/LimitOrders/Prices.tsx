import styled from "@emotion/styled";
import { Column, Row } from "@src/components/Flex";
import Text from "@src/components/Text";
import React, { useState } from "react";
import Input from "@components/Input";
import SizedBox from "@components/SizedBox";
import Button from "@components/Button";

interface IProps {}

const Root = styled.div`
  display: flex;
  flex-direction: column;
`;
const Note = styled.div``;
const Prices: React.FC<IProps> = () => {
  const [price, setPrice] = useState(0);
  const [get, setGet] = useState(0);
  return (
    <Root>
      <Column crossAxisSize="max">
        <Row>
          <Text
            fitContent
            size="medium"
            weight={price === 0 ? 500 : 400}
            type={price === 0 ? "primary" : "secondary"}
            onClick={() => setPrice(0)}
          >
            Custom price
          </Text>
          <SizedBox width={12} />
          <Text
            fitContent
            size="medium"
            weight={price === 1 ? 500 : 400}
            type={price === 1 ? "primary" : "secondary"}
            onClick={() => setPrice(1)}
          >
            Market price
          </Text>
        </Row>
        <SizedBox height={4} />
        <Input
          suffix={
            <Text fitContent type="secondary" size="medium">
              $15
            </Text>
          }
        />
      </Column>
      <SizedBox height={16} />
      <Column crossAxisSize="max">
        <Row>
          <Text
            fitContent
            size="medium"
            weight={get === 0 ? 500 : 400}
            type={get === 0 ? "primary" : "secondary"}
            onClick={() => setGet(0)}
          >
            I want to pay
          </Text>
          <SizedBox width={12} />
          <Text
            fitContent
            size="medium"
            weight={get === 1 ? 500 : 400}
            type={get === 1 ? "primary" : "secondary"}
            onClick={() => setGet(1)}
          >
            I want to get
          </Text>
        </Row>
        <SizedBox height={4} />
        <Input
          suffix={
            <Text fitContent type="secondary" size="medium">
              $15
            </Text>
          }
        />
      </Column>
      <SizedBox height={16} />
      <Note>
        <Text size="strange">You’ll get 0 PUZZLE</Text>
        <SizedBox height={4} />
        <Text type="secondary" size="medium">
          Transaction fee 0.005 WAVES
        </Text>
      </Note>
      <SizedBox height={16} />
      <Button fixed>Place an order</Button>
    </Root>
  );
};
export default Prices;
