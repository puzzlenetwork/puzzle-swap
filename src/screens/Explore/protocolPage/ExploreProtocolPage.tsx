import React from "react";
import Layout from "@components/Layout";
import Text from "@components/Text";
import SizedBox from "@components/SizedBox";
import { observer } from "mobx-react-lite";
import BasicProtocolInformation from "./BasicProtocolInformation";
import AggregatorHistory from "@screens/Explore/protocolPage/AggregatorHistory";
import MegaPoolsHistory from "@screens/Explore/protocolPage/MegaPoolsHistory";
import ExploreLayout from "@screens/Explore/ExploreLayout";

interface IProps {}

const ExploreProtocolPage: React.FC<IProps> = () => {
  return (
    <Layout>
      <ExploreLayout>
        <Text weight={500} size="large">
          Explore in Puzzle Mega Pools
        </Text>
        <SizedBox height={24} />
        <BasicProtocolInformation />
        <SizedBox height={24} />
        <AggregatorHistory />
        <SizedBox height={24} />
        <MegaPoolsHistory />
      </ExploreLayout>
    </Layout>
  );
};

export default observer(ExploreProtocolPage);
