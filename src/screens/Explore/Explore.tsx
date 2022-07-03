import React from "react";
import Layout from "@components/Layout";
import { ExploreVMProvider } from "./ExploreVm";
import ExploreLayout from "@screens/Explore/ExploreLayout";
import Text from "@components/Text";
import SizedBox from "@components/SizedBox";
import TopTokens from "./TopTokens";
import TokensTable from "./TokensTable";

interface IProps {}

const ExploreImpl: React.FC<IProps> = () => {
  return (
    <Layout>
      <ExploreLayout>
        <Text weight={500} size="large">
          Explore cryptocurrencies on Puzzle Swap
        </Text>
        <SizedBox height={8} />
        <Text>
          Learn more about the coins featured on Puzzle Swap: statistics, price
          charts and much more!
        </Text>
        <SizedBox height={24} />
        <TopTokens />
        <SizedBox height={56} />
        <TokensTable />
      </ExploreLayout>
    </Layout>
  );
};

const Explore: React.FC<IProps> = () => (
  <ExploreVMProvider>
    <ExploreImpl />
  </ExploreVMProvider>
);
export default Explore;
