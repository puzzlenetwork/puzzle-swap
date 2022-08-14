import styled from "@emotion/styled";
import React from "react";
import Layout from "@components/Layout";
import Text from "@components/Text";
import SizedBox from "@components/SizedBox";
import { Observer } from "mobx-react-lite";
import {
  BoostApyVmProvider,
  useBoostApyVm,
} from "@screens/BoostApy/BoostApyVm";
import GoBack from "@components/GoBack";
import { useParams } from "react-router-dom";
import CalcBoostingAmountCard from "./CalcBoostingAmountCard";
import Button from "@components/Button";
import { Column, Row } from "@src/components/Flex";
import dayjs from "dayjs";

interface IProps {}

const Root = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 0 16px;
  min-height: 100%;
  margin-bottom: 24px;
  margin-top: 40px;
  width: 100%;
  max-width: calc(560px + 32px);
  box-sizing: border-box;
  @media (min-width: 880px) {
    margin-top: 56px;
  }
`;
const Subtitle = styled(Text)`
  @media (min-width: 880px) {
    max-width: 560px;
  }
`;
const Details = styled(Column)`
  padding: 0 16px;
  box-sizing: border-box;

  & > * {
    padding: 10px 0;
    border-bottom: solid 1px #c6c9f4;
  }

  & > :last-of-type {
    border-bottom: none;
  }
`;
const BoostApyImpl: React.FC<IProps> = () => {
  const vm = useBoostApyVm();
  return (
    <Layout>
      <Observer>
        {() => {
          console.log(vm.days);
          const details = [
            { title: "Boosted APY", value: vm.calcBoostedApy },
            {
              title: "Boosting end date",
              value: dayjs().add(vm.days, "day").format("MMM D, YYYY"),
            },
            { title: "Transaction fee", value: "0.005 WAVES" },
          ];
          return (
            <Layout>
              <Root>
                <GoBack link="/invest" text={`Back to ${vm.pool?.title}`} />
                <SizedBox height={24} />
                <Text weight={500} size="large">
                  BoostApy in Puzzle Mega Pools
                </Text>
                <SizedBox height={8} />
                <Subtitle size="medium" fitContent>
                  Select the boosting period, the token and its amount. During
                  this period, the additional reward will be paid evenly to pool
                  investors.
                </Subtitle>
                <SizedBox height={24} />
                <CalcBoostingAmountCard />
                <SizedBox height={24} />
                <Details crossAxisSize="max">
                  {details.map(({ title, value }, i) => (
                    <Row justifyContent="space-between" key={i + "row"}>
                      <Text type="secondary" fitContent>
                        {title}
                      </Text>
                      <Text fitContent>{value}</Text>
                    </Row>
                  ))}
                </Details>
                <SizedBox height={24} />
                <Button fixed disabled={!vm.isAllDataProvided}>
                  {vm.isAllDataProvided ? "Boost" : "Fill the form"}
                </Button>
              </Root>
            </Layout>
          );
        }}
      </Observer>
    </Layout>
  );
};

const BoostApy: React.FC = () => {
  const { poolDomain } = useParams<{ poolDomain: string }>();
  return (
    <BoostApyVmProvider poolDomain={poolDomain ?? ""}>
      <BoostApyImpl />
    </BoostApyVmProvider>
  );
};

export default BoostApy;
